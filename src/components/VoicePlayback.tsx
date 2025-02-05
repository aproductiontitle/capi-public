import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Play, Pause, Volume2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from '@/utils/errorHandling';

interface VoicePlaybackProps {
  text: string;
  voiceId: string;
  onPlaybackComplete?: () => void;
}

const VoicePlayback = ({ text, voiceId, onPlaybackComplete }: VoicePlaybackProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const synthesizeSpeech = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('voice-synthesis', {
        body: { text, voiceId },
      });

      if (error) {
        throw new Error(`Speech synthesis failed: ${error.message}`);
      }

      if (data.audio) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.volume = volume;
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        throw new Error('No audio data received from synthesis');
      }
    } catch (error) {
      console.error('VoicePlayback error:', error);
      toast({
        title: "Speech Synthesis Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = async () => {
    try {
      if (!audioRef.current?.src) {
        await synthesizeSpeech();
      } else {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast({
        title: "Playback Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleVolumeChange = (value: number[]) => {
    try {
      const newVolume = value[0];
      setVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    } catch (error) {
      console.error('Volume control error:', error);
      toast({
        title: "Volume Control Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Button
        variant="outline"
        size="icon"
        onClick={togglePlayback}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      
      <div className="flex items-center space-x-2">
        <Volume2 className="h-4 w-4" />
        <Slider
          value={[volume]}
          onValueChange={handleVolumeChange}
          max={1}
          step={0.1}
          className="w-24"
        />
      </div>

      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
          onPlaybackComplete?.();
        }}
        onError={(e) => {
          const error = e.currentTarget.error;
          console.error('Audio playback error:', error);
          toast({
            title: "Audio Playback Error",
            description: error?.message || "Failed to play audio",
            variant: "destructive",
          });
        }}
      />
    </div>
  );
};

export default VoicePlayback;