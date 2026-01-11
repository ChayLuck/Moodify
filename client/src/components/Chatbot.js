import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey! Tell me how you feel and I’ll recommend music & movies 🎶🎬"
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const moodEmoji = {
    happy: "😊",
    sad: "😢",
    romantic: "💗",
    chill: "❄️",
    energetic: "⚡",
    default: "🎵"
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 1️⃣ AI CHAT
      const aiRes = await axios.post("http://localhost:5000/api/ai/chat", {
        message: userMessage.text
      });

      // 🔴 BELİRSİZ → SADECE BOT MESAJI
      if (aiRes.data.type === "clarify") {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: aiRes.data.message }
        ]);
        setLoading(false);
        return;
      }

      // 🟢 NET MOOD
      const { mood } = aiRes.data;
      const emoji = moodEmoji[mood?.toLowerCase()] || moodEmoji.default;

      // 2️⃣ RECOMMENDATIONS
      const recRes = await axios.get(
        `http://localhost:5000/api/recommendations/ai/${mood}`
      );

      const { track, movie } = recRes.data;

      setMessages(prev => [
        ...prev,
        { sender: "recommendation", mood, emoji, track, movie }
      ]);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong 😕" }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[520px] rounded-2xl shadow-2xl bg-mainBg  flex flex-col">

      {/* HEADER */}
      <div className="bg-mainBg text-mainText px-4 py-3 flex items-center gap-3 border-b border-gray-700">
        <img src="/bot.png" className="w-8 h-8" alt="bot" />
        <h2 className="text-lg font-bold">Moodify Assistant</h2>
        <button onClick={onClose} className="ml-auto text-xl">×</button>
      </div>

      {/* CHAT */}
      <div className=" text-mainText flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} msg={msg} />
        ))}
        {loading && <div className="text-indigo-400 animate-pulse">Thinking...</div>}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 bg-mainBg flex gap-2">
        <input
          className="flex-1 text-white bg-gray-700 px-3 py-2 rounded-xl outline-none"
          placeholder="Tell me more..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-500 text-white px-4 py-2 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}

/* CHAT BUBBLES */
function ChatBubble({ msg }) {
  if (msg.sender === "user") {
    return (
      <div className="text-right">
        <div className="inline-block text-white bg-indigo-600 px-4 py-2 rounded-xl">
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.sender === "bot") {
    return (
      <div className="text-left">
        <div className="inline-block bg-cardBg px-4 py-2 rounded-xl">
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.sender === "recommendation") {
    return (
      <div className="space-y-3">
        <div className="text-indigo-300 font-semibold text-sm">
          {msg.emoji} Recommendations for {msg.mood}
        </div>

        <div className="bg-gray-800 p-3 rounded-xl flex gap-3">
          <img src={msg.track.image} className="w-16 h-16 rounded-xl" />
          <div>
            <p className="font-bold text-white">{msg.track.name}</p>
            <p className="text-gray-400 text-sm">{msg.track.artist}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded-xl flex gap-3">
          <img src={msg.movie.poster} className="w-16 h-20 rounded-xl" />
          <div>
            <p className="font-bold text-white">{msg.movie.title}</p>
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
