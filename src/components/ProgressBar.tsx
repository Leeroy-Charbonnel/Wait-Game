import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showText?: boolean;
  customText?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  height = 15, 
  showText = false,
  customText,
  className = ''
}) => {
  //Ensure progress is between 0-100
  const safeProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div 
      className={`progress-container ${className}`}
      style={{ height: `${height}px` }}
    >
      <div 
        className="progress-bar"
        style={{ width: `${safeProgress}%` }}
      ></div>
      
      {showText && (
        <div className="progress-text">
          {customText || `${Math.round(safeProgress)}%`}
        </div>
      )}
    </div>
  );
};