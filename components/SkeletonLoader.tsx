import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full space-y-3">
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 bg-muted rounded"></div>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="h-4 bg-muted rounded col-span-2"></div>
              <div className="h-4 bg-muted rounded col-span-1"></div>
            </div>
            <div className="h-4 bg-muted rounded"></div>
             <div className="grid grid-cols-4 gap-3">
              <div className="h-4 bg-muted rounded col-span-1"></div>
              <div className="h-4 bg-muted rounded col-span-2"></div>
            </div>
             <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
           <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </div>
       <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 bg-muted rounded"></div>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="h-4 bg-muted rounded col-span-1"></div>
              <div className="h-4 bg-muted rounded col-span-2"></div>
            </div>
             <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
