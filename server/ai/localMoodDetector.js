function detectMoodLocally(text) {
  if (!text) return null;

  const t = text.toLowerCase();

  const rules = [
    
    {
      mood: "Happy",
      words: [
        "happy", "mutlu", "çok mutluyum", "keyfim yerinde",
        "harika", "süper", "çok iyi", "sevindim", "neşeliyim",
        "gülmek", "gülüyorum", "pozitif", "iyi hissediyorum",
        "güzel"
      ]
    },

    
    {
      mood: "Sad",
      words: [
        "sad", "üzgün", "kötüyüm", "moralim bozuk",
        "canım sıkkın", "depres", "depresif", "yalnızım",
        "ağlamak", "kırgınım", "kötü hissediyorum",
        "sınavdan kaldım", "başaramadım", "berbat"
      ]
    },

    
    {
      mood: "Romantic",
      words: [
        "romantic", "aşk", "aşkım", "aşığım", "seviyorum",
        "sevgilim", "hoşlanıyorum", "kalbim",
        "love", "in love", "flört", "romantik hissediyorum"
      ]
    },

    
    {
      mood: "Chill",
      words: [
        "chill", "rahatım", "sakinim", "kafam rahat",
        "takılıyorum", "boş boş", "kendi halimde",
        "relax", "takılmalık", "stressiz", "yumuşak mod"
      ]
    },

    
    {
      mood: "Energetic",
      words: [
        "enerjik", "enerji doluyum", "coşkuluyum",
        "gazlıyım", "hırslıyım", "motivasyonum yüksek",
        "energetic", "hareketliyim", "adrenalin",
        "spor yapasım var", "koşasım var",
        "sinirliyim", "kızgınım", "öfkeliyim", "angry"
      ]
    }
  ];

  for (const rule of rules) {
    if (rule.words.some(word => t.includes(word))) {
      return {
        mood: rule.mood,
        confidence: 90,
        source: "local"
      };
    }
  }

  return null; 
}

module.exports = { detectMoodLocally };
