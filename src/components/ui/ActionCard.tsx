import React from 'react';
import './ActionCard.css';

interface ActionCardProps {
  command: string;
  onAccept: () => void;
  onReject: () => void;
  status?: 'pending' | 'accepted' | 'rejected';
}

const ActionCard: React.FC<ActionCardProps> = ({ command, onAccept, onReject, status = 'pending' }) => {
  return (
    <div className={`action-card ${status !== 'pending' ? `action-card-${status}` : ''}`}>
      <div className="command-row" dir="rtl">
        <span className="prompt">&gt;</span>
        <span className="command">{command}</span>
        {/* دکمه کپی حذف شد */}
      </div>
      <div className="prompt-row">
        {status === 'pending' ? (
          <>
            <span className="prompt-text">Run command?</span>
            <div className="buttons">
              <button className="accept-button" onClick={onAccept}>Accept</button>
              <button className="reject-button" onClick={onReject}>Reject</button>
            </div>
          </>
        ) : status === 'accepted' ? (
          <span className="prompt-text status-text success-text">✓ دستور اجرا شد</span>
        ) : (
          <span className="prompt-text status-text reject-text">✗ دستور رد شد</span>
        )}
      </div>
    </div>
  );
};

export default ActionCard;