import { useState } from 'react';
import { ChatToolbarOptions } from './ChatToolbarOptions';
import { ChatMessageInput } from './ChatMessageInput';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendImage?: (file: File) => void;
  onSendVoice?: (blob: Blob) => void;
  isLoading?: boolean;
  resources?: any[];
  onResourceSelect?: (resource: any) => void;
  selectedResources?: any[];
}

export const ChatInput = ({ 
  onSendMessage, 
  onSendImage, 
  onSendVoice, 
  isLoading,
  resources = [],
  onResourceSelect,
  selectedResources = []
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [webBrowsingEnabled, setWebBrowsingEnabled] = useState(false);
  const [academicSearchEnabled, setAcademicSearchEnabled] = useState(false);

  const handleSendMessage = () => {
    if (!message.trim() || isLoading) return;
    onSendMessage(message);
    setMessage('');
  };

  return (
    <div className="border-t p-3 bg-background/95 backdrop-blur-sm space-y-2 w-full">
      <ChatToolbarOptions
        webBrowsingEnabled={webBrowsingEnabled}
        setWebBrowsingEnabled={setWebBrowsingEnabled}
        academicSearchEnabled={academicSearchEnabled}
        setAcademicSearchEnabled={setAcademicSearchEnabled}
        resources={resources}
        onResourceSelect={onResourceSelect}
        selectedResources={selectedResources}
      />
      <ChatMessageInput
        message={message}
        setMessage={setMessage}
        onSendMessage={handleSendMessage}
        onSendImage={onSendImage}
        onSendVoice={onSendVoice}
        isLoading={isLoading}
      />
    </div>
  );
};