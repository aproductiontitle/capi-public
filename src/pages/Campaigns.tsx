import { CampaignList } from "@/components/campaigns/CampaignList";
import { CampaignWizard } from "@/components/campaigns/CampaignWizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const Campaigns = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage your calling campaigns
          </p>
        </div>
        <Separator className="mt-4" />
      </div>

      <div className="flex flex-col gap-12">
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="list">All Campaigns</TabsTrigger>
            <TabsTrigger value="create">Create Campaign</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <CampaignList />
          </TabsContent>

          <TabsContent value="create">
            <CampaignWizard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Campaigns;