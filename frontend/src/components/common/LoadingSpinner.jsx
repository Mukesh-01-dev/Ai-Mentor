import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-teal-500/20 rounded-full" />
        <div className="absolute top-0 left-0 w-full h-full border-4 border-teal-500 border-t-transparent rounded-full animate-spin shadow-lg" />
      </div>
    </div>
  );
};

export default LoadingSpinner;
