const { GoogleGenerativeAI } = require("@google/generative-ai");
const { detectMoodLocally } = require("./localMoodDetector");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeMoodFromText(text) {
  if (!text || !text.trim()) {
    return {
      type: "clarify",
      message: "Please tell me how you feel 🙂",
    };
  }

  /* 1️⃣ LOCAL MOOD (TEK KAYNAK) */
  const localResult = detectMoodLocally(text);
  if (localResult) {
    console.log("🟢 LOCAL MOOD:", localResult);
    return localResult;
  }

  /* 2️⃣ ANLAMSIZ ÇOK KISA GİRİŞLER */
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount === 1 && text.trim().length <= 3) {
    return {
      type: "clarify",
      message: "Can you describe your mood a bit more? 🙂",
    };
  }

  /* 3️⃣ AI (SADECE GEREKİRSE) */
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Return ONLY JSON. No markdown. No explanation.

    Valid moods: ["Happy","Sad","Energetic","Chill","Romantic"]

    User message: "${text}"

    {"mood":"Happy","confidence":80}
`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();

    raw = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) raw = jsonMatch[0];

    const parsed = JSON.parse(raw);

    // 🔒 Güvenlik: sistemde olmayan mood gelirse
    const allowedMoods = ["Happy", "Sad", "Energetic", "Chill", "Romantic"];
    let finalMood = parsed.mood;

    if (!allowedMoods.includes(finalMood)) {
      finalMood = "Chill";
    }

    return {
      mood: finalMood,
      confidence: parsed.confidence || 70,
      source: "ai",
    };
  } catch (err) {
    console.error("❌ AI ERROR / QUOTA:", err.message);
    return {
      type: "clarify",
      message:
        "I’m having trouble analyzing that right now 🤖 Can you describe your mood a bit more?",
    };
  }
}

module.exports = { analyzeMoodFromText };
