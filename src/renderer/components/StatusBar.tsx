import React from 'react';
import './StatusBar.css';

interface StatusBarProps {
  words: number;
  characters: number;
  readingTimeMinutes: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ words, characters, readingTimeMinutes }) => {
  const readingTimeLabel = words === 0 ? '0 min' : `${Math.max(1, readingTimeMinutes)} min`;

  return (
    <div className="status-bar" role="status" aria-live="polite">
      <div className="status-bar-left">
        <span className="status-item">{words} words</span>
        <span className="status-divider">•</span>
        <span className="status-item">{characters} chars</span>
      </div>
      <div className="status-bar-right">
        <span className="status-item">{readingTimeLabel} read</span>
      </div>
    </div>
  );
};
