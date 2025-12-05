import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey! Tell me your mood and I'll recommend the perfect music & movie 🎶🎬"
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Mood → Emoji Map
  const moodEmoji = {
    happy: "😊",
    sad: "😢",
    romantic: "💗",
    chill: "❄️",
    energized: "⚡",
    angry: "🔥",
    default: "🎵",
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 1) AI mood detection
      const aiRes = await axios.post("http://localhost:5000/api/ai/chat", {
        message: userMessage.text,
      });

      const { mood } = aiRes.data;
      const emoji = moodEmoji[mood?.toLowerCase()] || moodEmoji.default;

      // 2) Fetch recommendations
      const recRes = await axios.get(
        `http://localhost:5000/api/recommendations/ai/${mood}`
      );

      const { track, movie } = recRes.data;

      // 3) Add recommendation bubble only
      setMessages(prev => [
        ...prev,
        { sender: "recommendation", mood, emoji, track, movie }
      ]);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Sorry, I couldn't load recommendations right now." }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[520px] rounded-2xl shadow-2xl bg-gray-900 text-white border border-gray-700 flex flex-col animate-slide-up">

      {/* HEADER */}
      <div className="bg-gray-800 px-4 py-3 flex items-center gap-3 rounded-t-2xl border-b border-gray-700">
        <img src="/bot.png" className="w-8 h-8" alt="bot" />
        <h2 className="text-lg font-bold">Moodify Assistant</h2>

        <button
          onClick={onClose}
          className="ml-auto text-gray-300 hover:text-white text-xl"
        >
          ×
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} msg={msg} />
        ))}

        {loading && (
          <div className="text-indigo-400 animate-pulse">Thinking...</div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      {/* INPUT */}
      <div className="p-3 bg-gray-800 flex gap-2 rounded-b-2xl">
        <input
          className="flex-1 bg-gray-700 px-3 py-2 rounded-xl outline-none"
          placeholder="Tell me your mood..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-500 px-4 py-2 rounded-xl hover:bg-indigo-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

/* MESSAGE COMPONENTS */
function ChatBubble({ msg }) {
  if (msg.sender === "user") {
    return (
      <div className="text-right">
        <div className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-md">
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.sender === "bot") {
    return (
      <div className="text-left">
        <div className="inline-block bg-gray-700 px-4 py-2 rounded-xl shadow-md text-gray-100">
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.sender === "recommendation") {
    return (
      <div className="space-y-3">

        {/* Emoji + Mood */}
        <div className="text-indigo-300 font-semibold text-sm tracking-wide">
          {msg.emoji} Recommendations for: {msg.mood}
        </div>

        {/* MUSIC CARD */}
        <div className="bg-gray-800 rounded-xl p-3 flex gap-3 shadow-lg hover:scale-[1.02] transition">
          <img
            src={msg.track.image}
            className="w-16 h-16 rounded-xl object-cover"
            alt=""
          />
          <div>
            <p className="font-bold">{msg.track.name}</p>
            <p className="text-gray-400 text-sm">{msg.track.artist}</p>
          </div>
        </div>

        {/* MOVIE CARD */}
        <div className="bg-gray-800 rounded-xl p-3 flex gap-3 shadow-lg hover:scale-[1.02] transition">
          <img
            src={msg.movie.poster}
            className="w-16 h-20 rounded-xl object-cover"
            alt=""
          />
          <div>
            <p className="font-bold">{msg.movie.title}</p>
            <p className="text-gray-400 text-xs line-clamp-3">
              {msg.movie.overview}
            </p>
          </div>
        </div>

      </div>
    );
  }

  return null;
}
