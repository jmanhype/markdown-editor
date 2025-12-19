import React, { useRef } from 'react';
import '../styles/preview.css';

interface PreviewProps {
  html: string;
}

export const Preview: React.FC<PreviewProps> = ({ html }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="preview-container">
      {html ? (
        <div
          ref={contentRef}
          className="preview-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="preview-empty">
          Your preview will appear here...
        </div>
      )}
    </div>
  );
};
