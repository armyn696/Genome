import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image, Mic, FileText, Globe, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import ResourceList from '../ResourceList';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendImage?: (file: File) => void;
  onSendVoice?: (blob: Blob) => void;
  isLoading?: boolean;
  resources?: any[];
  onResourceSelect?: (resource: any) => void;
  selectedResources?: any[];
  value?: string;
  onChange?: (text: string) => void;
}

export const ChatInput = ({ 
  onSendMessage, 
  onSendImage, 
  onSendVoice, 
  isLoading,
  resources = [],
  onResourceSelect,
  selectedResources = [],
  value = '',
  onChange
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [webBrowsingEnabled, setWebBrowsingEnabled] = useState(false);
  const [academicSearchEnabled, setAcademicSearchEnabled] = useState(false);

  useEffect(() => {
    if (onChange) {
      onChange(value);
    }
  }, [value, onChange]);

  const handleSendMessage = () => {
    if (!value?.trim() || isLoading) return;
    onSendMessage(value);
    onChange?.('');
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
    <div className="p-4 bg-[#181818] backdrop-blur-sm w-full rounded-t-xl">
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
          <Globe className="h-4 w-4" />
          <span className="text-xs">Web Browsing</span>
          <Switch
            checked={webBrowsingEnabled}
            onCheckedChange={setWebBrowsingEnabled}
            className="scale-75"
          />
        </div>

        <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
          <GraduationCap className="h-4 w-4" />
          <span className="text-xs">Search Academic Papers</span>
          <Switch
            checked={academicSearchEnabled}
            onCheckedChange={setAcademicSearchEnabled}
            className="scale-75"
          />
        </div>

        {resources && resources.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-8 px-3 text-sm">
                <FileText className="h-4 w-4" />
                {selectedResources?.length || 0} material(s) selected
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Materials</DialogTitle>
              </DialogHeader>
              <ResourceList
                resources={resources}
                onResourceSelect={onResourceSelect}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
        <div className="flex justify-center items-center gap-2 w-full">
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
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <Textarea
            placeholder="Ask your AI tutor anything..."
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className={cn(
              "shrink-0",
              !value.trim() && "opacity-50 cursor-not-allowed"
            )}
            disabled={!value.trim() || isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
