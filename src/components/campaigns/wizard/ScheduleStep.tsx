import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignFormData } from "./types";
import { format } from "date-fns";

interface ScheduleStepProps {
  campaignData: CampaignFormData;
  onDataChange: (data: Partial<CampaignFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
];

export const ScheduleStep = ({ campaignData, onDataChange, onNext, onBack }: ScheduleStepProps) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Launch Settings</CardTitle>
        <CardDescription>Choose when to run your campaign</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={campaignData.launchType}
          onValueChange={(value) => onDataChange({ launchType: value as 'scheduled' | 'immediate' })}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem
              value="immediate"
              id="immediate"
              className="peer sr-only"
            />
            <Label
              htmlFor="immediate"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span className="text-sm font-medium">Launch Now</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="scheduled"
              id="scheduled"
              className="peer sr-only"
            />
            <Label
              htmlFor="scheduled"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span className="text-sm font-medium">Schedule for Later</span>
            </Label>
          </div>
        </RadioGroup>

        {campaignData.launchType === 'scheduled' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <Calendar
                mode="single"
                selected={campaignData.selectedDate}
                onSelect={(date) => onDataChange({ selectedDate: date })}
                className="rounded-md border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Select Time</label>
              <Input
                type="time"
                value={campaignData.selectedTime}
                onChange={(e) => onDataChange({ selectedTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Zone</label>
              <Select
                value={campaignData.timezone || "UTC"}
                onValueChange={(value) => onDataChange({ timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {campaignData.selectedDate && (
                <p className="text-sm text-muted-foreground mt-2">
                  Campaign will run at {campaignData.selectedTime} {campaignData.timezone || "UTC"}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={campaignData.launchType === 'scheduled' && !campaignData.selectedDate}
        >
          Next
        </Button>
      </CardFooter>
    </>
  );
};