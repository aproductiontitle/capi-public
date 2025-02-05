import { cn } from '@/lib/utils';
import VoicePlayback from '@/components/VoicePlayback';

type MessageProps = {
  content: string;
  role: 'user' | 'assistant';
  className?: string;
};

export const Message = ({ content, role, className }: MessageProps) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        role === 'user' ? 'items-end' : 'items-start',
        className
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg p-3',
          role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {content}
      </div>
      {role === 'assistant' && (
        <VoicePlayback 
          text={content}
          voiceId="EXAVITQu4vr4xnSDxMaL"
        />
      )}
    </div>
  );
};