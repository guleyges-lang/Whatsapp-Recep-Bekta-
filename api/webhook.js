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

function getSistemPrompt() {
  const today = new Date().toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `Sen Güley Plastik'te çalışan Recep'sin. WhatsApp'tan müşterilere yazıyorsun. Yapay zeka olduğunu belli etme, gerçek bir insan gibi davran.
Bugünün tarihi: ${today}

KONUŞMA TARZI - ÇOK ÖNEMLİ:
- Gerçek bir Türk satıcı gibi yaz, robotik kalıp YAPMA
- Kısa ve doğal cümleler kur. WhatsApp mesajı gibi yaz
- Emoji kullanma
- Yapay zeka olduğunu soran müşteriye: "Hayır, ben Recep, Güley Plastik satış ekibindenim" de

TEKRAR ETME KURALI - EN ÖNEMLİ KURAL:
- Konusma gecmisine bak. Daha once yazdigin hicbir seyi BIR DAHA YAZMA
- Firma tanitimi (Guley Plastik, Ekinozu, fabrikadan direkt) bir kere soylediysen bir daha yazma
- "%45 iskonto", "toptanci fiyati", "kargo" bilgisi bir kere gectiyse tekrarlama
- Musteri sorusunu cevapla, arka arkaya ayni kaliplari dizme
- Her mesajda farkli bir giris kullan — ama "Merhaba" veya "Tabii ki" gibi basit baslangiclari her seferinde tekrarlama
- Onceki mesajlarda ne soylediysen o bilgiyi tekrar verme, musteri zaten okudu

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
1. [KATALOG] SADECE su tek durumda gonder:
   - Musteri hic konusma gecmisi yokken SADECE selamlasma veya genel bilgi talebi yazdiginda
   - Ornek [KATALOG] durumlari: "merhaba", "selam", "iyi gunler", "bilgi almak istiyorum", "ne satiyorsunuz", "katalog gonderir misiniz"

   [KATALOG] KESINLIKLE GONDERME su durumlarda:
   - Musteri bir urun adi (boru, buat, kasa vb.) yaziyorsa
   - Musteri miktar yaziyorsa (100 adet, 1500 mt vb.)
   - Musteri "fiyat", "teklif", "ne kadar", "fiyati nedir" diyorsa
   - Konusma gecmisinde daha onceki mesajlar varsa (zaten tanitildiniz)

   [KATALOG] gonderilecekse:
   - Yanitinin EN BASINA tam olarak su 9 karakteri yaz: [KATALOG]
   - Ardindan hemen su karsilama mesajini yaz (fiyat hesaplama YAPMA, sadece bu metni yaz):
     "Merhaba! Guley Plastik'e hos geldiniz. Urun kataloglarimizi gonderdim. Tum urunlerimiz K.maras Ekinozu'nden fabrikadan direkt, %45 iskontolu toptanci fiyatlarimizla sunulmaktadir. Herhangi bir urun icin fiyat teklifi almak ister misiniz? Lutfen firma adinizi ve ihtiyacinizi belirtin."
   - ORNEK dogru cikti: [KATALOG]Merhaba! Guley Plastik'e hos geldiniz...
   - YANLIS cikti ornekleri: "KATALOG Merhaba...", "[ KATALOG ] Merhaba...", fiyat hesabi eklemek

2. Musteri urun adi + miktar yazarak fiyat istediginde DIREKT [TEKLIF] hazirla. Once katalog gonderme, once soru sorma — hemen teklifi hazirla.
   - Firma adi verilmemisse FIRMA alanina "Musteri" yaz, mesajin sonuna "Firma adinizi ogrenebilir miyim?" ekle
   - Musteri miktarsiz fiyat sorarsa (ornek: "14mm boru fiyati nedir") kisa fiyat bilgisi ver, miktar iste

3. [KATALOG] isaretini yukardaki tek durumun DISINDA ASLA kullanma.
4. Karsilama mesajina ASLA fiyat hesabi, urun miktari veya toplam tutar ekleme.

FIYAT TEKLIFI KURALLARI:
- SADECE musterinin istedigi urunler icin teklif ver
- NetFiyat = ListeFiyati x 0.55 (yani %45 indirim)
- Fiyat teklifi hazirlarken ONCE su yapılandırılmış bloku yaz (bu musteriye gosterilmez, PDF olusturmak icin kullanilir):

[TEKLIF]
FIRMA:Firma adi
KALEM:Urun adi|Miktar|Birim|ListeFiyati|NetFiyat|Toplam
[/TEKLIF]

Sonra kisa bir mesaj yaz: "Fiyat teklifinizi hazirladim, PDF olarak gonderiyorum."

ÖNEMLI ÜRÜN UYARISI:
- Musteri "kablo", "elektrik kablosu", "tel" gibi seyler sorarsa: "Kablo imalatimiz bulunmuyor, elektrik borusu imalatimiz var." de ve boru urunlerimizi oner
- Musteri elektrik borusu HARICI herhangi bir boru soruyorsa (su borusu, ppr boru, pvc boru, pe boru, hdpe boru, galvanize boru, celik boru, bakir boru, dogalgaz borusu, kalorifer borusu, kanalizasyon borusu, drenaj borusu, polietilen boru vb.) kesinlikle "Yok, biz sadece elektrik borusu, buat ve kasa imalatcisiyiz." de
- Biz SADECE elektrik borusu (kangal boru), buat ve kasa imalatcisiyiz. Baska hicbir boru cesidi satmiyoruz.

KANGAL BORU SATIS BIRIMI:
- Borular "top" veya "mt (metre)" olarak satilebilir
- 1 top = 100 mt (yuz metre)
- Musteri "top" cinsinden isterse: kaç top istedigini mt'ye cevir (ornek: 10 top = 1000 mt)
- Fiyat teklifinde birim olarak "MT" kullan, miktari mt olarak yaz (10 top ise 1000 mt yaz)
- Musteri "10 top 14mm boru" derse → teklif 1000 MT olarak hazirla
- Teklifin altindaki kisa mesajda "10 top (1000 mt)" seklinde belirtebilirsin

ÖDEME:
- Musteri "kapida odeme", "kapi odeme", "kapida odeme var mi" gibi seyler sorarsa: "Kapida odeme bulunmuyor, biz imalatciyiz. Odeme nakit havale pesindir." de

DİL KURALI:
- Müşteri hangi dilde yazıyorsa o dilde cevap ver (Arapça, İngilizce, Kürtçe, Farsça vb.)
- Türkçe yazanlara Türkçe, Arapça yazanlara Arapça, İngilizce yazanlara İngilizce cevap ver
- Fiyatlar TL (Türk Lirası) cinsindendir, uluslararası müşterilere bunu belirt
- Tüm uluslararası siparişler için kargo yapılabilir, bunu vurgula

KISA SORU - KISA CEVAP KURALI:
- Musteri kisa ve tek bir sey soruyorsa (konum, adres, fiyat, telefon gibi) KISA cevap ver, uzun anlatma
- "yer neresi", "neredesiniz", "adres", "konum" gibi sorulara sadece: "K.maras/Ekinozu" yaz, baska ekleme yapma
- "telefon", "numara" sorulursa sadece: "+90 537 363 06 08" yaz
- "site", "web" sorulursa sadece: "www.guleyplastik.com" yaz
- Kisa soruya kisa cevap - musteri zaten bilgileri okumus, tekrar anlatma

SATIS KURALLARI:
- Fabrikadan direkt toptan fiyati vurgusunu yap
- Stok sinirli oldugunu ima et
- Toplu alimda ek indirim ima et
- Siparis icin havale + arac plakasi iste`;
}

const KARSILAMA_METNI =
  "Merhaba! Guley Plastik'e hos geldiniz. Urun kataloglarimizi gonderdim. Tum urunlerimiz K.maras Ekinozu'nden fabrikadan direkt, %45 iskontolu toptanci fiyatlarimizla sunulmaktadir. Herhangi bir urun icin fiyat teklifi almak ister misiniz? Lutfen firma adinizi ve ihtiyacinizi belirtin.";

const OWNER_PHONE = "905373630608"; // Recep Bektas - bot bildirimlerini alir

const KATALOG_URLS = [
  "https://nwhuoyzezgrsilvwjohu.supabase.co/storage/v1/object/public/katalog/borular.jpg",
  "https://nwhuoyzezgrsilvwjohu.supabase.co/storage/v1/object/public/katalog/kasa_buat.jpg",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?instructions/i,
  /forget\s+(all\s+)?(previous\s+)?instructions/i,
  /system\s*prompt/i,
  /api\s*key/i,
  /reveal\s+your/i,
  /you\s+are\s+now\s+(a\s+)?/i,
  /act\s+as\s+(a\s+)?/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /\[TEKLIF\].*KALEM:/i,
  /FIRMA:.*\|.*\|/i,
];

function detectInjection(text) {
  return INJECTION_PATTERNS.some((p) => p.test(text));
}

function sanitizeInput(text) {
  if (!text) return null;
  if (text.length > 500) {
    console.log("Uzun mesaj kirpildi:", text.length);
    return text.slice(0, 500);
  }
  return text.trim();
}

async function isRateLimited(phone) {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("phone", phone)
      .gte("created_at", oneMinuteAgo);
    return (count || 0) >= 8;
  } catch {
    return false;
  }
}

function extractMessage(body) {
  if (body.data?.messages?.messageBody) return body.data.messages.messageBody;
  if (body.data?.messages?.message?.conversation) return body.data.messages.message.conversation;
  if (body.data?.messages?.message?.extendedTextMessage?.text) return body.data.messages.message.extendedTextMessage.text;
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

function isGroupMessage(body) {
  const phone = extractPhone(body);
  if (!phone) return false;
  return phone.includes("@g.us") || phone.includes("@broadcast") || /^\d{10,15}-\d+$/.test(phone);
}

async function getHistory(phone) {
  try {
    const { data } = await supabase
      .from("conversations")
      .select("customer_message, bot_response")
      .eq("phone", phone)
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

async function katalogGonderildiMi(phone) {
  try {
    const { count } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("phone", phone);
    return (count || 0) > 0;
  } catch {
    return false;
  }
}

async function saveConversation(phone, customerMessage, botResponse) {
  try {
    await supabase.from("conversations").insert({ phone, customer_message: customerMessage, bot_response: botResponse });
  } catch (e) {
    console.error("Konusma kaydedilemedi:", e.message);
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
  const num = parseFloat(n) || 0;
  const [intPart, decPart] = num.toFixed(2).split(".");
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
        pageSize: "A4",
        pageMargins: [40, 40, 40, 40],
        content: [
          {
            columns: [
              { stack: [{ text: "GULEY PLASTIK", bold: true, fontSize: 20, color: "#1a6b3c" }, { text: "SAN.TIC.LTD.STI", fontSize: 8, color: "#1a6b3c" }], width: 200 },
              { width: "*", text: "" },
              { stack: [{ text: "GULEY PLASTIK SAN.TIC.LTD. STI", bold: true, fontSize: 9 }, { text: "Anbar Ormandibi No1/10 Ekinozu/K.maras", fontSize: 8 }, { text: "Elbistan V.D:4110898", fontSize: 8 }, { text: "www.guleyplastik.com", fontSize: 8 }, { text: "info@guleyplastik.com", fontSize: 8 }], alignment: "right" },
            ],
            marginBottom: 8,
          },
          { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: "#999" }], marginBottom: 8 },
          {
            columns: [
              { stack: [{ text: "TEKLIF TARIHI VE NUMARASI", bold: true, fontSize: 8.5, lineHeight: 1.7 }, { text: "FIRMA ADI", bold: true, fontSize: 8.5, lineHeight: 1.7 }, { text: "FIRMA YETKILISI", bold: true, fontSize: 8.5, lineHeight: 1.7 }, { text: "TEKLIFI HAZIRLAYAN", bold: true, fontSize: 8.5, lineHeight: 1.7 }, { text: "EMAIL", bold: true, fontSize: 8.5, lineHeight: 1.7 }], width: 160 },
              { stack: [{ text: ": " + tarih + " - " + quoteNumber, fontSize: 8.5, lineHeight: 1.7 }, { text: ": " + quoteData.firma, fontSize: 8.5, lineHeight: 1.7 }, { text: ": GULEY PLASTIK", fontSize: 8.5, lineHeight: 1.7 }, { text: ": RECEP BEKTAS", fontSize: 8.5, lineHeight: 1.7 }, { text: ":recepbektas@hotmail.com.tr", fontSize: 8.5, lineHeight: 1.7 }], width: "*" },
            ],
            marginBottom: 12,
          },
          {
            table: { headerRows: 1, widths: [20, "*", 40, 28, 52, 43, 50, 65], body: tableBody },
            layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => "#444", vLineColor: () => "#444", paddingLeft: () => 3, paddingRight: () => 3, paddingTop: () => 3, paddingBottom: () => 3 },
            marginBottom: 5,
          },
          {
            columns: [
              { width: "*", text: "" },
              {
                table: {
                  widths: [130, 85],
                  body: [
                    [{ text: "KDV'siz Toplam Tutar", fontSize: 8.5 }, { text: "TL" + fmtNum(kdvHaric), fontSize: 8.5, alignment: "right" }],
                    [{ text: "KDV Tutari ( 20% )", fontSize: 8.5 }, { text: fmtNum(kdvTutar), fontSize: 8.5, alignment: "right" }],
                    [{ text: "Genel Toplam", fontSize: 8.5, bold: true }, { text: fmtNum(genelToplam), fontSize: 8.5, alignment: "right", bold: true }],
                  ],
                },
                layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => "#444", vLineColor: () => "#444", paddingLeft: () => 5, paddingRight: () => 5, paddingTop: () => 3, paddingBottom: () => 3 },
              },
            ],
            marginBottom: 15,
          },
          {
            stack: [
              { text: "Siparis teyidinde nakit havale ile odenecektir. Odemesi alinmamis siparislerin iptal hakki firmamiza aittir.", fontSize: 8, decoration: "underline", lineHeight: 1.6 },
              { text: "Teslimat Sekli: Ekinozu/K.maras depomuz teslimidir. Yuklu alimlarda yerine teslim yapilir.", fontSize: 8, decoration: "underline", lineHeight: 1.6 },
              { text: "Opsiyon: Fiyat teklifimiz 3 gun gecerlidir.", fontSize: 8, lineHeight: 1.6 },
              { text: "Teklif Butunlugu: Teklifimiz butun olarak gecerlidir.", fontSize: 8, lineHeight: 1.6 },
            ],
          },
        ],
        defaultStyle: { font: "Roboto" },
      };
      pdfMake.createPdf(docDef).getBuffer((buffer) => {
        if (!buffer) { reject(new Error("PDF buffer bos")); return; }
        resolve(Buffer.from(buffer));
      });
    } catch (e) {
      reject(e);
    }
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

async function saveQuote(phone, firma, total, pdfUrl) {
  try {
    await supabase.from("quotes").insert({ phone, firma, total_amount: total, pdf_url: pdfUrl });
  } catch (e) {
    console.error("Teklif kaydedilemedi:", e.message);
  }
}

async function sendImage(phone, imageUrl) {
  const res = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.WASENDER_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ to: phone, imageUrl }),
  });
  const bodyText = await res.text();
  console.log("Resim yaniti " + res.status + ":", bodyText.slice(0, 200));
  if (!res.ok) throw new Error("WasenderAPI resim " + res.status + ": " + bodyText.slice(0, 100));
}

async function sendDocument(phone, pdfUrl, filename) {
  const res = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.WASENDER_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ to: phone, documentUrl: pdfUrl, fileName: filename, text: "Fiyat teklifiniz ektedir." }),
  });
  if (!res.ok) throw new Error("WasenderAPI belge: " + res.status);
}

async function sendWhatsApp(phone, text) {
  const res = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.WASENDER_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ to: phone, text }),
  });
  if (!res.ok) throw new Error("WasenderAPI: " + res.status);
}

async function notifyOwner(mesaj) {
  try {
    const zaman = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    await fetch("https://www.wasenderapi.com/api/send-message", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.WASENDER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ to: OWNER_PHONE, text: "BOT UYARI [" + zaman + "]: " + mesaj }),
    });
  } catch { /* bildirim gonderilemese de bot calismaya devam eder */ }
}

async function sendImageWithRetry(phone, imageUrl, label) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await sendImage(phone, imageUrl);
      console.log(label + " gonderildi (deneme " + attempt + ")");
      return;
    } catch (e) {
      console.error(label + " hatasi (deneme " + attempt + "):", e.message);
      if (attempt < 3) await sleep(3000);
    }
  }
  console.error(label + " 3 denemede de gonderilemedi");
}

async function sendKatalogAndGreeting(phone) {
  console.log("Katalog gonderimi basliyor:", phone);
  await sendImageWithRetry(phone, KATALOG_URLS[0], "Gorsel1");
  await sleep(4000);
  // 2. gorsel + karsilama metni ayni mesajda (caption olarak) - 3 mesaj yerine 2 mesaj
  try {
    const res = await fetch("https://www.wasenderapi.com/api/send-message", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.WASENDER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ to: phone, imageUrl: KATALOG_URLS[1], text: KARSILAMA_METNI }),
    });
    const bodyText = await res.text();
    console.log("Gorsel2+metin yaniti " + res.status + ":", bodyText.slice(0, 200));
    if (!res.ok) throw new Error("WasenderAPI gorsel2+metin " + res.status);
    console.log("Gorsel2 ve karsilama metni gonderildi");
  } catch (e) {
    console.error("Gorsel2+metin hatasi:", e.message);
    // Fallback: gorsel ve metni ayri ayri gonder
    await sendImageWithRetry(phone, KATALOG_URLS[1], "Gorsel2-fallback");
    await sleep(5000);
    try { await sendWhatsApp(phone, KARSILAMA_METNI); } catch (e2) { console.error("Karsilama fallback hatasi:", e2.message); }
  }
}

// Yedek model listesi - birincil rate limit yerse sıradaki denenir
const GROQ_MODELLER = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
];

async function generateResponse(phone, message) {
  const history = await getHistory(phone);
  const messages = [
    { role: "system", content: getSistemPrompt() },
    ...history,
    { role: "user", content: message },
  ];

  for (const model of GROQ_MODELLER) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + process.env.GROQ_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, max_tokens: 800, temperature: 0.7 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (model !== GROQ_MODELLER[0]) console.log("Yedek model kullandi:", model);
        return data.choices[0].message.content.trim();
      }
      const errText = await res.text();
      console.error(`Groq ${model} deneme ${attempt + 1}: ${res.status} ${errText.slice(0, 80)}`);
      if (res.status === 429) break; // Rate limit - bu modeli birak, yedege gec
      if (attempt === 0) await sleep(3000);
    }
  }
  throw new Error("Tum Groq modelleri basarisiz");
}

async function handleWebhook(body, query, headers) {
  if (body.event && body.event !== "messages.received") return;
  if (isOwnMessage(body)) return;
  if (isGroupMessage(body)) return;

  const phone = extractPhone(body);
  const rawMessage = extractMessage(body);

  if (!phone) {
    console.log("Telefon bulunamadi:", JSON.stringify(body).slice(0, 200));
    return;
  }

  // Sahibin kendi mesajlarini isleme (bildirim dongusunu onler)
  if (phone === OWNER_PHONE) return;

  // Webhook secret kontrolü
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const reqSecret = query?.secret || headers?.["x-webhook-secret"];
    if (reqSecret !== webhookSecret) {
      console.log("Gecersiz webhook secret:", phone);
      return;
    }
  }

  // Rate limit
  if (await isRateLimited(phone)) {
    console.log("Rate limit asildi:", phone);
    try { await sendWhatsApp(phone, "Mesajlarinizi aldim, siraniza gore donuyorum. Biraz bekleyin lutfen."); } catch {}
    return;
  }

  const message = sanitizeInput(rawMessage);

  if (!message) {
    if (await katalogGonderildiMi(phone)) {
      console.log("Medya mesaji ama katalog zaten gonderilmis:", phone);
      return;
    }
    console.log("Metin yok (gorsel/ses/belge), katalog gonderiliyor:", phone);
    await sendKatalogAndGreeting(phone);
    await saveConversation(phone, "[MEDYA]", KARSILAMA_METNI);
    return;
  }

  if (detectInjection(message)) {
    console.log("Injection tespit edildi:", phone);
    try { await sendWhatsApp(phone, "Bu konuda size yardimci olamiyorum. Urunlerimiz hakkinda bilgi almak ister misiniz?"); } catch {}
    return;
  }

  console.log("Mesaj: " + phone + " -> " + message);

  let botResponse;
  try {
    botResponse = await generateResponse(phone, message);
  } catch (aiErr) {
    console.error("AI hatasi:", aiErr.message);
    await notifyOwner("AI yanit veremedi! Musteri: " + phone + " | " + aiErr.message.slice(0, 80));
    if (await katalogGonderildiMi(phone)) {
      try { await sendWhatsApp(phone, "Mesajinizi aldim, en kisa surede donuyorum."); } catch {}
    } else {
      await sendKatalogAndGreeting(phone);
      await saveConversation(phone, message, KARSILAMA_METNI);
    }
    return;
  }

  console.log("AI: " + botResponse.slice(0, 100));

  let sendKatalog = /\[KATALOG\]|\bKATALOG\b/.test(botResponse);

  // Musteri fiyat/urun/miktar soruyorsa katalog gonderme - AI yanlis karar verdi demektir
  const fiyatTalebi = /fiyat|teklif|ne kadar|kaç (lira|tl|para)|\d+\s*(mt|metre|adet|ad\b|top)|(\d+mm)|\d+\s*top\b|boru|buat|kasa|kangal|sigorta kutusu|duy|dubel|takoz/i.test(message);
  if (sendKatalog && fiyatTalebi) {
    console.log("Fiyat/urun talebi tespit edildi, katalog atlanıyor:", message.slice(0, 80));
    sendKatalog = false;
  }

  const quoteData = parseQuote(botResponse);
  const cleanText = botResponse
    .replace(/\[?KATALOG\]?/g, "")
    .replace(/\[TEKLIF\][\s\S]*?\[\/TEKLIF\]/g, "")
    .trim();

  if (sendKatalog) {
    if (await katalogGonderildiMi(phone)) {
      console.log("Katalog zaten gonderilmis, tekrar gonderilmiyor:", phone);
      const tekrarMetin = cleanText || "Nasil yardimci olabilirim?";
      try { await sendWhatsApp(phone, tekrarMetin); } catch (e) { console.error("Tekrar metin hatasi:", e.message); }
      await saveConversation(phone, message, tekrarMetin);
    } else {
      await sendKatalogAndGreeting(phone);
      await saveConversation(phone, message, KARSILAMA_METNI);
    }
    return;
  }

  if (quoteData) {
    try {
      const tarih = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
      const quoteNumber = await getNextQuoteNumber();
      const pdfBuffer = await generatePDF(quoteData, quoteNumber, tarih);
      const filename = "Fiyat_Teklifimiz_" + tarih.replace(/\./g, "") + "_" + quoteNumber + ".pdf";
      const pdfUrl = await uploadPDF(pdfBuffer, filename);
      await saveQuote(phone, quoteData.firma, quoteData.items.reduce((s, i) => s + i.total, 0), pdfUrl);
      await sendDocument(phone, pdfUrl, filename);
      await saveConversation(phone, message, cleanText);
    } catch (pdfErr) {
      console.error("PDF hatasi:", pdfErr.message);
      try { await sendWhatsApp(phone, cleanText || "Fiyat teklifinizi hazirladim. Detaylar icin arayin: +90 537 363 06 08"); } catch {}
      await saveConversation(phone, message, cleanText);
    }
  } else {
    if (cleanText) {
      try { await sendWhatsApp(phone, cleanText); } catch (e) { console.error("Metin hatasi:", e.message); }
    }
    await saveConversation(phone, message, cleanText);
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(200).send("ok");
  }

  const body = typeof req.body === "string"
    ? JSON.parse(req.body || "{}")
    : (req.body || {});

  try {
    await handleWebhook(body, req.query || {}, req.headers || {});
  } catch (error) {
    console.error("Webhook hatasi:", error.message);
    const phone = extractPhone(body);
    await notifyOwner("Kritik hata!" + (phone ? " Musteri: " + phone : "") + " | " + error.message.slice(0, 100));
    try {
      if (phone && phone !== OWNER_PHONE) {
        await sendWhatsApp(phone, "Mesajinizi aldim, en kisa surede donuyorum. Bilgi icin: +90 537 363 06 08");
      }
    } catch {}
  }

  return res.status(200).send("ok");
};
