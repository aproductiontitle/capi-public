import { Separator } from "@/components/ui/separator";

const Documentation = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
          <p className="text-muted-foreground">
            Learn how to integrate and use our platform effectively
          </p>
        </div>
        <Separator className="mt-4" />
      </div>

      <div className="flex flex-col gap-12">
        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-6">Platform Overview</h2>
          <p>
            Our platform is a powerful conversational AI solution that enables you to create, manage, and deploy AI assistants for automated phone conversations. The platform integrates with VAPI.ai to provide advanced voice synthesis and natural language processing capabilities.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4">Key Features</h3>
          
          <h4 className="text-lg font-medium mt-6 mb-2">AI Assistants</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create and customize AI assistants with specific personalities and behaviors</li>
            <li>Configure voice settings using advanced text-to-speech technology</li>
            <li>Fine-tune conversation parameters for optimal interaction</li>
            <li>Enable sentiment analysis for better conversation understanding</li>
          </ul>

          <h4 className="text-lg font-medium mt-6 mb-2">Campaign Management</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li>Schedule and manage automated calling campaigns</li>
            <li>Import and manage contact lists</li>
            <li>Track campaign progress and performance in real-time</li>
            <li>Access detailed analytics including call duration and success rates</li>
          </ul>

          <h4 className="text-lg font-medium mt-6 mb-2">Required Configuration</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li>Configure your VAPI API key in Settings to enable voice and phone services</li>
            <li>Set up additional API keys for enhanced features (ElevenLabs, OpenAI)</li>
            <li>Configure webhook endpoints for real-time updates</li>
            <li>Set up error handling and notification preferences</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4">Getting Started</h3>
          
          <h4 className="text-lg font-medium mt-6 mb-2">1. Initial Setup</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li>Navigate to the Settings page to configure your API keys</li>
            <li>Add your VAPI API key for voice and phone services</li>
            <li>Configure additional API keys for enhanced features</li>
            <li>Set up security features and notification preferences</li>
          </ul>

          <h4 className="text-lg font-medium mt-6 mb-2">2. Create Your First Assistant</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li>Go to the Assistants page</li>
            <li>Configure the assistant's personality and behavior</li>
            <li>Set up voice parameters and conversation flow</li>
            <li>Test the assistant's responses</li>
          </ul>

          <h4 className="text-lg font-medium mt-6 mb-2">3. Launch a Campaign</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create a new campaign and select your assistant</li>
            <li>Import or select your contact list</li>
            <li>Choose a phone number for outbound calls</li>
            <li>Schedule the campaign and monitor progress</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4">Best Practices</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Always test assistants thoroughly before launching campaigns</li>
            <li>Start with small contact lists to validate performance</li>
            <li>Monitor campaign metrics to optimize assistant behavior</li>
            <li>Keep your API keys and security settings up to date</li>
            <li>Regularly review call analytics and adjust as needed</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4">Security</h3>
          <p>
            The platform uses private API keys for all external service interactions. These keys are stored securely and are never exposed in the frontend code. Always keep your API keys confidential and regularly rotate them for security.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4">Support</h3>
          <p>
            For additional support or questions about specific features, please contact our support team or refer to the VAPI documentation for detailed API information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Documentation;