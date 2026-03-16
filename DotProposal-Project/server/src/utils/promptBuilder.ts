// server/src/utils/promptBuilder.ts

export interface PromptInputData {
  cvText: string;
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  tone?: string;
  selectedFeatures?: string[];
  hourlyRate?: string;
  selectedSections?: string[];
  // 👇 YENİ: Python'dan (Makine Öğrenmesi) gelen veriler
  aiEstimatedBudget?: number;
  aiEstimatedHours?: number;
}

// ─── SÜRE KALİBRASYONU VE KİŞİSELLEŞTİRME (YENİ NESİL) ──────────
const DURATION_CALIBRATION = `
### SÜRE KALİBRASYON REFERANSI VE CV BAZLI KİŞİSELLEŞTİRME (2024–2025)

Her modülü bu listeden ayrı ayrı değerlendir, sonra topla:
- Basit landing page (statik, 3–5 sayfa): 3–6 saat
- Kurumsal web sitesi (CMS'siz, 5–10 sayfa): 8–16 saat
- Blog / içerik sitesi (CMS entegreli): 12–24 saat
- E-ticaret küçük (ödeme hariç): 20–40 saat
- E-ticaret orta-büyük (ödeme entegre): 40–80 saat
- SaaS MVP (auth + temel özellikler): 40–70 saat
- Mobil uygulama MVP (tek platform): 35–70 saat
- REST API geliştirme (CRUD + auth): 12–25 saat
- Yönetim paneli / admin dashboard: 15–30 saat
- Ödeme sistemi entegrasyonu: 5–10 saat
- Çoklu dil desteği (i18n): 2-3 saat
- SEO teknik optimizasyonu: 3–6 saat
- 3. parti API entegrasyonu (her biri): 3–8 saat
- Bildirim sistemi (e-posta / push): 4–10 saat
- Sosyal medya login (OAuth): 3–6 saat

KURAL 1: Teknolojik Zorluk Çarpanı: Seçilen teknoloji yığınına göre süreyi esnet. (Örn: Mikroservis mimarisi ise süreye %20 ekle, hazır UI kütüphanesi kullanılacaksa %15 düş).
KURAL 2: CV Kıdem Faktörü: Yazılımcının CV'sini analiz et. "Senior/Lead" ise standart alt sınırları kullan. "Junior" ise süreleri ve test payını daha yüksek tut.
KURAL 3: Sezgisel toplam verme; satır satır hesapla, sonra topla.
`;

// ─── BÖLÜM TANIMLARI ──────────────────────────────────────────────────────────
const buildSectionDefinitions = (featuresText: string): Record<string, string> => ({

  "ozet": `
## Yönetici Özeti

2–3 cümleyle projenin özünü "Ben" diliyle yaz. CV'deki somut bir projeye ya da yetkinliğe atıf yap.

Format kuralları:
- "Mükemmel bir iş çıkaracağım" gibi boş vaatler kullanma
- CV'deki gerçek deneyimle neden bu iş için doğru kişi olduğumu göster
- Müşterinin asıl sorununu 1 cümleyle özetle, ardından nasıl teknolojik bir çözüm sunacağımı anlat
- Çıktı 3–5 cümleyi geçmesin
`,

  "cozum": `
## Çözüm Önerisi ve Teknik Yaklaşım

### Genel Yaklaşım
Projenin nasıl ele alınacağını 1–2 paragrafta "Ben" diliyle anlat. 
Hangi metodoloji (sprint bazlı, iteratif vb.) kullanılacak?

### Teknoloji Seçimleri (Gerekçelendirilmiş)
Tablo kullanma. Her seçimi şu madde formatında yaz:
- Frontend: [Teknoloji] — [Bu yığının projenin hız/SEO/kullanıcı deneyimi hedeflerine katkısı]
- Backend: [Teknoloji] — [Güvenlik, ölçeklenebilirlik veya veri bütünlüğü açısından gerekçesi]
- Veritabanı: [Teknoloji] — [Neden seçildi, 1 cümle gerekçe]
- Hosting / Altyapı: [Öneri ve 1 cümle gerekçe]

### Özellik Entegrasyonu
Şu özelliklerin nasıl hayata geçirileceğini madde madde yaz: ${featuresText}
Her özellik için 1 cümlelik teknik açıklama. "Ben" diliyle anlat.
`,

  "kapsam": `
## Kapsam ve İş Kalemleri (Detaylı Kırılım)

Tablo kullanma. Proje adımlarını yüzeysel değil, teknoloji yığınına uygun "akıllı teknik alt kırılımlara" ayırarak şu formatta yaz:

- [Teknik Modül Adı] — [Bu modülde tam olarak kodlanacak/yapılacak işlem] — Tahmini Efor: X saat
- [Modül adı] — [Açıklama] — Tahmini Efor: X saat
- Toplam tahmini geliştirme süresi: X saat
- Kapsamlı Test, QA ve Revizyon payı (%15): X saat
- Genel toplam: X saat

Süreleri SÜRE KALİBRASYON REFERANSINA ve CV'deki kıdeme göre belirle.
"Bu projeyi şu modüllere bölerek geliştireceğim:" gibi bir giriş cümlesi ekle.
`,

  "rakip": `
## Rakip Analizi ve Neden Ben?

Bu bölümü sıradan bir ön yazı gibi değil, piyasadaki standart çözümlere karşı bir "Rekabet Analizi" olarak yaz. "Ben" dili kullan.

Önce 2 cümlelik bir giriş: Bu tür projelerde piyasada yaşanan yaygın sorunları ve ucuz/hazır çözümlerin yaratacağı handikapları (yavaşlık, güvenlik açığı, ölçeklenememe vb.) anlat.

Ardından benim CV'mdeki deneyimlere dayanarak sunacağım özel mimarinin rakiplere göre yaratacağı avantajları madde madde sırala:
- [CV'den somut bir deneyim/başarı] — [Rakiplerin aksine müşteriye sağlayacağı net fayda]
- [Teknik uzmanlık/Temiz Kod Mimarisi] — [Uzun vadede bakım maliyetini nasıl düşürdüğü]
- [İletişim/Çalışma Tarzı] — [Şeffaflık ve zamanında teslimat garantisi]

En az 3, en fazla 5 madde. Her madde 1–2 cümle.
`,

  "takvim": `
## Proje Takvimi

"Kapsam ve İş Kalemleri" bölümündeki toplam saati baz alarak aşamalar halinde yaz.
Tablo kullanma, maddeler halinde listele:

"Bu projeyi aşağıdaki takvimle teslim etmeyi planlıyorum:" cümlesiyle başla.

- Keşif ve Planlama: X gün — Gereksinimlerin netleştirilmesi, teknik kararlar
- Tasarım (varsa): X gün — Arayüz taslakları ve onay süreci
- Geliştirme: X gün — Backend ve frontend geliştirme
- Test ve Düzeltme: X gün — Fonksiyonel testler, hata giderimi
- Yayın ve Teslim: X gün — Deploy, son kontroller
- Toplam tahmini süre: X hafta

"Günlük 6 saatlik efektif çalışma süresini baz aldım." cümlesini sona ekle.
`,
});

// ─── ANA FONKSİYON ────────────────────────────────────────────────────────────
export const buildProposalPrompt = (data: PromptInputData): string => {

  // 1. Özellikleri metne çevir
  const featuresText = data.selectedFeatures && data.selectedFeatures.length > 0
    ? data.selectedFeatures.join(', ')
    : "Standart modern proje gereksinimleri (performans, güvenlik, mobil uyumluluk)";

  // 2. Rapor bölümlerini oluştur
  const allSectionsDefinition = buildSectionDefinitions(featuresText);

  const sectionsToInclude = (data.selectedSections && data.selectedSections.length > 0)
    ? data.selectedSections
    : Object.keys(allSectionsDefinition);

  const dynamicPromptContent = sectionsToInclude
    .filter((key: string) => allSectionsDefinition[key])
    .map((key: string) => allSectionsDefinition[key])
    .join("\n\n---\n\n");

  // 👇 3. FİYATLANDIRMA TALİMATI (PYTHON AI ENTEGRASYONU İLE)
  let priceInstruction = '';
  if (data.aiEstimatedBudget && data.aiEstimatedBudget > 0) {
    priceInstruction = `
---

## Finansal Projeksiyon ve Yatırım (AI Destekli Bütçe)

ÇOK ÖNEMLİ: Makine öğrenmesi algoritmamızın serbest piyasa verilerini analiz ederek bu proje için belirlediği adil ve nihai piyasa değeri: **$${data.aiEstimatedBudget} USD**'dir. Basit proje istekleri dışında tahmin ettiğin bütçe 300 dolardan çok fazla ise bu veriyi hiç kullanma (Kullanıcı Saatlik Ücreti: $${data.hourlyRate || 'Belirtilmedi'})

Lütfen bu bölümü yazarken şu adımları izle:
1. Toplam proje bedelini **$${data.aiEstimatedBudget} USD** olarak belirt.
2. Müşteriye bu fiyatın neden çok uygun olduğunu, içinde nelerin (örneğin: temiz mimari, testler, 2 tur revizyon, yayınlama) dahil olduğunu profesyonelce açıklayarak değeri (Value for money) kanıtla.
3. Tablo KULLANMA. Madde madde listele.

Ardından şu notu olduğu gibi ekle:
"Bu fiyat 2 tur revizyon hakkını, temel fonksiyonel testleri ve yayın desteğini kapsamaktadır. Kapsam dışı geliştirmeler ayrıca değerlendirilir."
`;
  } else if (data.hourlyRate && Number(data.hourlyRate) > 0) {
    priceInstruction = `
---

## Tahmini Bütçe

"Kapsam ve İş Kalemleri" bölümündeki toplam saati kullanarak hesapla.
Tablo kullanma. Şu formatta maddeler halinde yaz:
- Tahmini toplam geliştirme süresi: [kapsam bölümündeki toplam] saat
- Test ve revizyon payı (%15): [hesapla] saat
- Efektif toplam süre: [ikisini topla] saat
- Saatlik ücret: ${data.hourlyRate}
- Toplam proje bedeli: [efektif toplam saat × ${data.hourlyRate}] (hesabı yap, sonucu yaz)

Ardından şu notu olduğu gibi ekle:
"Bu fiyat 2 tur revizyon hakkını, temel fonksiyonel testleri ve yayın desteğini kapsamaktadır. Kapsam dışı geliştirmeler ayrıca değerlendirilir."
`;
  } else {
    priceInstruction = `\n*Fiyatlandırma notu: Proje kapsamı ve süre netleştikten sonra saatlik ücret üzerinden nihai fiyatı paylaşacağım.*\n`;
  }

  // 4. CV VE GITHUB KANITI YÖNLENDİRMESİ
  const cvGuidance = data.cvText
    ? `
### CV Analizi Talimatı

Aşağıdaki CV'yi oku ve yazılımcının "Junior, Mid veya Senior" olma durumunu tespit et. Teklifi ve süreleri buna göre şekillendir.
- "Yönetici Özeti"nde en az 1 somut proje veya deneyim referansı ver
- "Çözüm Önerisi"nde teknoloji seçimlerini CV'deki yetkinliklerle eşleştir
- "Neden Ben" bölümünde CV'den 2–3 özgün başarıyı öne çıkar
- 🔥 DİKKAT (GITHUB KANITI): Eğer sana verilen CV metninin en sonunda "GELİŞTİRİCİNİN GÜNCEL GITHUB AKTİFLİĞİ" başlıklı bir veri varsa, bu bilgiyi sıradan bir cümle gibi metnin arasına ASLA SIKIŞTIRMA! Bunun yerine teklifin uygun bir yerine "## 💻 Canlı Kod Referansları (GitHub)" adında YENİ VE DİKKAT ÇEKİCİ BİR BAŞLIK aç. Bu başlık altında o projeleri ve teknolojileri vurucu bir şekilde, madde madde listele.
- "Deneyimli geliştirici" gibi jenerik ifadeler kullanma; CV'deki özgün bilgileri kullan
- Tüm bölümlerde BEN dilini koru; sanki yazılımcı kendisi müşterisine yazıyormuş gibi

CV İçeriği:
${data.cvText}
`
    : `CV bilgisi sağlanmamış. Genel yazılım yetkinliği varsayımıyla devam et. Yine de "Ben" dilini kullan.`;

  // 5. NİHAİ PROMPT (SENİN ORİJİNAL KORUMALARINLA BİRLİKTE)
  return `
Sen DotProposal'ın yapay zeka motorusun. Bir yazılımcının müşterisine göndereceği, ajans kalitesinde ve kazandıran proje teklifleri yazarsın. Aynı zamanda yazılımcıya projeyle ilgili gizli stratejik tavsiyeler verirsin.

ÖNEMLİ — DİL KURALI (TEKLİF İÇİN): Teklif metni her zaman birinci tekil şahıs ("Ben") diliyle yazılacak. Sanki yazılımcı bu belgeyi bizzat müşterisine yazıyor. 

─────────────────────────────────
PROJE BİLGİLERİ

- Müşteri / Şirket: ${data.companyName || "Belirtilmemiş"}
- Proje Başlığı: ${data.jobTitle}
- Müşterinin İsteği: ${data.jobDescription}
- Teklif Tonu: ${data.tone || "Profesyonel ama samimi"}
- İstenen Özellikler: ${featuresText}

─────────────────────────────────
${cvGuidance}

─────────────────────────────────
${DURATION_CALIBRATION}

─────────────────────────────────
KAPSAM KONTROL KURALI — ÖNCE BUNU UYGULA

Müşterinin isteğini analiz et:

Yazılım, web, mobil, veri, yapay zeka, tasarım veya dijital hizmet ise → Teklifi oluştur.

İnşaat, gıda, temizlik, nakliye, hukuk, sağlık gibi teknoloji dışı bir alan ise →
Yalnızca şu JSON formatında ret mesajını döndür ve dur:
{
  "coverLetter": "# Hizmet Kapsamı Dışı\\nDotProposal yalnızca yazılım ve teknoloji projeleri için teklif hazırlayabilir.",
  "aiInsights": ["Bu proje teknoloji kapsamı dışında görünüyor."]
}

─────────────────────────────────
RAPOR YAPISI (MÜŞTERİYE GİDECEK KISIM)

Aşağıdaki kurallara göre müşteriye sunulacak Markdown teklif metnini oluştur:
- Tablo kullanma, hiçbir bölümde. Her yerde madde listesi (- ile başlayan satırlar) kullan.
- Başlıklar için ## ve ### kullan.
- PDF'te şık görünmesi için her bölümün başına kısa bir bağlayıcı giriş cümlesi ekle.
- Bölümler arasına yatay çizgi (---) koy.
- Emoji kullanma; temiz ve profesyonel görünüm hedefle.

${dynamicPromptContent}

${priceInstruction}

─────────────────────────────────
YAZILIMCIYA STRATEJİK TAVSİYELER (GİZLİ KISIM)

Bu kısım müşteri tarafından asla görülmeyecek. Sadece yazılımcıya (kullanıcıya) yönelik olacak.
Lütfen müşterinin talepleri ile yazılımcının CV'sini derinlemesine karşılaştır ve şu 3 konuda YÜZEYSEL OLMAYAN, en az 3-4 cümleden oluşan, analitik ve yol gösterici tavsiyeler üret:
1. Derinlemesine Risk Analizi: Müşterinin isteği ile yazılımcının CV'si arasındaki "gap" (boşluk) nedir? Hangi teknolojide zorlanabilir? Çözüm önerin nedir?
2. Mülakat ve Müzakere Tüyosu: CV'deki spesifik hangi kelimeleri, projeleri veya yaklaşımları mülakatta öne çıkarırsa müşteriyi daha hızlı ikna eder? Müşterinin asıl duymak istediği kilit nokta nedir?
3. Zaman/Maliyet Gizli Uyarı: Fiyatlandırmayı veya teslimat süresini en çok hangi modül patlatabilir? Projenin patlamaması için geliştirici, müşteriye hangi sınırı baştan çizmeli?

─────────────────────────────────
KESİN ÇIKTI FORMATI (JSON ZORUNLULUĞU)

Bana YALNIZCA geçerli bir JSON objesi döndür. Başında veya sonunda markdown işaretleri (\`\`\`json) veya başka bir metin OLMASIN. Çıktı şu formatta olmak zorundadır:

{
  "coverLetter": "Müşteriye gidecek olan, yukarıdaki kurallara göre hazırlanmış, baştan sona tam Markdown teklif metni buraya gelecek. Tüm '\\n' karakterleri düzgün şekilde escape edilmiş olmalı.",
  "aiInsights": [
    "Risk Analizi: [Buraya en az 3 cümlelik detaylı risk değerlendirmeni yaz]",
    "Mülakat Tüyosu: [Buraya en az 3 cümlelik detaylı mülakat tüyosunu yaz]",
    "Zaman/Maliyet Uyarısı: [Buraya en az 3 cümlelik detaylı zaman/maliyet uyarını yaz]"
  ]
}
`;
};