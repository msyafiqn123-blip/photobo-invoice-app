-- =========================================================================
-- SQL SCHEMA UNTUK SUPABASE DATABASE (PHOTOBO STUDIO INVOICES)
-- Salin dan jalankan script ini di menu "SQL Editor" pada dashboard Supabase Anda.
-- =========================================================================

-- 1. Buat Tabel Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    "invoiceCode" TEXT NOT NULL,
    "invoiceDate" DATE NOT NULL,
    "docType" TEXT NOT NULL,
    "stageCode" TEXT DEFAULT '01',
    "methodCode" TEXT DEFAULT '02',
    "packageCode" TEXT DEFAULT '03',
    client JSONB NOT NULL DEFAULT '{}'::jsonb,
    event JSONB NOT NULL DEFAULT '{}'::jsonb,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    "paymentMethod" TEXT DEFAULT 'BCA TRANSFER',
    "accountNumber" TEXT DEFAULT 'BCA 7045166686',
    "accountHolder" TEXT DEFAULT 'Sasiera Diva P',
    "hasStamp" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Akses Publik Anonim (Read, Insert, Update, Delete)
CREATE POLICY "Public Read Invoices" ON public.invoices
    FOR SELECT USING (true);

CREATE POLICY "Public Insert Invoices" ON public.invoices
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Invoices" ON public.invoices
    FOR UPDATE USING (true);

CREATE POLICY "Public Delete Invoices" ON public.invoices
    FOR DELETE USING (true);

-- 4. Indeks untuk Pencarian Cepat
CREATE INDEX IF NOT EXISTS idx_invoices_code ON public.invoices ("invoiceCode");
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices ("invoiceDate");
