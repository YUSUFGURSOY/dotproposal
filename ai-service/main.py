from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import re

# API Uygulamasını Başlat
app = FastAPI(title="DotProposal AI Engine")

# 1. Yapay Zeka Beynini ve Hafızasını Yükle
print("Yapay Zeka Yükleniyor...")
try:
    model = joblib.load("dotproposal_budget_model.pkl")
    vectorizer = joblib.load("dotproposal_vectorizer.pkl")
    print("✅ Model Başarıyla Yüklendi!")
except Exception as e:
    print(f"❌ Model Yükleme Hatası: {e}")

# 2. Dışarıdan Gelecek Veri Formatı (Sadece metin alacağız)
class ProjectRequest(BaseModel):
    description: str

# 3. Metin Temizleme Motoru (Eğitimdekiyle tamamen aynı olmalı!)
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# 4. Asıl Tahmin Uç Noktası (Endpoint)
@app.post("/api/predict")
async def predict_budget(req: ProjectRequest):
    try:
        cleaned_text = clean_text(req.description)
        print(f"Gelen Metin: {cleaned_text[:50]}...") # 👈 LOG EKLEDİK
        
        text_vector = vectorizer.transform([cleaned_text])
        prediction = model.predict(text_vector)[0]
        
        print(f"Tahmin Sonucu: {prediction}") # 👈 LOG EKLEDİK
        
        return {"success": True, "estimated_budget": round(float(prediction), 2)}
    except Exception as e:
        print(f"⚠️ Tahmin Hatası: {e}") # 👈 HATAYI YAKALA
        return {"success": False, "estimated_budget": 0, "error": str(e)}

# Sunucu çalıştığını test etmek için basit bir GET rotası
@app.get("/")
def read_root():
    return {"message": "DotProposal AI Service is Running 🚀"}