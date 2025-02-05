import { useEffect, useRef } from 'react';
import { useConversation } from '@/hooks/useConversation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const ConversationView = () => {
  const {
    messages,
    isProcessing,
    processUserMessage,
  } = useConversation();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.current?.value.trim() || isProcessing) return;
    
    const message = inputRef.current.value;
    inputRef.current.value = '';
    await processUserMessage(message);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted mr-4'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            disabled={isProcessing}
          />
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};