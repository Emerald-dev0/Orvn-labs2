import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

import PageWrapper from '../components/PageWrapper';
import Section from '../components/ui/Section';
import Eyebrow from '../components/ui/Eyebrow';
import Newsletter from '../components/Newsletter';
import { useDocumentMeta } from '../lib/seo';
import { supabase, getAllCategories } from '../lib/supabase';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1], delay },
});

const fmt = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const BlogSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, width: '100%' }}>
    {[1, 2, 3].map((i) => (
      <div key={i} className="card" style={{ padding: 0, height: 440, overflow: 'hidden' }}>
        <div style={{ height: 200, background: 'var(--line-strong)', animation: 'pulse 1.5s infinite' }} />
        <div style={{ padding: 24 }}>
          <div style={{ height: 12, width: '30%', background: 'var(--line-strong)', marginBottom: 12, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 24, width: '80%', background: 'var(--line-strong)', marginBottom: 12, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 16, width: '100%', background: 'var(--line-strong)', marginBottom: 8, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 16, width: '90%', background: 'var(--line-strong)', marginBottom: 24, borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 12, width: '50%', background: 'var(--line-strong)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
    ))}
    <style>{`
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `}</style>
  </div>
);

export default function Blog() {
  useDocumentMeta({
    title: 'First-Contact Intelligence Blog — Insights for Brokerage Operators',
    description: 'Weekly field notes on first-contact infrastructure, lead conversion, and brokerage operations. Learn how to recover lost revenue from your inbound pipeline.',
    path: '/blog',
    schema: {
      '@type': 'Blog',
      'name': 'First-Contact Intelligence',
      'description': 'Insights for real estate brokerage owners and operators on lead conversion and AI infrastructure.',
      'publisher': {
        '@type': 'Organization',
        'name': 'ORVN Labs'
      }
    }
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
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const LIMIT = 9;

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadCategories();
    loadTags();
    loadPosts(true);
  }, []);

  useEffect(() => {
    loadPosts(true);
  }, [selectedCategory]);

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
      const { data, error } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('is_published', true);

      if (error) throw error;

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

      const { data, error } = await query;
      if (error) throw error;

      const newPosts = data || [];

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === LIMIT);
      setOffset(currentOffset + LIMIT);
    } catch (err) {
      console.error('Failed to load blog posts:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    const matchesTag = selectedTag ? (post.tags || []).includes(selectedTag) : true;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTag && matchesSearch;
  });

  return (
    <PageWrapper>
      <section style={{ padding: 'clamp(48px, 6vw, 80px) 0 clamp(20px, 3vw, 32px)', background: '#fff' }}>
        <div className="container-page" style={{ maxWidth: 840 }}>
          <motion.div {...fadeUp(0)}>
            <Eyebrow>Blog</Eyebrow>
          </motion.div>
          <motion.h1
            {...fadeUp(0.05)}
            className="h-display-2"
            style={{
              marginBottom: 24,
            }}
          >
            Field notes on first-contact infrastructure.
          </motion.h1>
          <motion.p
            {...fadeUp(0.1)}
            className="lead-2"
            style={{
              maxWidth: 660,
            }}
          >
            Weekly insights on how brokerages lose, recover, and convert inbound leads. The philosophy, the operators, the patterns that repeat.
          </motion.p>
        </div>
      </section>

      <Section borderTop background="surface">
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>
          {/* Search Bar */}
          <motion.div
            {...fadeUp(0)}
            style={{
              maxWidth: 500,
              margin: '0 auto clamp(24px, 4vw, 32px)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--ink-dim)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                borderRadius: 14,
                border: '1.5px solid var(--line)',
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--line-strong)',
                  border: 'none',
                  borderRadius: 100,
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--ink-mid)',
                }}
              >
                <X size={14} />
              </button>
            )}
          </motion.div>

          {/* Popular Tags */}
          {tags.length > 0 && (
            <motion.div
              {...fadeUp(0.05)}
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-dim)', textTransform: 'uppercase', alignSelf: 'center', marginRight: 8 }}>Tags:</span>
              {tags.slice(0, 10).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--line)',
                    background: selectedTag === tag ? 'var(--primary-pale)' : '#fff',
                    color: selectedTag === tag ? 'var(--primary)' : 'var(--ink-mid)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  #{tag}
                </button>
              ))}
            </motion.div>
          )}

          {/* Category Filter */}
          <motion.div
            {...fadeUp(0)}
            style={{
              display: 'flex',
              gap: 'clamp(6px, 2vw, 12px)',
              flexWrap: 'wrap',
              marginBottom: 'clamp(32px, 6vw, 48px)',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: 'clamp(8px, 1.5vw, 12px) clamp(14px, 3vw, 20px)',
                borderRadius: 100,
                border: selectedCategory === null ? 'none' : '1.5px solid var(--line)',
                background: selectedCategory === null ? 'var(--primary)' : '#fff',
                color: selectedCategory === null ? '#fff' : 'var(--ink-mid)',
                fontSize: 'clamp(12px, 1.2vw, 14px)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              All posts
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: 'clamp(8px, 1.5vw, 12px) clamp(14px, 3vw, 20px)',
                  borderRadius: 100,
                  border: selectedCategory === cat ? 'none' : '1.5px solid var(--line)',
                  background: selectedCategory === cat ? 'var(--primary)' : '#fff',
                  color: selectedCategory === cat ? '#fff' : 'var(--ink-mid)',
                  fontSize: 'clamp(12px, 1.2vw, 14px)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {selectedTag && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
              <div style={{
                background: 'var(--line-strong)',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ink-mid)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                Filtered by tag: <strong>#{selectedTag}</strong>
                <button
                  onClick={() => setSelectedTag(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-dim)', padding: 0, fontSize: 18 }}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {(searchQuery || selectedCategory || selectedTag) && !loading && (
            <div style={{ textAlign: 'center', marginBottom: 32, fontSize: 14, color: 'var(--ink-dim)' }}>
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
              {searchQuery && <> for "<strong>{searchQuery}</strong>"</>}
              {selectedCategory && <> in <strong>{selectedCategory}</strong></>}
              {selectedTag && <> tagged with <strong>#{selectedTag}</strong></>}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setSelectedTag(null);
                }}
                style={{ marginLeft: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <BlogSkeleton />
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--risk)' }}>
              <p>{error}</p>
              <button
                onClick={() => loadPosts(true)}
                style={{
                  marginTop: 16,
                  padding: '10px 20px',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              {...fadeUp(0)}
              style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--surface)', borderRadius: 20 }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                No posts found
              </h3>
              <p style={{ fontSize: 16, color: 'var(--ink-mid)', maxWidth: 400, margin: '0 auto 24px' }}>
                We couldn't find any articles matching "<strong>{searchQuery}</strong>"{selectedCategory ? ` in ${selectedCategory}` : ''}.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                style={{
                  padding: '12px 24px',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              {filteredPosts.map((post, idx) => {
                const isFeatured = idx === 0 && !searchQuery && !selectedCategory;

                return (
                  <motion.article
                    key={post.slug}
                    {...fadeUp(idx * 0.05)}
                    className="card"
                    style={{
                      padding: 0,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      gridColumn: isFeatured ? '1 / -1' : 'span 1',
                      flexDirection: isFeatured ? (isDesktop ? 'row' : 'column') : 'column',
                    }}
                  >
                    {post.featured_image_url && (
                      <Link
                        to={`/blog/${post.slug}`}
                        style={{
                          display: 'block',
                          overflow: 'hidden',
                          height: isFeatured ? (isDesktop ? 'auto' : 300) : 200,
                          width: isFeatured && isDesktop ? '50%' : '100%',
                          minHeight: isFeatured && isDesktop ? 400 : 'auto'
                        }}
                      >
                        <img
                          src={post.featured_image_url}
                          alt={post.featured_image_alt || post.title}
                          loading={isFeatured ? "eager" : "lazy"}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease',
                          }}
                          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                        />
                      </Link>
                    )}
                    <div style={{
                      padding: isFeatured ? 'clamp(32px, 5vw, 48px)' : '24px',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: isFeatured ? 'center' : 'flex-start',
                      width: isFeatured && isDesktop ? '50%' : '100%',
                    }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: 'var(--primary)',
                          marginBottom: 12,
                          display: 'inline-block',
                          fontWeight: 600,
                        }}
                      >
                        {isFeatured && <span style={{ marginRight: 8, background: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>Featured</span>}
                        {post.category}
                      </span>
                      <Link
                        to={`/blog/${post.slug}`}
                        style={{
                          fontSize: isFeatured ? 'clamp(24px, 3.5vw, 36px)' : 'clamp(18px, 2.2vw, 22px)',
                          fontWeight: 800,
                          color: 'var(--ink)',
                          margin: '0 0 12px',
                          lineHeight: 1.2,
                          textDecoration: 'none',
                        }}
                      >
                        {post.title}
                      </Link>
                      <p style={{
                        fontSize: isFeatured ? 16 : 14.5,
                        color: 'var(--ink-mid)',
                        lineHeight: 1.6,
                        margin: '0 0 24px',
                        flex: isFeatured ? 'none' : 1
                      }}>
                        {post.excerpt}
                      </p>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--ink-dim)', marginBottom: 24 }}>
                        <span>{fmt(post.published_at)}</span>
                        <span>·</span>
                        <span>{post.read_minutes} min read</span>
                      </div>

                      {/* Card Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                          {post.tags.map(tag => (
                            <button
                              key={tag}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedTag(tag);
                                window.scrollTo({ top: 400, behavior: 'smooth' });
                              }}
                              style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--line)',
                                borderRadius: 4,
                                padding: '2px 6px',
                                fontSize: 11,
                                fontWeight: 600,
                                color: 'var(--ink-mid)',
                                cursor: 'pointer'
                              }}
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      )}

                      <Link
                        to={`/blog/${post.slug}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          color: 'var(--primary)',
                          fontWeight: 700,
                          fontSize: 14,
                          textDecoration: 'none',
                        }}
                      >
                        Read article →
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {!loading && !error && hasMore && filteredPosts.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
              <button
                onClick={() => loadPosts()}
                disabled={loadingMore}
                style={{
                  padding: '14px 32px',
                  borderRadius: 12,
                  border: '1.5px solid var(--line)',
                  background: '#fff',
                  color: 'var(--ink)',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loadingMore ? 'wait' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  opacity: loadingMore ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--line)';
                  e.target.style.color = 'var(--ink)';
                }}
              >
                {loadingMore ? 'Loading...' : 'Load more articles'}
              </button>
            </div>
          )}
        </div>
      </Section>

      <Section borderTop background="surface">
        <Newsletter source="blog_list" />
      </Section>
    </PageWrapper>
  );
}
