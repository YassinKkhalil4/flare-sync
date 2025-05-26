
import React from 'react';
import { Video, Image as ImageIcon } from 'lucide-react';

interface MediaPreviewProps {
  url: string;
  className?: string;
  showControls?: boolean;
  showIcon?: boolean;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ 
  url, 
  className = "", 
  showControls = false,
  showIcon = true 
}) => {
  const isVideoFile = (url: string) => {
    return url && (url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('video'));
  };

  return (
    <div className={`relative ${className}`}>
      {isVideoFile(url) ? (
        <>
          <video
            src={url}
            className="w-full h-full object-cover rounded-lg"
            controls={showControls}
            preload="metadata"
          />
          {showIcon && (
            <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1">
              <Video className="h-3 w-3 text-white" />
            </div>
          )}
        </>
      ) : (
        <>
          <img
            src={url}
            alt="Media preview"
            className="w-full h-full object-cover rounded-lg"
          />
          {showIcon && (
            <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1">
              <ImageIcon className="h-3 w-3 text-white" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaPreview;
