import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

interface ChartSectionProps {
  callsByDay: Array<{ date: string; count: number }>;
  sentiments: Record<string, number>;
}

export const ChartSection = ({ callsByDay, sentiments }: ChartSectionProps) => {
  const SENTIMENT_COLORS = {
    positive: '#22c55e',
    neutral: '#64748b',
    negative: '#ef4444',
  };

  // Format dates for better display
  const formattedCallsByDay = callsByDay.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM d'),
    count: Number(item.count)
  }));

  // Transform sentiment data for the pie chart
  const sentimentData = Object.entries(sentiments).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Number(value)
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Daily Call Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[300px]" config={{}}>
            <BarChart data={formattedCallsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tick={{ fill: '#888888' }}
                tickLine={{ stroke: '#888888' }}
                axisLine={{ stroke: '#888888' }}
              />
              <YAxis 
                tick={{ fill: '#888888' }}
                tickLine={{ stroke: '#888888' }}
                axisLine={{ stroke: '#888888' }}
                width={40}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="count" 
                fill="#3b82f6"
                name="Calls"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[300px]" config={{}}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {sentimentData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={SENTIMENT_COLORS[entry.name.toLowerCase() as keyof typeof SENTIMENT_COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};