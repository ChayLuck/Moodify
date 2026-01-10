import React from "react";

const NewReleasesSection = ({
  title = "New Releases",
  tracks = [],
  loading = false,
  loadingText = "Loading new releases...",
  onTrackClick,
}) => {
  return (
    <div className="mt-20">
      {/* Başlık */}
      <h2 className="text-3xl font-bold mb-8 border-l-4 border-green-500 pl-4 flex items-center gap-2 text-green-500">
        {title}
      </h2>

      {/* Loading / Grid */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">{loadingText}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
          {tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => onTrackClick && onTrackClick(track)}
              className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-green-500/30 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group relative cursor-pointer border border-gray-700"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={track.image}
                  alt={track.name}
                  className="w-full h-full object-cover transition duration-300 group-hover:opacity-80"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold truncate text-lg text-white group-hover:text-green-400 transition">
                  {track.name}
                </h3>
                <p className="text-gray-400 text-sm truncate">
                  {track.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewReleasesSection;
