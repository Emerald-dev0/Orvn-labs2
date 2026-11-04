import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, ArrowUpRight, ArrowRight } from 'lucide-react';

import PageWrapper from '../components/PageWrapper';
import PageHero from '../components/site/PageHero';
import { Reveal } from '../components/site/Reveal';
import { useDocumentMeta } from '../lib/seo';
import { supabase, getAllCategories } from '../lib/supabase';

const EASE = [0.16, 1, 0.3, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: EASE, delay },
});

const fmt = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

function Skeleton() {
  return (
    <div className="blog-grid">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="blog-card" style={{ minHeight: 300 }}>
          <div style={{ aspectRatio: '16/10', background: 'var(--paper-deep)' }} />
          <div style={{ height: 10, width: '30%', background: 'var(--paper-deep)' }} />
          <div style={{ height: 18, width: '85%', background: 'var(--paper-deep)' }} />
          <div style={{ height: 12, width: '60%', background: 'var(--paper-deep)' }} />
        </div>
      ))}
    </div>
  );
}

export default function Blog() {
  useDocumentMeta({
    title: 'Journal — field notes on property presentation',
    description:
      'Notes on property presentation, verified facts, publishing with control and the work behind a professional real-estate presence.',
    path: '/blog',
    schema: {
      '@type': 'Blog',
      name: 'LAREI Journal',
      description: 'Notes for real-estate professionals on presentation, records and publishing.',
      publisher: { '@type': 'Organization', name: 'ORVN Labs' },
    },
  });

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 9;

  const loadCategories = async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch (err) {
      console.warn('Failed to load categories:', err);
    }
  };

  const loadTags = async () => {
    try {
      const { data, error: tagError } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('is_published', true);
      if (tagError) throw tagError;
      const allTags = [...new Set((data || []).flatMap((p) => p.tags || []))];
      setTags(allTags.sort());
    } catch (err) {
      console.warn('Failed to load tags:', err);
    }
  };

  const loadPosts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }
      setError('');
      const currentOffset = reset ? 0 : offset;

      let query = supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, category, author, featured_image_url, featured_image_alt, read_minutes, published_at, tags')
        .eq('is_published', true)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .range(currentOffset, currentOffset + LIMIT - 1);

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error: qError } = await query;
      if (qError) throw qError;

      const newPosts = data || [];
      if (reset) setPosts(newPosts);
      else setPosts((prev) => [...prev, ...newPosts]);

      setHasMore(newPosts.length === LIMIT);
      setOffset(currentOffset + LIMIT);
    } catch (err) {
      console.error('Failed to load blog posts:', err);
      setError('Could not load the journal right now. Please try again shortly.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };


  useEffect(() => {
    /* Data fetch on mount: the setters below are the external-system sync. */
    /* eslint-disable react-hooks/set-state-in-effect */
    loadCategories();
    loadTags();
    loadPosts(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    loadPosts(true);
  }, [selectedCategory]);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    const matchesTag = selectedTag ? (post.tags || []).includes(selectedTag) : true;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (post.title || '').toLowerCase().includes(q) || (post.excerpt || '').toLowerCase().includes(q);
    return matchesCategory && matchesTag && matchesSearch;
  });

  const clearing = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  const [featured, ...rest] = filteredPosts;

  return (
    <PageWrapper>
      <PageHero
        eyebrow="Journal"
        title={<>Field notes on property presentation.</>}
        lede="How professionals package, check and publish property, and what the work behind a convincing page actually looks like."
      />

      <section style={{ paddingBottom: 'clamp(48px,6vw,88px)' }}>
        <div className="shell">
          {/* Controls */}
          <div className="journal-bar">
            <div className="journal-search">
              <Search size={15} strokeWidth={1.6} color="var(--ink-dim)" />
              <input
                type="text"
                placeholder="Search the journal"
                value={searchQuery}
                aria-label="Search articles"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <X size={13} strokeWidth={1.8} />
                </button>
              )}
            </div>

            <div className="journal-filters">
              <button
                type="button"
                className={`chip ${!selectedCategory ? 'is-on' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`chip ${selectedCategory === cat ? 'is-on' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {tags.length > 0 && (
              <div className="journal-tags">
                {tags.slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`chip chip-sm ${selectedTag === tag ? 'is-on' : ''}`}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {(searchQuery || selectedCategory || selectedTag) && !loading && (
            <div className="journal-count">
              <span>
                {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                {searchQuery && <> for “{searchQuery}”</>}
                {selectedTag && <> tagged #{selectedTag}</>}
              </span>
              <button type="button" onClick={clearing} className="journal-clear">
                Clear filters
                <X size={12} strokeWidth={2} />
              </button>
            </div>
          )}

          {loading ? (
            <Skeleton />
          ) : error ? (
            <div className="journal-empty">
              <p className="lead">{error}</p>
              <button type="button" onClick={() => loadPosts(true)} className="btn-secondary">
                Try again
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="journal-empty">
              <span className="label-mono">Nothing here yet</span>
              <h2 className="h-display-2" style={{ maxWidth: '18ch' }}>
                No articles match that <span className="em">filter.</span>
              </h2>
              <button type="button" onClick={clearing} className="btn-secondary">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <motion.article {...fadeUp(0)} className="journal-feature">
                  {featured.featured_image_url && (
                    <Link to={`/blog/${featured.slug}`} className="journal-feature-media">
                      <img
                        src={featured.featured_image_url}
                        alt={featured.featured_image_alt || featured.title}
                        loading="eager"
                      />
                    </Link>
                  )}
                  <div className="journal-feature-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span className="label-mono-primary">Featured</span>
                      <span className="label-mono">{featured.category}</span>
                    </div>
                    <Link to={`/blog/${featured.slug}`}>
                      <h2>{featured.title}</h2>
                    </Link>
                    <p>{featured.excerpt}</p>
                    <div className="journal-meta">
                      <span>{fmt(featured.published_at)}</span>
                      <span>·</span>
                      <span>{featured.read_minutes} min read</span>
                    </div>
                    <Link to={`/blog/${featured.slug}`} className="arrow-link" style={{ marginTop: 18 }}>
                      Read the article
                      <ArrowUpRight size={15} strokeWidth={1.6} />
                    </Link>
                  </div>
                </motion.article>
              )}

              {/* Rest */}
              {rest.length > 0 && (
                <div className="blog-grid">
                  {rest.map((post, idx) => (
                    <Reveal key={post.slug} delay={idx * 0.04} as="article" className="blog-card">
                      {post.featured_image_url && (
                        <Link to={`/blog/${post.slug}`} className="blog-card-media">
                          <img
                            src={post.featured_image_url}
                            alt={post.featured_image_alt || post.title}
                            loading="lazy"
                          />
                        </Link>
                      )}
                      <div className="journal-meta">
                        <span>{post.category}</span>
                        <span>·</span>
                        <span>{post.read_minutes} min</span>
                      </div>
                      <Link to={`/blog/${post.slug}`}>
                        <h3>{post.title}</h3>
                      </Link>
                      <p className="blog-excerpt">{post.excerpt}</p>
                      <div className="journal-meta" style={{ marginTop: 'auto', paddingTop: 12 }}>
                        <span>{fmt(post.published_at)}</span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}

              {hasMore && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
                  <button
                    type="button"
                    onClick={() => loadPosts()}
                    disabled={loadingMore}
                    className="btn-secondary"
                  >
                    {loadingMore ? 'Loading…' : 'Load more articles'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="dark-band">
        <div className="shell">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'clamp(24px,5vw,80px)', alignItems: 'end' }} className="faq-teaser-grid">
            <div>
              <span className="label-mono" style={{ color: 'rgba(239,234,225,0.42)' }}>
                Field notes
              </span>
              <h2 className="h-display-2" style={{ color: 'var(--paper)', marginTop: 14, maxWidth: '18ch' }}>
                Occasionally, something <span className="em" style={{ color: 'var(--ember-bright)' }}>useful.</span>
              </h2>
            </div>
            <div>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'rgba(239,234,225,0.55)', maxWidth: '42ch' }}>
                Notes on property presentation, verified facts and publishing with control. No noise,
                no sequences.
              </p>
              <Link to="/early-access" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)', marginTop: 20 }}>
                Request early access
                <ArrowRight size={15} strokeWidth={1.6} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
