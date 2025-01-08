import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendImage?: (file: File) => void;
  onSendVoice?: (blob: Blob) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, onSendImage, onSendVoice, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleSendMessage = () => {
    if (!message.trim() || isLoading) return;
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
    <div className="border-t p-4 bg-background/95 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto flex items-center gap-2 bg-muted rounded-lg p-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 hover:bg-background/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "shrink-0 hover:bg-background/50",
            isRecording && "text-red-500 animate-pulse"
          )}
          onClick={isRecording ? stopRecording : startRecording}
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Textarea
          placeholder="Ask your AI tutor anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[44px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
          rows={1}
        />
        <Button
          onClick={handleSendMessage}
          size="icon"
          className={cn(
            "shrink-0",
            !message.trim() && "opacity-50 cursor-not-allowed"
          )}
          disabled={!message.trim() || isLoading}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};