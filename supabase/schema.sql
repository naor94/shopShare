-- ══════════════════════════════════════════════════════
-- BBQ Planner — Full Database Schema
-- Run this in the Supabase SQL Editor
-- ══════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── events ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name       TEXT NOT NULL,
  date       DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── families ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS families (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_families_event_id ON families(event_id);

-- ─── items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS items (
  id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id           UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  quantity           INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  assigned_family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  status             TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned')),
  created_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_items_event_id ON items(event_id);
CREATE INDEX IF NOT EXISTS idx_items_assigned_family ON items(assigned_family_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);

-- ─── purchases ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchases (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  family_id  UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  amount     NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchases_event_id ON purchases(event_id);
CREATE INDEX IF NOT EXISTS idx_purchases_family_id ON purchases(family_id);

-- ─── Row Level Security ───────────────────────────────
-- Enable RLS on all tables
ALTER TABLE events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE families  ENABLE ROW LEVEL SECURITY;
ALTER TABLE items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth required for MVP)
-- Restrict these if you add authentication later
CREATE POLICY "Public read events"   ON events   FOR SELECT USING (true);
CREATE POLICY "Public insert events" ON events   FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete events" ON events   FOR DELETE USING (true);

CREATE POLICY "Public read families"   ON families FOR SELECT USING (true);
CREATE POLICY "Public insert families" ON families FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete families" ON families FOR DELETE USING (true);

CREATE POLICY "Public read items"   ON items FOR SELECT USING (true);
CREATE POLICY "Public insert items" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update items" ON items FOR UPDATE USING (true);
CREATE POLICY "Public delete items" ON items FOR DELETE USING (true);

CREATE POLICY "Public read purchases"   ON purchases FOR SELECT USING (true);
CREATE POLICY "Public insert purchases" ON purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete purchases" ON purchases FOR DELETE USING (true);

-- ─── Realtime ─────────────────────────────────────────
-- Enable realtime on all tables in Supabase Dashboard:
-- Database → Replication → Toggle on: events, families, items
-- OR run:
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE families;
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE purchases;

-- ─── Sample Data (optional) ────────────────────────────
-- Uncomment to seed with sample data for testing:
/*
INSERT INTO events (name, date) VALUES ('על האש בפארק', CURRENT_DATE + 7)
RETURNING id;

-- Use the returned event_id below:
-- INSERT INTO families (event_id, name, color) VALUES
--   ('<event_id>', 'משפחת כהן', '#ef4444'),
--   ('<event_id>', 'משפחת לוי', '#3b82f6'),
--   ('<event_id>', 'משפחת ישראלי', '#22c55e');

-- INSERT INTO items (event_id, name, quantity) VALUES
--   ('<event_id>', 'סלט ירקות', 2),
--   ('<event_id>', 'פיתות', 3),
--   ('<event_id>', 'קטשופ', 1),
--   ('<event_id>', 'נקניקיות', 2),
--   ('<event_id>', 'המבורגרים', 2),
--   ('<event_id>', 'קולה', 2),
--   ('<event_id>', 'מים', 4),
--   ('<event_id>', 'עוגות', 1);
*/
