// src/components/MovieDetailModal.js
import React from "react";

const MovieDetailModal = ({
  movie,
  loading,
  onClose,
  onFavorite,
  onWatchTrailer,
  // PROFILE İÇİN EKLENENLER:
  onRemove,          // () => void
  showCloseButton,   // true/false
  moodLabel,         // string, örn: "Happy"
  moodColorClass,    // string, örn: "bg-yellow-500 text-black"
  onChangeMood,      // () => void
}) => {
  // Profil sayfasında movie yoksa ya da card açılmamışsa hiç gösterme
  if (!movie) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-mainBg rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE (X) BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
        >
          ×
        </button>

        {/* LOADING STATE */}
        {loading ? (
          <div className="p-20 w-full text-center text-xl">Loading...</div>
        ) : (
          <>
            {/* POSTER */}
            <div className="w-full md:w-1/3 h-96 md:h-auto relative">
              <img
                src={movie.poster || movie.posterPath}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* CONTENT */}
            <div className="w-full md:w-2/3 p-8 flex flex-col">
              <h2 className="text-3xl font-bold mb-2">
                {movie.title}
              </h2>

              {/* Genres */}
              <div className="flex flex-wrap gap-3 mb-4">
                {movie.genres?.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-full text-xs text-gray-300"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Overview */}
              <p className="leading-relaxed mb-6">
                {movie.overview}
              </p>

              {/* Director + Cast */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-bold mb-2 border-b border-gray-700 pb-1">
                    Director
                  </h4>
                  <p>{movie.director}</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2 border-b border-gray-700 pb-1">
                    Cast
                  </h4>
                  <div className="flex flex-col gap-2">
                    {movie.cast?.map((actor) => (
                      <div key={actor.name} className="flex items-center gap-3">
                        <img
                          src={actor.photo || "https://via.placeholder.com/50"}
                          alt={actor.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="text-sm">{actor.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MOOD SATIRI (sadece Profile için, props gelirse) */}
              {moodLabel && onChangeMood && (
                <div className="flex justify-between pt-4 items-center mb-6">
                  <span className="">Mood</span>
                  <button
                    onClick={onChangeMood}
                    className={`px-3 py-1 rounded-full text-xs font-bold hover:scale-105 transition ${moodColorClass}`}
                  >
                    {moodLabel}
                  </button>
                </div>
              )}

              {/* FOOTER BUTTONLAR */}
              <div className="mt-auto pt-4 border-t border-gray-700 flex gap-4 flex-wrap">
                {/* Movies / Home sayfaları için */}
                {onWatchTrailer && (
                  <button
                    onClick={onWatchTrailer}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-bold"
                  >
                    Watch Trailer
                  </button>
                )}

                {onFavorite && (
                  <button
                    onClick={onFavorite}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold border border-gray-600"
                  >
                    Add to Favorites
                  </button>
                )}

                {/* Profile sayfası için */}

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

export default MovieDetailModal;
