import React from 'react';
import './TabBar.css';

export interface TabDocument {
  id: string;
  title: string;
  dirty: boolean;
}

interface TabBarProps {
  documents: TabDocument[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({ documents, activeId, onSelect, onClose, onNew }) => {
  return (
    <div className="tab-bar" role="tablist" aria-label="Documents">
      <div className="tab-bar-tabs">
        {documents.map((doc) => (
          <button
            key={doc.id}
            className={`tab ${doc.id === activeId ? 'active' : ''}`}
            role="tab"
            aria-selected={doc.id === activeId}
            onClick={() => onSelect(doc.id)}
            title={doc.title}
          >
            <span className="tab-title">
              {doc.dirty ? <span className="tab-dirty" aria-hidden="true">•</span> : null}
              {doc.title}
            </span>
            <span
              className="tab-close"
              role="button"
              tabIndex={0}
              aria-label={`Close ${doc.title}`}
              onClick={(e) => {
                e.stopPropagation();
                onClose(doc.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose(doc.id);
                }
              }}
            >
              ×
            </span>
          </button>
        ))}
      </div>

      <button className="tab-new" onClick={onNew} title="New document" aria-label="New document">
        +
      </button>
    </div>
  );
};
