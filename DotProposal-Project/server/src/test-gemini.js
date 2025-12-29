require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("🔑 Kullanılan API Key:", process.env.GEMINI_API_KEY ? "Okundu (Mevcut)" : "BULUNAMADI!");
  
  try {
    // Mevcut model var mı basit bir test
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Merhaba, çalışıyor musun?");
    console.log("✅ BAŞARILI! Cevap:", result.response.text());
  } catch (error) {
    console.error("❌ HATA:", error.message);
  }
}

listModels();