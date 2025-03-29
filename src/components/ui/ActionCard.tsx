import React from 'react';
import './ActionCard.css';

interface ActionCardProps {
  command: string;
  onAccept: () => void;
  onReject: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ command, onAccept, onReject }) => {
  return (
    <div className="action-card">
      <div className="command-row" dir="rtl">
        <span className="prompt">&gt;</span>
        <span className="command">{command}</span>
        {/* دکمه کپی حذف شد */}
      </div>
      <div className="prompt-row">
        <span className="prompt-text">Run command?</span>
        <div className="buttons">
          <button className="accept-button" onClick={onAccept}>Accept</button>
          <button className="reject-button" onClick={onReject}>Reject</button>
        </div>
      </div>
    </div>
  );
};

export default ActionCard;