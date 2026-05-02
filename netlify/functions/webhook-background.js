const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================================================================
// BOT KİŞİLİK AYARLARI — buraya kendi işini yaz
// =====================================================================
const SISTEM_PROMPT = `Sen Recep Bektaş'ın WhatsApp asistanısın.
Türkçe, samimi ve profesyonel bir şekilde konuş.
Kısa ve net cevaplar ver (maksimum 3-4 cümle).
Müşteriyi dinle, sorularına doğrudan cevap ver.
Eğer soruyu cevaplayamıyorsan, Recep Bey ile bizzat görüşmelerini öner.
Fiyat konusunda net bilgi yoksa "fiyatı öğrenip size döneceğim" de.
Asla emoji kullanma.`;
// =====================================================================

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function randomDelay() {
  const min = parseInt(process.env.RESPONSE_DELAY_MIN || "5") * 1000;
  const max = parseInt(process.env.RESPONSE_DELAY_MAX || "15") * 1000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// WasenderAPI webhook formatı:
// body.event = "messages.received"
// body.data.messages.key.cleanedSenderPn = telefon numarası
// body.data.messages.messageBody = mesaj metni
// body.data.messages.key.fromMe = kendi mesajı mı

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

  if (!data || data.length === 0) return "";

  return data
    .reverse()
    .map((h) => `Müşteri: ${h.customer_message}\nAsistan: ${h.bot_response}`)
    .join("\n\n");
}

async function generateResponse(phone, message) {
  const history = await getHistory(phone);

  const prompt = history
    ? `${SISTEM_PROMPT}\n\nGeçmiş konuşma:\n${history}\n\nMüşteri: ${message}\nAsistan:`
    : `${SISTEM_PROMPT}\n\nMüşteri: ${message}\nAsistan:`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

async function sendWhatsApp(phone, text) {
  const response = await fetch("https://wasenderapi.com/api/send-text-message", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WASENDER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId: process.env.WASENDER_SESSION_ID,
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

    // Sadece gelen mesajları işle
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
