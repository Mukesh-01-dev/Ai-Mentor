import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Subtitles } from "lucide-react";

const VideoPlayer = ({
  currentLesson,
  aiVideoUrl,
  selectedCelebrity,
  celebrityVideoMap,
  activeCaption,
  playerContainerRef,
  videoRef,
  handleProgress,
  isAIVideoLoading,
  isPlaying,
  volume,
  isMuted,
  progress,
  isFullscreen,
  duration,
  currentTime,
  togglePlay,
  handleVolumeChange,
  toggleMute,
  handleSeek,
  toggleFullscreen,
  formatTime,
  onEnded,
}) => {


  const [isBuffering, setIsBuffering] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const v = videoRef?.current;
    if (!v) return;

    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onLoadStart = () => setIsBuffering(true);

    v.addEventListener("waiting", onWaiting);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("loadstart", onLoadStart);

    return () => {
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadstart", onLoadStart);
    };
  }, [videoRef]);

  // Sync isPlaying state with actual video element
  useEffect(() => {
    const v = videoRef?.current;
    if (!v) return;

    if (isPlaying) {
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.catch(err => console.warn("Auto-play blocked:", err));
      }
    } else {
      v.pause();
    }
  }, [isPlaying, videoRef, aiVideoUrl]);

  // Unified loading state: either AI is being generated OR the video is buffering bytes
  const showLoading = isAIVideoLoading || isBuffering;

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={playerContainerRef}
      className="relative bg-black rounded-lg overflow-hidden shadow-lg mb-6 aspect-video"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={
          aiVideoUrl ||
          (selectedCelebrity && celebrityVideoMap[selectedCelebrity]?.video) ||
          currentLesson?.videoUrl
        }
        className="w-full h-full object-contain"
        onTimeUpdate={handleProgress}
        onLoadedMetadata={handleProgress}
        controls={false}
        playsInline
        onClick={togglePlay}
        onEnded={onEnded}
      />

      {/* Loading Overlay (Original Style) */}
      {showLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white mt-2 text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* Caption Overlay */}
      {activeCaption && showCaptions && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center px-4">
          <div className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg text-center max-w-3xl text-sm leading-snug shadow-xl">
            {activeCaption}
          </div>
        </div>
      )}

      {/* Custom Video Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Progress Bar */}
        <div
          className="w-full bg-gray-600 rounded-full h-1.5 cursor-pointer mb-3 hover:h-2 transition-all"
          onClick={handleSeek}
        >
          <div
            className="bg-blue-600 h-full rounded-full transition-all pointer-events-none"  // 👈 add pointer-events-none
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="hover:text-blue-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="hover:text-blue-400 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCaptions(prev => !prev)}
              className={`transition-colors ${showCaptions ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
              title={showCaptions ? 'Hide captions' : 'Show captions'}
            >
              <Subtitles className="w-6 h-6" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="hover:text-blue-400 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;