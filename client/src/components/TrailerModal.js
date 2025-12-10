import React from "react";

const TrailerModal = ({
  isOpen,
  trailerUrl,
  loading,
  onClose,
  loadingText = "Trailer Loading 🎬",
  notFoundText = "Trailer not found.",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-xl w-full max-w-4xl p-4 relative border border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-3xl bg-black/40 w-10 h-10 rounded-full flex items-center justify-center"
        >
          &times;
        </button>

        {loading ? (
          <p className="text-center text-gray-400 py-10 text-xl">
            {loadingText}
          </p>
        ) : trailerUrl ? (
          <iframe
            src={trailerUrl}
            title="Trailer"
            className="w-full h-[400px] rounded-lg border border-gray-700"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>
        ) : (
          <p className="text-center text-gray-400 py-10 text-lg">
            {notFoundText}
          </p>
        )}
      </div>
    </div>
  );
};

export default TrailerModal;
