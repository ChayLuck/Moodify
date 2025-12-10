import React from "react";

const PlayerBar = ({
  trackId,
  onClose,
  borderColorClass = "border-indigo-400",
  zIndexClass = "z-[70]",
  title = "Spotify Player",
}) => {
  if (!trackId) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-black/90 border-t ${borderColorClass} p-4 backdrop-blur-lg ${zIndexClass} shadow-2xl`}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <iframe
            src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0&autoplay=1`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-lg shadow-lg bg-black"
            title={title}
          ></iframe>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-500 transition text-3xl px-4"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default PlayerBar;
