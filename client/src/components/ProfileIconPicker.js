const ICONS = [
  "/icons/account.png",
  "/icons/chicken.png",
  "/icons/human.png",
  "/icons/man1.png",
  "/icons/man.png",
  "/icons/meerkat.png",
  "/icons/profile.png",
  "/icons/woman.png",
];

export default function ProfileIconPicker({ onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {ICONS.map((icon) => (
        <img
          key={icon}
          src={icon}
          alt="Profile Avatar"
          onClick={() => onSelect(icon)}
          className="w-24 h-24 cursor-pointer rounded-full object-cover border border-gray-700 hover:border-indigo-400 hover:scale-110 transition"
        />
      ))}
    </div>
  );
}
