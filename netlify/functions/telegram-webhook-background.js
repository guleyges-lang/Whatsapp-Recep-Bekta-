const { createClient } = require("@supabase/supabase-js");
const pdfMake = require("pdfmake/build/pdfmake");
require("pdfmake/build/vfs_fonts");
if (global.pdfMake && global.pdfMake.vfs) {
  pdfMake.vfs = global.pdfMake.vfs;
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TG = () => "https://api.telegram.org/bot" + process.env.TELEGRAM_BOT_TOKEN;

const KATALOG_URLS = [
  "https://nwhuoyzezgrsilvwjohu.supabase.co/storage/v1/object/public/katalog/borular.jpg",
  "https://nwhuoyzezgrsilvwjohu.supabase.co/storage/v1/object/public/katalog/kasa_buat.jpg",
];

const KARSILAMA_METNI =
  "Merhaba! Guley Plastik'e hos geldiniz. Urun kataloglarimizi gonderdim. Tum urunlerimiz K.maras Ekinozu'nden fabrikadan direkt, %45 iskontolu toptanci fiyatlarimizla sunulmaktadir. Herhangi bir urun icin fiyat teklifi almak ister misiniz? Lutfen firma adinizi ve ihtiyacinizi belirtin.";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function randomDelay() {
  const min = parseInt(process.env.RESPONSE_DELAY_MIN || "10") * 1000;
  const max = parseInt(process.env.RESPONSE_DELAY_MAX || "40") * 1000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSistemPrompt() {
  const today = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `Sen Güley Plastik'in Telegram satış asistanısın. Görevin müşterilere ürün satmak ve fiyat teklifleri hazırlamaktır.
Türkçe yaz. Samimi, sıcak ama satış odaklı ol. Asla emoji kullanma.
Bugünün tarihi: ${today}

GÜLEY PLASTİK:
- Kahramanmaraş Ekinözü'nde plastik elektrik malzemeleri imalatçısı
- Adres: Anbar Ormandibi No1/10 Ekinözü/K.Maraş
- Tel: +90 537 363 06 08 | Web: www.guleyplastik.com
- Tüm Türkiye'ye kargo | Fabrikadan direkt = en uygun fiyat
- Ödeme: Nakit/havale peşin | Teslimat: Ekinözü depo (yüklü alımda yerine teslim)

ÜRÜNLERİMİZ (Liste Fiyatı → %45 indirimli Net Fiyat, KDV hariç):
KANGAL BORU (MT):
Siyah 6Atu: 14mm(4.26→2.34), 16mm(5.02→2.76), 18mm(5.80→3.19), 20mm(6.94→3.82), 25mm(10.78→5.93)
Siyah 10Atu: 14mm(5.02→2.76), 16mm(5.82→3.20), 18mm(6.58→3.62), 20mm(8.22→4.52), 25mm(11.30→6.22)
Turuncu 6Atu: 14mm(4.52→2.49), 16mm(5.34→2.94), 18mm(6.16→3.39), 20mm(7.16→3.94), 25mm(11.46→6.30)
Turuncu 10Atu: 14mm(5.34→2.94), 16mm(6.18→3.40), 18mm(6.84→3.76), 20mm(8.54→4.70), 25mm(11.72→6.45)
Mavi 6Atu: 14mm(4.42→2.43), 16mm(5.22→2.87), 18mm(6.02→3.31), 20mm(7.20→3.96), 25mm(11.20→6.16)
Mavi 10Atu: 14mm(5.22→2.87), 16mm(6.04→3.32), 18mm(6.84→3.76), 20mm(8.54→4.70), 25mm(11.72→6.45)
BUAT ve KASALAR (AD):
Kapakli Kare Buat: 80x80(10.00→5.50), 100x100(13.00→7.15), 120x120(14.00→7.70), 150x150(17.00→9.35), 200x200(28.00→15.40)
Kapaksiz Kare Buat: 80x80(8.00→4.40), 100x100(9.00→4.95), 120x120(10.60→5.83), 150x150(13.60→7.48), 200x200(20.40→11.22)
Kare Buat Kapagi: 80x80(4.20→2.31), 100x100(4.70→2.59), 120x120(5.80→3.19), 150x150(6.40→3.52), 200x200(16.00→8.80)
Bombeli Luks Buat(2.60→1.43), Gecmeli Derin Kasa(2.70→1.49), Norm Buat(4.60→2.53), Tunel Beton Buat(6.00→3.30)
Norm Kasa(2.50→1.38), Plastik Takoz(4.00→2.20), Sekizlik Dubel(0.18→0.10)
1-2 li Sigorta Kutusu(15.20→8.36), Plastik Tij Duy(15.00→8.25), Plastik Duy(18.00→9.90)

KONUSMA AKISI:
1. Asagidaki durumlarin HERHANGI birinde [KATALOG] gonder:
   - Musteri ilk kez yazdiginda (konusma gecmisi yoksa)
   - Musteri "merhaba", "selam", "bilgi almak istiyorum", "katalog", "ne satiyorsunuz" gibi mesaj gonderdiginde
   - Musteri urunler veya katalog hakkinda bilgi istediginde
   Yanıtının EN BASINA tam olarak [KATALOG] yaz, sonra karsilama metnini yaz. Fiyat hesabi YAPMA.
   ORNEK: [KATALOG]Merhaba! Guley Plastik'e hos geldiniz...
2. Musteri firma adini verdikten sonra urunleri ve miktarlari sor.
3. Musteri urun ve miktar belirttiginde fiyat teklifi hazirla.
4. [KATALOG] isaretini SADECE yukaridaki durumlarda kullan.
5. Karsilama mesajina ASLA fiyat hesabi ekleme.

FIYAT TEKLIFI KURALLARI:
- SADECE musterinin istedigi urunler icin teklif ver
- Once su bloku yaz (musteriye gosterilmez):
[TEKLIF]
FIRMA:Firma adi
KALEM:Urun adi|Miktar|Birim|ListeFiyati|NetFiyat|Toplam
[/TEKLIF]
Sonra: "Fiyat teklifinizi hazirladim, PDF olarak gonderiyorum."

ÖNEMLI ÜRÜN UYARISI:
- Musteri "kablo", "elektrik kablosu", "tel" gibi seyler sorarsa: "Kablo imalatimiz bulunmuyor, elektrik borusu imalatimiz var." de ve boru urunlerimizi oner
- Biz BORU ve BUAT/KASA imalatcisiyiz, kablo satmiyoruz

KISA SORU - KISA CEVAP KURALI:
- Musteri kisa ve tek bir sey soruyorsa (konum, adres, fiyat, telefon gibi) KISA cevap ver, uzun anlatma
- "yer neresi", "neredesiniz", "adres", "konum" gibi sorulara sadece: "K.maras/Ekinozu" yaz, baska ekleme yapma
- "telefon", "numara" sorulursa sadece: "+90 537 363 06 08" yaz
- "site", "web" sorulursa sadece: "www.guleyplastik.com" yaz
- Kisa soruya kisa cevap - musteri zaten bilgileri okumus, tekrar anlatma

SATIS KURALLARI:
- Fabrikadan direkt toptan fiyati vurgula
- Stok sinirli oldugunu ima et
- Toplu alimda ek indirim ima et
- Siparis icin havale + arac plakasi iste`;
}

async function getHistory(chatId) {
  try {
    const { data } = await supabase
      .from("conversations")
      .select("customer_message, bot_response")
      .eq("phone", "tg_" + chatId)
      .order("created_at", { ascending: false })
      .limit(8);
    if (!data || data.length === 0) return [];
    return data.reverse().flatMap((h) => [
      { role: "user", content: h.customer_message },
      { role: "assistant", content: h.bot_response },
    ]);
  } catch (e) {
    console.error("Gecmis yuklenemedi:", e.message);
    return [];
  }
}

async function saveConversation(chatId, customerMessage, botResponse) {
  try {
    await supabase.from("conversations").insert({
      phone: "tg_" + chatId,
      customer_message: customerMessage,
      bot_response: botResponse,
    });
  } catch (e) {
    console.error("Konusma kaydedilemedi:", e.message);
  }
}

async function generateResponse(chatId, message) {
  const history = await getHistory(chatId);
  const messages = [
    { role: "system", content: getSistemPrompt() },
    ...history,
    { role: "user", content: message },
  ];

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, max_tokens: 800, temperature: 0.7 }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices[0].message.content.trim();
    }
    const errText = await res.text();
    console.error(`Groq deneme ${attempt + 1} basarisiz: ${res.status} ${errText.slice(0, 100)}`);
    if (attempt === 0) await sleep(4000);
    else throw new Error("Groq: " + errText);
  }
}

async function humanizeText(text) {
  if (!text || text.length < 10) return text;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Sen bir Türk plastik malzeme satıcısısın ve Telegram'dan müşteriye yazıyorsun. Sana verilen metni aşağıdaki kurallara göre yeniden yaz:
- Gerçek bir insanın mesajı gibi yaz, robot gibi değil
- Kısa ve doğal cümleler kur
- Türkçe'de günlük konuşma dilini kullan ama profesyonel kal
- Bilgileri koru: fiyatlar, ürün adları, firma adı, telefon numaraları DEĞİŞMEZ
- Emoji kullanma
- Sadece yeniden yazılmış mesajı ver, açıklama ekleme`,
          },
          { role: "user", content: text },
        ],
        max_tokens: 600,
        temperature: 0.8,
      }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    return data.choices[0].message.content.trim() || text;
  } catch {
    return text;
  }
}

function parseQuote(text) {
  const match = text.match(/\[TEKLIF\]([\s\S]*?)\[\/TEKLIF\]/);
  if (!match) return null;
  const lines = match[1].trim().split("\n").map((l) => l.trim()).filter(Boolean);
  const data = { firma: "Musteri", items: [] };
  for (const line of lines) {
    if (line.startsWith("FIRMA:")) {
      data.firma = line.slice(6).trim();
    } else if (line.startsWith("KALEM:")) {
      const parts = line.slice(6).split("|");
      if (parts.length >= 6) {
        const qty = parseFloat(parts[1]) || 0;
        const listPrice = parseFloat(parts[3]) || 0;
        const netPrice = parseFloat(parts[4]) || 0;
        const total = Math.round(qty * netPrice * 100) / 100;
        data.items.push({ name: parts[0].trim(), qty, unit: parts[2].trim(), listPrice, netPrice, total });
      }
    }
  }
  return data.items.length > 0 ? data : null;
}

function fmtNum(n) {
  const [intPart, decPart] = n.toFixed(2).split(".");
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + decPart;
}

async function generatePDF(quoteData, quoteNumber, tarih) {
  return new Promise((resolve, reject) => {
    try {
      const kdvHaric = Math.round(quoteData.items.reduce((s, i) => s + i.total, 0) * 100) / 100;
      const kdvTutar = Math.round(kdvHaric * 0.2 * 100) / 100;
      const genelToplam = Math.round((kdvHaric + kdvTutar) * 100) / 100;
      const th = { fontSize: 8, bold: true, fillColor: "#eeeeee" };
      const tableBody = [
        [
          { text: "Sira", ...th, alignment: "center" },
          { text: "Malzeme Adi", ...th },
          { text: "Miktar", ...th, alignment: "right" },
          { text: "Birim", ...th, alignment: "center" },
          { text: "Liste Fiyati", ...th, alignment: "right" },
          { text: "Iskonto", ...th, alignment: "center" },
          { text: "Net Fiyat", ...th, alignment: "right" },
          { text: "Toplam Fiyat", ...th, alignment: "right" },
        ],
        ...quoteData.items.map((item, idx) => [
          { text: String(idx + 1), fontSize: 8, alignment: "center" },
          { text: item.name, fontSize: 8 },
          { text: String(item.qty), fontSize: 8, alignment: "right" },
          { text: item.unit, fontSize: 8, alignment: "center" },
          { text: fmtNum(item.listPrice), fontSize: 8, alignment: "right" },
          { text: "45,00%", fontSize: 8, alignment: "center" },
          { text: fmtNum(item.netPrice), fontSize: 8, alignment: "right" },
          { text: "TL" + fmtNum(item.total), fontSize: 8, alignment: "right" },
        ]),
      ];
      const docDef = {
        pageSize: "A4", pageMargins: [40, 40, 40, 40],
        content: [
          { columns: [
            { stack: [{ text: "GULEY PLASTIK", bold: true, fontSize: 20, color: "#1a6b3c" }, { text: "SAN.TIC.LTD.STI", fontSize: 8, color: "#1a6b3c" }], width: 200 },
            { width: "*", text: "" },
            { stack: [{ text: "GULEY PLASTIK SAN.TIC.LTD. STI", bold: true, fontSize: 9 }, { text: "Anbar Ormandibi No1/10 Ekinozu/K.maras", fontSize: 8 }, { text: "Elbistan V.D:4110898", fontSize: 8 }, { text: "www.guleyplastik.com", fontSize: 8 }, { text: "info@guleyplastik.com", fontSize: 8 }], alignment: "right" },
          ], marginBottom: 8 },
          { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: "#999" }], marginBottom: 8 },
          { columns: [
            { stack: [{ text: "TEKLIF TARIHI VE NUMARASI", bold: true, fontSize: 8.5, lineHeight: 1.7 }, { text: "FIRMA ADI", bold: true, fontSize: 8.5, lineHeight: 1.7 }, { text: "FIRMA YETKILISI", bold: true, fontSize: 8.5, lineHeight: 1.7 }, { text: "TEKLIFI HAZIRLAYAN", bold: true, fontSize: 8.5, lineHeight: 1.7 }, { text: "EMAIL", bold: true, fontSize: 8.5, lineHeight: 1.7 }], width: 160 },
            { stack: [{ text: ": " + tarih + " - " + quoteNumber, fontSize: 8.5, lineHeight: 1.7 }, { text: ": " + quoteData.firma, fontSize: 8.5, lineHeight: 1.7 }, { text: ": GULEY PLASTIK", fontSize: 8.5, lineHeight: 1.7 }, { text: ": RECEP BEKTAS", fontSize: 8.5, lineHeight: 1.7 }, { text: ":recepbektas@hotmail.com.tr", fontSize: 8.5, lineHeight: 1.7 }], width: "*" },
          ], marginBottom: 12 },
          { table: { headerRows: 1, widths: [20, "*", 40, 28, 52, 43, 50, 65], body: tableBody }, layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => "#444", vLineColor: () => "#444", paddingLeft: () => 3, paddingRight: () => 3, paddingTop: () => 3, paddingBottom: () => 3 }, marginBottom: 5 },
          { columns: [{ width: "*", text: "" }, { table: { widths: [130, 85], body: [
            [{ text: "KDV'siz Toplam Tutar", fontSize: 8.5 }, { text: "TL" + fmtNum(kdvHaric), fontSize: 8.5, alignment: "right" }],
            [{ text: "KDV Tutari ( 20% )", fontSize: 8.5 }, { text: fmtNum(kdvTutar), fontSize: 8.5, alignment: "right" }],
            [{ text: "Genel Toplam", fontSize: 8.5, bold: true }, { text: fmtNum(genelToplam), fontSize: 8.5, alignment: "right", bold: true }],
          ]}, layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => "#444", vLineColor: () => "#444", paddingLeft: () => 5, paddingRight: () => 5, paddingTop: () => 3, paddingBottom: () => 3 } }], marginBottom: 15 },
          { stack: [
            { text: "Siparis teyidinde nakit havale ile odenecektir.", fontSize: 8, decoration: "underline", lineHeight: 1.6 },
            { text: "Teslimat Sekli: Ekinozu/K.maras depomuz teslimidir. Yuklu alimlarda yerine teslim yapilir.", fontSize: 8, decoration: "underline", lineHeight: 1.6 },
            { text: "Opsiyon: Fiyat teklifimiz 3 gun gecerlidir.", fontSize: 8, lineHeight: 1.6 },
            { text: "Teklif Butunlugu: Teklifimiz butun olarak gecerlidir.", fontSize: 8, lineHeight: 1.6 },
          ]},
        ],
        defaultStyle: { font: "Roboto" },
      };
      pdfMake.createPdf(docDef).getBuffer((buffer) => {
        if (!buffer) { reject(new Error("PDF buffer bos")); return; }
        resolve(Buffer.from(buffer));
      });
    } catch (e) { reject(e); }
  });
}

async function getNextQuoteNumber() {
  try {
    const { count } = await supabase.from("quotes").select("*", { count: "exact", head: true });
    return (count || 0) + 1;
  } catch {
    return Math.floor(Date.now() % 9000) + 1000;
  }
}

async function uploadPDF(buffer, filename) {
  const { error } = await supabase.storage.from("quotes").upload(filename, buffer, { contentType: "application/pdf", upsert: true });
  if (error) throw new Error("Storage: " + error.message);
  const { data } = supabase.storage.from("quotes").getPublicUrl(filename);
  return data.publicUrl;
}

async function tgSendMessage(chatId, text) {
  await fetch(TG() + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function tgSendPhoto(chatId, photoUrl) {
  const res = await fetch(TG() + "/sendPhoto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl }),
  });
  const txt = await res.text();
  console.log("TG foto yanit: " + res.status + " " + txt.slice(0, 100));
}

async function tgSendDocument(chatId, docUrl, caption) {
  await fetch(TG() + "/sendDocument", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, document: docUrl, caption }),
  });
}

async function sendKatalogAndGreeting(chatId) {
  for (const url of KATALOG_URLS) {
    try { await tgSendPhoto(chatId, url); } catch (e) { console.error("TG foto hatasi:", e.message); }
    await sleep(3000);
  }
  try { await tgSendMessage(chatId, KARSILAMA_METNI); } catch (e) { console.error("TG karsilama hatasi:", e.message); }
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 200, body: "ok" };

    const body = JSON.parse(event.body || "{}");
    const msg = body.message || body.edited_message;
    if (!msg) return { statusCode: 200, body: "ok" };

    // Grup mesajlarını yoksay
    if (msg.chat.type !== "private") return { statusCode: 200, body: "ok" };

    const chatId = msg.chat.id;
    const message = msg.text || null;

    console.log("TG Mesaj: " + chatId + " -> " + (message || "[MEDYA]"));

    if (!message) {
      await sleep(randomDelay());
      await sendKatalogAndGreeting(chatId);
      await saveConversation(chatId, "[MEDYA]", KARSILAMA_METNI);
      return { statusCode: 200, body: "ok" };
    }

    let botResponse;
    try {
      botResponse = await generateResponse(chatId, message);
    } catch (aiErr) {
      console.error("AI hatasi:", aiErr.message);
      await sleep(randomDelay());
      await sendKatalogAndGreeting(chatId);
      await saveConversation(chatId, message, KARSILAMA_METNI);
      return { statusCode: 200, body: "ok" };
    }

    console.log("AI: " + botResponse);
    await sleep(randomDelay());

    const sendKatalog = /\[KATALOG\]|\bKATALOG\b/.test(botResponse);
    const quoteData = parseQuote(botResponse);
    const rawText = botResponse
      .replace(/\[?KATALOG\]?/g, "")
      .replace(/\[TEKLIF\][\s\S]*?\[\/TEKLIF\]/g, "")
      .trim();
    const cleanText = rawText ? await humanizeText(rawText) : rawText;

    if (sendKatalog) {
      for (const url of KATALOG_URLS) {
        try { await tgSendPhoto(chatId, url); } catch (e) { console.error("TG foto hatasi:", e.message); }
        await sleep(3000);
      }
    }

    if (quoteData) {
      try {
        const tarih = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
        const quoteNumber = await getNextQuoteNumber();
        const pdfBuffer = await generatePDF(quoteData, quoteNumber, tarih);
        const filename = "Fiyat_Teklifimiz_" + tarih.replace(/\./g, "") + "_" + quoteNumber + ".pdf";
        const pdfUrl = await uploadPDF(pdfBuffer, filename);
        await tgSendDocument(chatId, pdfUrl, "Fiyat teklifiniz ektedir.");
        await saveConversation(chatId, message, cleanText);
        console.log("TG PDF gonderildi: " + chatId);
      } catch (pdfErr) {
        console.error("PDF hatasi:", pdfErr.message);
        try { await tgSendMessage(chatId, cleanText || "Fiyat teklifinizi hazirladim. Detaylar icin arayin: +90 537 363 06 08"); } catch {}
        await saveConversation(chatId, message, cleanText);
      }
    } else {
      if (cleanText) {
        try { await tgSendMessage(chatId, cleanText); } catch (e) { console.error("TG mesaj hatasi:", e.message); }
      }
      await saveConversation(chatId, message, cleanText);
    }

    return { statusCode: 200, body: "ok" };
  } catch (error) {
    console.error("TG webhook hatasi:", error.message);
    return { statusCode: 200, body: "ok" };
  }
};
