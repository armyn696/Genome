import { useState } from "react";
import { Resource } from "@/types"; // Adjust the import path as necessary

interface MatchGamePageProps {
  resources: Resource[];
  onResourceAdd: (newResource: Resource) => void;
  onResourceDelete: (resourceId: string) => void;
}

const MatchGamePage = ({ resources, onResourceAdd, onResourceDelete }: MatchGamePageProps) => {
  const [gameData, setGameData] = useState([]);

  const handleGameStart = () => {
    // Logic to start the match game
  };

  return (
    <div>
      <h1>Match Game</h1>
      <button onClick={handleGameStart}>Start Game</button>
      <div>
        {resources.map(resource => (
          <div key={resource.id}>
            <h2>{resource.name}</h2>
            <button onClick={() => onResourceDelete(resource.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchGamePage;
