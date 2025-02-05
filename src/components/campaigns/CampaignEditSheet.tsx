import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Campaign } from "./types";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { X, Save } from "lucide-react";

interface CampaignEditSheetProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignEditSheet = ({ campaign, isOpen, onClose }: CampaignEditSheetProps) => {
  const [name, setName] = useState(campaign?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!campaign) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ name })
        .eq("id", campaign.id);

      if (error) throw error;
      
      toast.success("Campaign updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error("Failed to update campaign");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Edit Campaign</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Campaign Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter campaign name"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !name.trim()}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};