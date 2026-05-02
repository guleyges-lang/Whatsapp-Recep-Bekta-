-- Supabase SQL Editor'e kopyalayıp çalıştır

CREATE TABLE IF NOT EXISTS conversations (
  id        BIGSERIAL PRIMARY KEY,
  phone     TEXT NOT NULL,
  customer_message TEXT,
  bot_response     TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sık sorgulanan "phone" alanına index (hız için)
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON conversations(phone);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);
