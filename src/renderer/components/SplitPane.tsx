import React, { useState, useRef, useEffect, useCallback } from 'react';
import './SplitPane.css';

interface SplitPaneProps {
  left: React.ReactNode;
  right?: React.ReactNode;
  showRight?: boolean;
  defaultSplit?: number; // Percentage (0-100)
  minSize?: number; // Minimum pane size in pixels
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  showRight = true,
  defaultSplit = 50,
  minSize = 200,
}) => {
  const [split, setSplit] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      
      // Calculate new split position
      const mouseX = e.clientX - containerRect.left;
      let newSplit = (mouseX / containerWidth) * 100;

      // Apply min/max constraints
      const minPercent = (minSize / containerWidth) * 100;
      const maxPercent = 100 - minPercent;
      
      newSplit = Math.max(minPercent, Math.min(maxPercent, newSplit));
      
      setSplit(newSplit);
    },
    [isDragging, minSize]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Save split position to localStorage
  useEffect(() => {
    localStorage.setItem('split-position', split.toString());
  }, [split]);

  // Load split position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('split-position');
    if (saved) {
      setSplit(parseFloat(saved));
    }
  }, []);

  const shouldShowRight = showRight && !!right;

  return (
    <div ref={containerRef} className={`split-pane ${isDragging ? 'dragging' : ''}`}>
      {shouldShowRight ? (
        <>
          <div className="split-pane-left" style={{ width: `${split}%` }}>
            {left}
          </div>

          <div
            className="split-pane-divider"
            onMouseDown={handleMouseDown}
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={split}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                setSplit(Math.max((minSize / containerRef.current!.offsetWidth) * 100, split - 1));
              } else if (e.key === 'ArrowRight') {
                setSplit(Math.min(100 - (minSize / containerRef.current!.offsetWidth) * 100, split + 1));
              }
            }}
          >
            <div className="split-pane-divider-handle">
              <svg width="4" height="24" viewBox="0 0 4 24" fill="none">
                <circle cx="2" cy="6" r="1" fill="currentColor" />
                <circle cx="2" cy="12" r="1" fill="currentColor" />
                <circle cx="2" cy="18" r="1" fill="currentColor" />
              </svg>
            </div>
          </div>

          <div className="split-pane-right" style={{ width: `${100 - split}%` }}>
            {right}
          </div>
        </>
      ) : (
        <div className="split-pane-left" style={{ width: '100%' }}>
          {left}
        </div>
      )}
    </div>
  );
};
