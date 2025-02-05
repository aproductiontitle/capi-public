import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Phone } from "lucide-react";
import { PhoneNumberOption } from "../types/phoneNumber";
import { phoneNumberSDK } from "../services/vapi/PhoneNumberSDK";
import { toast } from "sonner";

interface PhoneStepProps {
  selectedPhoneNumber?: string;
  onPhoneSelect: (phoneNumber: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PhoneStep = ({
  selectedPhoneNumber,
  onPhoneSelect,
  onNext,
  onBack,
}: PhoneStepProps) => {
  const { data: phoneNumbers, isLoading, error } = useQuery({
    queryKey: ["phone-numbers"],
    queryFn: async () => {
      try {
        return await phoneNumberSDK.getAvailablePhoneNumbers();
      } catch (error) {
        console.error("Error fetching phone numbers:", error);
        toast.error("Failed to fetch phone numbers");
        return [];
      }
    },
  });

  const formatPhoneNumber = (number: PhoneNumberOption) => {
    const status = number.isAvailable ? 'Available' : 'In Use';
    const provider = number.provider.charAt(0).toUpperCase() + number.provider.slice(1);
    return `${number.phoneNumber} (${provider} - ${status})`;
  };

  const getValidPhoneNumbers = () => {
    if (!phoneNumbers) return [];
    return phoneNumbers
      .filter(number => number.phoneNumber && number.phoneNumber.trim() !== '')
      .sort((a, b) => {
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        return a.phoneNumber.localeCompare(b.phoneNumber);
      });
  };

  const validNumbers = getValidPhoneNumbers();
  const hasValidNumbers = validNumbers.length > 0;

  if (error) {
    console.error("Phone number fetch error:", error);
  }

  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Select Phone Number</h2>
          <p className="text-muted-foreground">
            Choose a phone number for outbound calls from your configured Twilio or Vonage numbers
          </p>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <Select
                value={selectedPhoneNumber}
                onValueChange={onPhoneSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a phone number">
                    {selectedPhoneNumber ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedPhoneNumber}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>Select a phone number</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Numbers</SelectLabel>
                    {hasValidNumbers ? (
                      validNumbers.map((number) => (
                        <SelectItem
                          key={number.id}
                          value={number.phoneNumber}
                          disabled={!number.isAvailable}
                        >
                          {formatPhoneNumber(number)}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-sm text-muted-foreground">
                        No phone numbers available. Configure Twilio or Vonage numbers in Settings.
                      </div>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <p className="text-sm text-muted-foreground">
                Phone numbers can be configured through Twilio or Vonage in the Settings page.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!selectedPhoneNumber}
            className="bg-[#53DEB5] hover:bg-[#53DEB5]/90 text-white"
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};