import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface ChatMessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  onSendImage?: (file: File) => void;
  onSendVoice?: (blob: Blob) => void;
  isLoading?: boolean;
}

export const ChatMessageInput = ({
  message,
  setMessage,
  onSendMessage,
  onSendImage,
  onSendVoice,
  isLoading
}: ChatMessageInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendImage) {
      onSendImage(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        if (onSendVoice) {
          onSendVoice(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 w-full bg-muted rounded-lg p-1.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 hover:bg-background/50"
        onClick={() => fileInputRef.current?.click()}
      >
        <Image className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7 shrink-0 hover:bg-background/50",
          isRecording && "text-red-500 animate-pulse"
        )}
        onClick={isRecording ? stopRecording : startRecording}
      >
        <Mic className="h-4 w-4" />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
      <Textarea
        placeholder="Ask your AI tutor anything..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[36px] max-h-[120px] text-sm resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 flex-1"
        rows={1}
      />
      <Button
        onClick={onSendMessage}
        size="icon"
        className={cn(
          "h-7 w-7 shrink-0",
          !message.trim() && "opacity-50 cursor-not-allowed"
        )}
        disabled={!message.trim() || isLoading}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};