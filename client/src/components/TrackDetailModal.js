// src/components/TrackDetailModal.js
import React from "react";

const TrackDetailModal = ({
  open,
  track,
  loading,
  onClose,
  onPlay,
  onFavorite,
  // PROFILE EKLERİ:
  onRemove,         // () => void
  moodLabel,        // string
  moodColorClass,   // string
  onChangeMood,     // () => void
}) => {
  if (!open || !track) return null;

  // 🔹 Hem Songs hem Profile datasıyla uyumlu alanlar
  const cover = track.image || track.albumCover;
  const title = track.title || track.name;
  const artist = track.artist;
  const album = track.album || track.albumName;
  const releaseDate = track.releaseDate || track.release_date || "";
  const popularity = track.popularity ?? 0;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-mainBg rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
        >
          ×
        </button>

        {/* Loading */}
        {loading ? (
          <div className="p-20 w-full text-indigo-400 text-xl text-center">
            Loading Details...
          </div>
        ) : (
          <>
            {/* Image */}
            <div className="w-full md:w-1/2 h-80 md:h-auto relative">
              {cover ? (
                <img
                  src={cover}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-600">
                  🎵 No Cover
                </div>
              )}
            </div>

            {/* Content */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
              <h2 className="text-3xl font-bold  mb-2">
                {title}
              </h2>
              <p className="text-xl text-indigo-400 mb-6">
                {artist}
              </p>

              <div className="space-y-3 text-sm mb-8">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span>Album</span>
                  <span>{album}</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span>Release Date</span>
                  <span>{releaseDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Popularity</span>
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${popularity}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* MOOD SATIRI (Profile için, varsa) */}
              {moodLabel && onChangeMood && (
                <div className="flex justify-between items-center mb-6">
                  <span className="">Mood</span>
                  <button
                    onClick={onChangeMood}
                    className={`px-3 py-1 rounded-full text-xs font-bold hover:scale-105 transition ${moodColorClass}`}
                  >
                    {moodLabel}
                  </button>
                </div>
              )}

              {/* BUTTONLAR */}
              <div className="flex gap-4 mt-auto flex-wrap">
                {onPlay && (
                  <button
                    onClick={onPlay}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg"
                  >
                    Play Now
                  </button>
                )}

                {onFavorite && (
                  <button
                    onClick={onFavorite}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold border border-gray-600"
                  >
                    Add To Favorites
                  </button>
                )}

                {onRemove && (
                  <button
                    onClick={onRemove}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackDetailModal;
