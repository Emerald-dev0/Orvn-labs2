import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getRecentPosts } from '../../lib/blog';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay },
});

const fmt = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function TheBlog() {
  const posts = getRecentPosts(2);

  return (
    <section className="section-y" style={{ background: '#fff', borderTop: '1px solid var(--line)' }}>
      <div className="container-page" style={{ maxWidth: 900 }}>
        <motion.div {...fadeUp(0)}>
          <span className="label-mono-primary" style={{ display: 'inline-block', marginBottom: 16 }}>Latest from the blog</span>
        </motion.div>
        <motion.h2 {...fadeUp(0.06)} className="h-section-2" style={{ marginBottom: 12 }}>
          Field notes on lead conversion.
        </motion.h2>
        <motion.p {...fadeUp(0.1)} className="lead-2" style={{ marginBottom: 48, maxWidth: 600 }}>
          Insights from the trenches: first-contact strategy, operational frameworks, and real estate market analysis.
        </motion.p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {posts.map((post, i) => (
            <motion.a
              key={post.slug}
              href={`/blog/${post.slug}`}
              {...fadeUp(0.1 + i * 0.05)}
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 20,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span className="label-mono" style={{ color: 'var(--primary)' }}>{post.category}</span>
              <h3 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.35, margin: 0, fontFamily: 'var(--font-display)' }}>
                {post.title}
              </h3>
              <p style={{ fontSize: 14.5, color: 'var(--ink-mid)', lineHeight: 1.6, margin: 0, flex: 1 }}>
                {post.excerpt}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>{fmt(post.date)} · {post.readMinutes} min read</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>Read post →</span>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div {...fadeUp(0.2)} style={{ marginTop: 36, textAlign: 'center' }}>
          <a href="/blog" className="btn-secondary" style={{ padding: '12px 28px' }}>
            Explore all posts <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
