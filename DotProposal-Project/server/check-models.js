// check-models.js
const https = require('https');

const API_KEY = "AIzaSyA5sKKBXgH6npJ_Krw1R6Dr96hWwWs7vOU"; // Senin anahtarın
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("🔍 Modeller Google sunucusundan sorgulanıyor...");

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.error) {
        console.error("❌ HATA:", json.error.message);
      } else if (json.models) {
        console.log("✅ BAŞARILI! Kullanabileceğin Modeller:");
        json.models.forEach(model => {
             // Sadece generateContent destekleyenleri filtrele
            if(model.supportedGenerationMethods.includes("generateContent")) {
                console.log(`   👉 ${model.name.replace('models/', '')}`);
            }
        });
      } else {
        console.log("⚠️ Hiçbir model bulunamadı.");
      }
    } catch (e) {
      console.error("JSON Hatası:", e.message);
    }
  });

}).on("error", (err) => {
  console.error("Bağlantı Hatası:", err.message);
});