import React from "react";

const FavoriteMoviesSection = ({
  title = "Your Favorite Movies",
  movies = [],
  onMovieClick,
  getMoodColor,
}) => {
  if (!movies || movies.length === 0) return null;

  return (
    <>
      <h2 className="text-3xl font-bold mb-4 border-l-4 border-indigo-500 pl-4 flex items-center gap-2 text-indigo-400">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
        {movies.map((fav) => (
          <div
            key={fav._id}
            onClick={() => onMovieClick && onMovieClick(fav)}
            className="bg-cardBg rounded-xl overflow-hidden hover:shadow-indigo-500/30 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group relative cursor-pointer border border-gray-700"
          >
            <div className="relative aspect-square bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
              {fav.posterPath || fav.poster ? (
                <img
                  src={fav.posterPath || fav.poster}
                  alt={fav.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl text-gray-500">🎞️</span>
              )}

              {fav.userMood && getMoodColor && (
                <span
                  className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold shadow-md ${getMoodColor(
                    fav.userMood
                  )}`}
                >
                  {fav.userMood}
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold truncate text-lg text-mainText group-hover:text-indigo-400 transition">
                {fav.title}
              </h3>
              <p className="text-mainText text-sm truncate">
                {fav.releaseDate ? fav.releaseDate.substring(0, 4) : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FavoriteMoviesSection;
