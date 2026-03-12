from fastapi import FastAPI
from pydantic import BaseModel
import joblib

# API Uygulamasını Başlat
app = FastAPI(title="DotProposal AI Bütçe Tahmin Servisi")

# 1. Yeni ve Optimize Edilmiş Modelleri Yükle
# Dosya isimlerinin klasördeki isimlerle BİREBİR aynı olduğundan emin ol
vectorizer = joblib.load('dotproposal_fiverr_vectorizer.pkl')
model = joblib.load('dotproposal_fiverr_optimized_model.pkl')

# 2. Node.js'ten gelecek verinin şeması
class BudgetRequest(BaseModel):
    title: str

# 3. Tahmin yapacak uç nokta (Endpoint)
@app.post("/predict-budget")
def predict_budget(request: BudgetRequest):
    try:
        # Gelen proje başlığını modelin anlayacağı sayısal vektöre çevir
        title_vec = vectorizer.transform([request.title])
        
        # Optimize edilmiş Random Forest modeli ile bütçeyi tahmin et
        predicted_price = model.predict(title_vec)[0]
        
        return {
            "status": "success",
            "title": request.title,
            "suggested_budget": round(predicted_price, 2) # Virgülden sonra 2 hane
        }
    except Exception as e:
        return {
            "status": "error", 
            "message": str(e)
        }

@app.get("/")
def read_root():
    return {"message": "DotProposal AI Servisi Aktif ve Çalışıyor!"}