import { GoogleGenerativeAI } from '@google/generative-ai';

// .env dosyasındaki API key'ini kullandığından emin ol
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const getEnglishKeywordsForAI = async (userInput: string): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Gemini'ye verdiğimiz çok sıkı sistem komutu: Sadece İngilizce anahtar kelimeler dönmeli
        const prompt = `
        You are a freelance project keyword extractor.
        Analyze the following project description (it might be in Turkish or another language).
        Extract 3 to 5 highly relevant technical keywords in ENGLISH that define this project (e.g., "python, web scraping, data extraction, csv").
        IMPORTANT: Return ONLY the English keywords separated by spaces. Do not write any other sentences or explanations.
        
        Project Description:
        "${userInput}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const keywords = response.text().trim();

        return keywords;
    } catch (error) {
        console.error("Gemini Keyword Extraction Error:", error);
        // Eğer API çökerse veya hata verirse, sistemin patlamaması için orijinal metni geri dön
        return userInput; 
    }
};