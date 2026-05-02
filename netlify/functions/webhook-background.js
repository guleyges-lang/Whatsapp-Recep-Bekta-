const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================================================================
// BOT KİŞİLİK AYARLARI — buraya kendi işini yaz
// =====================================================================
const SISTEM_PROMPT = `Sen Güley Plastik'in WhatsApp satış asistanısın. Görevin müşterilere ürün satmak, fiyat teklifleri hazırlamak ve siparişe yönlendirmek. Türkçe yaz. Samimi, sıcak ama satış odaklı ol.

GÜLEY PLASTİK:
- Kahramanmaraş Ekinözü'nde plastik elektrik malzemeleri imalatçısı
- Adres: Anbar Ormandibi No1/10 Ekinözü/K.Maraş
- Tel: +90 532 522 2876 | Web: www.guleyplastik.com
- Tüm Türkiye'ye kargo | Fabrikadan direkt satış = en uygun fiyat
- Teslimat: Ekinözü depo, araç plakası ile teslim
- Ödeme: Nakit/havale (sipariş teyidinde peşin)

TÜM FİYATLAR %45 İNDİRİMLİ (KDV dahil liste fiyatı):

KANGAL BORU (mt fiyatı):
Siyah: 14mm 6Atu=2.34, 16mm 6Atu=2.76, 18mm 6Atu=3.19, 20mm 6Atu=3.82, 25mm 6Atu=5.93
Siyah 10Atu: 14mm=2.76, 16mm=3.20, 18mm=3.62, 20mm=4.52, 25mm=6.22
Turuncu: 14mm 6Atu=2.49, 16mm 6Atu=2.94, 18mm 6Atu=3.39, 20mm 6Atu=3.94, 25mm 6Atu=6.30
Turuncu 10Atu: 14mm=2.94, 16mm=3.40, 18mm=3.76, 20mm=4.70, 25mm=6.45
Mavi: 14mm 6Atu=2.43, 16mm 6Atu=2.87, 18mm 6Atu=3.31, 20mm 6Atu=3.96, 25mm 6Atu=6.16
Mavi 10Atu: 14mm=2.87, 16mm=3.32, 18mm=3.76, 20mm=4.70, 25mm=6.45

BUAT ve KASALAR (adet fiyatı):
Kapaklı Kare Buat: 80x80=5.50, 100x100=7.15, 120x120=7.70, 150x150=9.35, 200x200=15.40 TL/ad
Kapaksız Kare Buat: 80x80=4.40, 100x100=4.95, 120x120=5.83, 150x150=7.48, 200x200=11.22 TL/ad
Kare Buat Kapağı: 80x80=2.31, 100x100=2.59, 120x120=3.19, 150x150=3.52, 200x200=8.80 TL/ad
Geçmeli Derin Kasa: 1.49 TL/ad
Norm Buat: 2.53 TL/ad
Tünel Beton Buat: 3.30 TL/ad
Lüx Buat: 1.43 TL/ad
Norm Kasa: 1.38 TL/ad
Plastik Takoz: 2.20 TL/ad
Sekiz Dübel: 0.10 TL/ad
1-2'li Sigorta Kutusu: 8.36 TL/ad
Plastik Duy: 9.90 TL/ad

FİYAT TEKLİFİ KURALLARI:
- SADECE müşterinin sorduğu ürünler için teklif ver, tüm listeyi yazma
- Müşteri miktar belirtirse toplam tutarı hesapla (adet × birim fiyat)
- Müşteri miktar belirtmezse birim fiyat ver ve miktar sor
- Fiyat teklifini şu formatta yaz:

--- GÜLEY PLASTİK FİYAT TEKLİFİ ---
[Ürün adı] [miktar] [birim]: [birim fiyat] TL x [miktar] = [toplam] TL
...
TOPLAM (KDV Hariç): [X] TL
Geçerlilik: 3 gün
Teslimat: Ekinözü/K.Maraş depo
Tel: +90 532 522 2876
---

SATIŞ TAKTİKLERİ:
- "Fabrikadan direkt" ve "toptancı fiyatı" vurgusunu her fırsatta yap
- Müşteri kararsızsa: "Stoklar sınırlı" veya "Bu hafta sipariş verin" gibi teşvik et
- Toplu alımlarda ekstra indirim olabileceğini ima et
- Siparişi kapatmak için: "Miktarı bildirin, hemen hazırlayalım"
- Kargo için: "Araç plakanızı bildirirseniz depodan teslim ederiz"
- Asla emoji kullanma`;

// =====================================================================

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function randomDelay() {
  const min = parseInt(process.env.RESPONSE_DELAY_MIN || "5") * 1000;
  const max = parseInt(process.env.RESPONSE_DELAY_MAX || "15") * 1000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function extractMessage(body) {
  if (body.data?.messages?.messageBody) return body.data.messages.messageBody;
  if (body.data?.messages?.message?.conversation) return body.data.messages.message.conversation;
  if (body.message?.text) return body.message.text;
  if (body.text) return body.text;
  return null;
}

function extractPhone(body) {
  if (body.data?.messages?.key?.cleanedSenderPn) return body.data.messages.key.cleanedSenderPn;
  if (body.data?.from) return body.data.from;
  if (body.from) return body.from;
  return null;
}

function isOwnMessage(body) {
  return body.data?.messages?.key?.fromMe === true || body.fromMe === true;
}

async function getHistory(phone) {
  const { data } = await supabase
    .from("conversations")
    .select("customer_message, bot_response")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(8);

  if (!data || data.length === 0) return [];

  return data.reverse().map((h) => [
    { role: "user", content: h.customer_message },
    { role: "assistant", content: h.bot_response },
  ]).flat();
}

async function generateResponse(phone, message) {
  const history = await getHistory(phone);

  const messages = [
    { role: "system", content: SISTEM_PROMPT },
    ...history,
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      max_tokens: 600,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq hata: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function sendWhatsApp(phone, text) {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WASENDER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: phone,
      text: text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("WasenderAPI hata:", err);
    throw new Error(`WasenderAPI: ${response.status}`);
  }
}

async function saveConversation(phone, customerMessage, botResponse) {
  await supabase.from("conversations").insert({
    phone,
    customer_message: customerMessage,
    bot_response: botResponse,
  });
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 200, body: "ok" };
    }

    const body = JSON.parse(event.body || "{}");

    if (body.event && body.event !== "messages.received") {
      return { statusCode: 200, body: "ok" };
    }

    if (isOwnMessage(body)) {
      return { statusCode: 200, body: "ok" };
    }

    const phone = extractPhone(body);
    const message = extractMessage(body);

    if (!phone || !message) {
      console.log("Mesaj veya telefon bulunamadı:", JSON.stringify(body));
      return { statusCode: 200, body: "ok" };
    }

    console.log(`Mesaj alındı: ${phone} → ${message}`);

    const botResponse = await generateResponse(phone, message);
    console.log(`AI cevabı: ${botResponse}`);

    await sleep(randomDelay());
    await sendWhatsApp(phone, botResponse);
    await saveConversation(phone, message, botResponse);

    console.log(`Cevap gönderildi: ${phone}`);
    return { statusCode: 200, body: "ok" };
  } catch (error) {
    console.error("Webhook hatası:", error.message);
    return { statusCode: 200, body: "ok" };
  }
};
