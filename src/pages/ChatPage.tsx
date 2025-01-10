import { useState } from 'react';
import { Resource } from '@/types';

interface ChatPageProps {
  resources: Resource[];
  onResourceAdd: (newResource: Resource) => void;
  onResourceDelete: (resourceId: string) => void;
}

const ChatPage = ({ resources, onResourceAdd, onResourceDelete }: ChatPageProps) => {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    console.log(message);
    setMessage("");
  };

  return (
    <div>
      <h1>Chat Page</h1>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <div>
        <h2>Your Resources</h2>
        <ul>
          {resources.map((resource) => (
            <li key={resource.id}>
              {resource.name} - {resource.type}
              <button onClick={() => onResourceDelete(resource.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatPage;