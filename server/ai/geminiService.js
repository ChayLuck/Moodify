const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeMoodFromText(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Return ONLY JSON. No markdown. No code block. No explanation outside JSON.

Valid moods: ["Happy","Sad","Energetic","Chill","Romantic"]

User message: "${text}"

Respond ONLY like this:
{"mood":"Chill","confidence":75,"explanation":"short reason"}
`;

  try {
    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();

    console.log("\n🔵 RAW AI OUTPUT:", raw);

    // ---------- AI JSON Temizleyici ----------
    // backtick varsa temizle
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    // JSON olmayan baş / son yazıları temizle
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) raw = jsonMatch[0];

    console.log("🟢 CLEAN JSON:", raw);

    return JSON.parse(raw);

  } catch (err) {
    console.log("❌ JSON Parse Error:", err);

    return {
      mood: "Chill",
      confidence: 50,
      explanation: "Fallback mood (AI parse error)."
    };
  }
}

module.exports = { analyzeMoodFromText };
