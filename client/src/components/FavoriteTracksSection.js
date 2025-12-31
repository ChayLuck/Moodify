import React from "react";

const FavoriteTracksSection = ({
  title = "Your Favorite Songs",
  tracks = [],
  onTrackClick,
  getMoodColor,
}) => {
  if (!tracks || tracks.length === 0) return null;

  return (
    <>
      <h2 className="text-3xl font-bold mb-4 border-l-4 border-indigo-500 pl-4 flex items-center gap-2 text-indigo-400">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
        {tracks.map((fav) => (
          <div
            key={fav._id}
            onClick={() => onTrackClick && onTrackClick(fav)}
            className="bg-mainBg rounded-xl overflow-hidden hover:shadow-indigo-500/30 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group relative cursor-pointer border border-gray-700"
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={fav.albumCover}
                alt={fav.title}
                className="w-full h-full object-cover transition duration-300 group-hover:opacity-80"
              />
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
              <p className="text-gray-400 text-sm truncate">{fav.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FavoriteTracksSection;
