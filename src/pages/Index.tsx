import { ChartSection } from "@/components/dashboard/ChartSection";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { SystemStatus } from "@/components/dashboard/SystemStatus";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";

const Index = () => {
  // Set date range for the current week
  const dateRange = {
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date())
  };

  // Fetch calls by day data
  const { data: callsByDay = [] } = useQuery({
    queryKey: ['callsByDay', dateRange],
    queryFn: async () => {
      const { data: calls } = await supabase
        .from('campaign_contacts')
        .select('created_at, status')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (!calls) return [];

      // Create an array of all days in the range
      const daysInRange = eachDayOfInterval({
        start: dateRange.from,
        end: dateRange.to
      });

      // Initialize counts for each day
      const dailyCounts = daysInRange.reduce((acc: Record<string, number>, day) => {
        acc[format(day, 'yyyy-MM-dd')] = 0;
        return acc;
      }, {});

      // Count calls for each day
      calls.forEach(call => {
        const day = format(new Date(call.created_at), 'yyyy-MM-dd');
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      });

      // Convert to array format
      return Object.entries(dailyCounts).map(([date, count]) => ({
        date,
        count
      }));
    }
  });

  // Get sentiments data with proper initialization and error handling
  const { data: sentiments = { positive: 0, neutral: 0, negative: 0 } } = useQuery({
    queryKey: ['sentiments', dateRange],
    queryFn: async () => {
      const { data: contacts, error } = await supabase
        .from('campaign_contacts')
        .select('sentiment')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .not('sentiment', 'is', null);

      if (error) {
        console.error('Error fetching sentiments:', error);
        return { positive: 0, neutral: 0, negative: 0 };
      }

      // Initialize with default values to ensure all sentiments are represented
      const sentimentCounts = contacts.reduce((acc: Record<string, number>, curr) => {
        if (curr.sentiment) {
          acc[curr.sentiment.toLowerCase()] = (acc[curr.sentiment.toLowerCase()] || 0) + 1;
        }
        return acc;
      }, { positive: 0, neutral: 0, negative: 0 });

      return sentimentCounts;
    }
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your system's performance and statistics
          </p>
        </div>
        <Separator className="mt-4" />
      </div>

      <div className="flex flex-col gap-12">
        <StatsOverview dateRange={dateRange} />
        <ChartSection 
          callsByDay={callsByDay}
          sentiments={sentiments}
        />
        <SystemStatus />
      </div>
    </div>
  );
};

export default Index;