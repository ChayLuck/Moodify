import React from "react";

const TrendingMoviesSection = ({
  title = "Trending Movies",
  movies = [],
  loading = false,
  loadingText = "Loading trending movies...",
  onMovieClick,
}) => {
  return (
    <div className="container mx-auto px-6 mt-16">
      {/* Başlık */}
      <h2 className="text-3xl font-bold mb-8 border-l-4 border-yellow-500 pl-4 flex items-center gap-2 text-yellow-500">
        {title}
      </h2>

      {/* Loading */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">{loadingText}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => onMovieClick && onMovieClick(movie)}
              className="bg-cardBg text-mainText rounded-xl overflow-hidden hover:shadow-yellow-500/30 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group cursor-pointer border border-gray-700"
            >
              <div className="relative aspect-square bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl text-gray-500">🎞️</span>
                )}

                {/* Rating Badge */}
                {(movie.rating || movie.voteAverage) && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow">
                    {Number(movie.rating || movie.voteAverage).toFixed(1)}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold truncate text-lg  group-hover:text-yellow-400 transition">
                  {movie.title}
                </h3>
                {movie.releaseDate && (
                  <p className="text-gray-400 text-sm truncate">
                    {movie.releaseDate.substring(0, 4)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingMoviesSection;
