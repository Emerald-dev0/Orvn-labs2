-- ============================================================
-- Blog System Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Authors table
CREATE TABLE IF NOT EXISTS blog_authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'Author',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL REFERENCES blog_posts(slug) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_post_slug ON blog_comments(post_slug);
CREATE INDEX idx_comments_status ON blog_comments(status);

-- 4. Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_subscribers_status ON newsletter_subscribers(status);

-- 5. Blog settings table (single row)
CREATE TABLE IF NOT EXISTS blog_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_name TEXT DEFAULT 'ORVN Labs Blog',
  posts_per_page INTEGER DEFAULT 9,
  enable_comments BOOLEAN DEFAULT true,
  enable_likes BOOLEAN DEFAULT true,
  enable_sharing BOOLEAN DEFAULT true,
  enable_views BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings if empty
INSERT INTO blog_settings (blog_name, posts_per_page, enable_comments, enable_likes, enable_sharing, enable_views)
SELECT 'ORVN Labs Blog', 9, true, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM blog_settings);

-- 6. Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for categories, authors, approved comments
CREATE POLICY "Public can read categories" ON blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read authors" ON blog_authors
  FOR SELECT USING (true);

CREATE POLICY "Public can read approved comments" ON blog_comments
  FOR SELECT USING (status = 'approved');

-- Anyone can insert comments (pending moderation)
CREATE POLICY "Anyone can insert comments" ON blog_comments
  FOR INSERT WITH CHECK (true);

-- Anyone can subscribe to newsletter
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Public can read settings
CREATE POLICY "Public can read settings" ON blog_settings
  FOR SELECT USING (true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Admin full access on categories" ON blog_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on authors" ON blog_authors
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on comments" ON blog_comments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on subscribers" ON newsletter_subscribers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on settings" ON blog_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- 7. Auto-update category post counts
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE blog_categories
  SET post_count = (
    SELECT COUNT(*) FROM blog_posts WHERE category = NEW.category
  )
  WHERE name = NEW.category;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_count
  AFTER INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_category_post_count();

-- 8. Seed default category
INSERT INTO blog_categories (name, slug, description)
VALUES
  ('First-contact infrastructure', 'first-contact-infrastructure', 'Posts about first-contact infrastructure and response layers'),
  ('Lead leakage', 'lead-leakage', 'Posts about lead leakage and conversion losses'),
  ('CRM graveyards', 'crm-graveyards', 'Posts about CRM failures and data decay'),
  ('ISA operations', 'isa-operations', 'Posts about inside sales agent operations'),
  ('Agent handoff', 'agent-handoff', 'Posts about agent handoff and routing'),
  ('After-hours leads', 'after-hours-leads', 'Posts about after-hours lead capture'),
  ('Brokerage intelligence', 'brokerage-intelligence', 'Posts about brokerage intelligence systems'),
  ('PAS build notes', 'pas-build-notes', 'Technical build notes for PAS')
ON CONFLICT (name) DO NOTHING;

-- 9. Seed default author
INSERT INTO blog_authors (name, slug, role, bio)
VALUES ('ORVN Labs', 'orvn-labs', 'Company', 'Building first-contact infrastructure for real estate brokerages.')
ON CONFLICT (slug) DO NOTHING;
