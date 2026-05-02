const { createClient } = require("@supabase/supabase-js");

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
      max_tokens: 300,
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
