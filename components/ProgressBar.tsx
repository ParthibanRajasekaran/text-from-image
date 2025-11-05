import React from 'react';

export const ProgressBar: React.FC = () => {
  return (
    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
      <div className="h-full w-full bg-primary animate-progress origin-left-right"></div>
    </div>
  );
};
