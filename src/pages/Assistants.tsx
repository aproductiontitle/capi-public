import { AssistantForm } from '@/components/assistants/AssistantForm';
import AssistantList from '@/components/assistants/AssistantList';
import { useQueryClient } from '@tanstack/react-query';
import { Separator } from "@/components/ui/separator";

const Assistants = () => {
  const queryClient = useQueryClient();

  const handleAssistantCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['assistants'] });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Assistants</h1>
          <p className="text-muted-foreground">
            Create and manage your AI assistants
          </p>
        </div>
        <Separator className="mt-4" />
      </div>
      
      <div className="flex flex-col gap-12">
        <section>
          <h2 className="text-2xl font-semibold mb-6">Create New Assistant</h2>
          <AssistantForm onSuccess={handleAssistantCreated} />
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-6">Your Assistants</h2>
          <AssistantList />
        </section>
      </div>
    </div>
  );
};

export default Assistants;