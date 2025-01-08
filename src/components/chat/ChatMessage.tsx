import { cn } from "@/lib/utils";

interface ChatMessageProps {
  text: string;
  sender: 'user' | 'ai';
  image?: string;
  audio?: string;
}

export const ChatMessage = ({ text, sender, image, audio }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full",
        sender === 'user' ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          sender === 'user'
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-muted"
        )}
      >
        {text}
        {image && (
          <img
            src={image}
            alt="Uploaded content"
            className="mt-2 rounded-md max-w-full"
          />
        )}
        {audio && (
          <audio controls className="mt-2 w-full">
            <source src={audio} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    </div>
  );
};