import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Subtitles,
} from "lucide-react";

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

  // Handle buffering states
  useEffect(() => {
    const v = videoRef?.current;
    if (!v) return;

    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onLoadedData = () => setIsBuffering(false);
    const onLoadStart = () => setIsBuffering(true);
    const onError = () => setIsBuffering(false);

    v.addEventListener("waiting", onWaiting);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("loadeddata", onLoadedData);
    v.addEventListener("loadstart", onLoadStart);
    v.addEventListener("error", onError);

    return () => {
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadeddata", onLoadedData);
      v.removeEventListener("loadstart", onLoadStart);
      v.removeEventListener("error", onError);
    };
  }, [videoRef]);

  // Sync play/pause state with video element
  useEffect(() => {
    const v = videoRef?.current;
    if (!v) return;

    if (isPlaying) {
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.catch((err) => console.warn("Autoplay blocked:", err));
      }
    } else {
      v.pause();
    }
  }, [isPlaying, aiVideoUrl]);

  // Unified loading state
  const showLoading = isAIVideoLoading || isBuffering;

  // Auto-hide controls
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
      {/* Video — key prop forces reload when source changes */}
      <video
        key={aiVideoUrl || selectedCelebrity || currentLesson?.id}
        ref={videoRef}
        src={
          aiVideoUrl ||
          (selectedCelebrity
            ? celebrityVideoMap[selectedCelebrity]?.video
            : currentLesson?.videoUrl)
        }
        className="w-full h-full object-contain"
        preload="metadata"
        controls={false}
        playsInline
        onClick={togglePlay}
        onEnded={onEnded}
        onTimeUpdate={handleProgress}
        onLoadedMetadata={handleProgress}
      />

      {/* Loading Overlay */}
      {showLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            <p className="text-white mt-2 text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* Caption Overlay */}
      {activeCaption && showCaptions && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center px-4">
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-center max-w-3xl text-sm leading-snug shadow-xl">
            {activeCaption}
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Progress Bar */}
        <div
          className="w-full bg-gray-600 rounded-full h-1.5 cursor-pointer mb-3 hover:h-2 transition-all"
          onClick={handleSeek}
        >
          <div
            className="bg-blue-600 h-full rounded-full transition-all pointer-events-none"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between text-white">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="hover:text-blue-400 transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="hover:text-blue-400 transition-colors">
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

            {/* Timer */}
            <div className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Captions toggle */}
            <button
              onClick={() => setShowCaptions((prev) => !prev)}
              className={`transition-colors ${showCaptions ? "text-blue-400" : "text-gray-400 hover:text-white"
                }`}
              title={showCaptions ? "Hide captions" : "Show captions"}
            >
              <Subtitles className="w-6 h-6" />
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="hover:text-blue-400 transition-colors">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;