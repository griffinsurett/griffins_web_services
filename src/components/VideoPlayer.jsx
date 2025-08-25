// src/components/VideoPlayer.jsx
import React from "react";

const VideoPlayer = React.forwardRef(
  (
    {
      src,
      onTimeUpdate,
      onEnded,
      onLoadedData,
      desktop = false,
      className = "",
      poster,
      ...props
    },
    ref
  ) => {
    const baseClasses = desktop
      ? "w-full h-96 object-cover rounded-xl"
      : "w-full h-48 object-cover rounded-xl";

    return (
      <div className="relative rounded-xl overflow-hidden bg-tertiary-bg">
        <video
          ref={ref}
          src={src}
          poster={poster}
          controls={desktop}
          autoPlay
          muted
          playsInline
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          onLoadedData={onLoadedData}
          className={`${baseClasses} ${className}`}
          {...props}
        />

        {/* Loading state overlay */}
        <div className="absolute inset-0 bg-bg-bg3 flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
