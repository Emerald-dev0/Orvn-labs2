import React, { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Share2, Copy, Check, MessageSquare, Send, Heart, Twitter, Linkedin, Github } from 'lucide-react';

import PageWrapper from '../components/PageWrapper';
import Section from '../components/ui/Section';
import ContentRenderer from '../components/ContentRenderer';
import Newsletter from '../components/Newsletter';
import { useDocumentMeta } from '../lib/seo';
import { supabase, getRelatedPosts } from '../lib/supabase';

const fmt = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export default function BlogPost() {
  const { slug } = useParams();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const isPreview = searchParams.get('preview') === 'true';

  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [related, setRelated] = useState([]);
  const [prev, setPrev] = useState(null);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [toc, setToc] = useState([]);
  const [processedBody, setProcessedBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [commenterEmail, setCommenterEmail] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    loadPost();
    loadComments();
    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
    if (likedPosts.includes(slug)) {
      setLiked(true);
    }
  }, [slug]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_slug', slug)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.warn('Failed to load comments:', err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !commenterName.trim() || !commenterEmail.trim()) return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('blog_comments')
        .insert({
          post_slug: slug,
          content: comment,
          author_name: commenterName,
          author_email: commenterEmail,
          status: 'pending',
        });

      if (error) throw error;

      setComment('');
      alert('Your comment has been submitted and is awaiting moderation.');
    } catch (err) {
      console.error('Comment error:', err);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    if (liked) return;

    setLiked(true);
    setLikesCount(prev => prev + 1);

    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
    if (!likedPosts.includes(slug)) {
      likedPosts.push(slug);
      localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
    }

    try {
      const { data: post } = await supabase
        .from('blog_posts')
        .select('likes_count')
        .eq('slug', slug)
        .single();

      if (post) {
        await supabase
          .from('blog_posts')
          .update({ likes_count: (post.likes_count || 0) + 1 })
          .eq('slug', slug);

        setLikesCount((post.likes_count || 0) + 1);
      }
    } catch (err) {
      console.warn('Failed to increment likes:', err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const element = document.documentElement;
      const scrollTotal = element.scrollHeight - element.clientHeight;
      const scrollPos = element.scrollTop;
      setReadingProgress((scrollPos / scrollTotal) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadPost = async () => {
    try {
      setLoading(true);
      setNotFound(false);

      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug);

      if (!isPreview) {
        query = query.eq('is_published', true);
      }

      const { data: post, error } = await query.single();

      if (error || !post) {
        setNotFound(true);
        throw new Error('Post not found');
      }

      setPost(post);
      setLikesCount(post.likes_count || 0);

      // Fetch author details
      const { data: authorData } = await supabase
        .from('blog_authors')
        .select('*')
        .eq('name', post.author)
        .single();
      if (authorData) setAuthor(authorData);

      // Fetch related posts
      const relatedPosts = await getRelatedPosts(slug, post.category, 3);
      setRelated(relatedPosts);

      // Fetch prev/next posts
      const { data: prevPost } = await supabase
        .from('blog_posts')
        .select('slug, title')
        .eq('is_published', true)
        .lt('published_at', post.published_at)
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      const { data: nextPost } = await supabase
        .from('blog_posts')
        .select('slug, title')
        .eq('is_published', true)
        .gt('published_at', post.published_at)
        .order('published_at', { ascending: true })
        .limit(1)
        .single();

      setPrev(prevPost);
      setNext(nextPost);

      // Process body and generate TOC
      const parser = new DOMParser();
      const doc = parser.parseFromString(post.body, 'text/html');
      const headings = Array.from(doc.querySelectorAll('h2, h3')).map((h, i) => {
        const id = `heading-${i}`;
        h.setAttribute('id', id);
        h.setAttribute('data-toc-id', id);
        return {
          id: id,
          text: h.innerText,
          level: h.tagName.toLowerCase(),
        };
      });
      setToc(headings);
      setProcessedBody(doc.body.innerHTML);

      // Increment views (fire and forget)
      supabase
        .from('blog_posts')
        .update({ views_count: (post.views_count || 0) + 1 })
        .eq('slug', slug)
        .then(() => {})
        .catch((err) => console.warn('Failed to increment views:', err));
    } catch (err) {
      console.error('Failed to load post:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useDocumentMeta(
    post
      ? {
          title: post.seo_title || post.title,
          description: post.seo_description || post.excerpt,
          path: `/blog/${post.slug}`,
          image: post.og_image_url || post.featured_image_url,
          type: 'article',
          canonical: post.canonical_url,
          schema: {
            '@type': 'BlogPosting',
            'headline': post.title,
            'image': [post.featured_image_url],
            'datePublished': post.published_at,
            'dateModified': post.updated_at || post.published_at,
            'author': [{
              '@type': 'Person',
              'name': author?.name || post.author || 'ORVN Labs',
              'url': author?.website_url || 'https://orvnlabs.com'
            }],
            'description': post.excerpt
          }
        }
      : { title: 'Post not found' }
  );

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94A3B8' }}>
          Loading post...
        </div>
      </PageWrapper>
    );
  }

  if (notFound || !post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <PageWrapper>
      {/* Progress Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${readingProgress}%`,
          height: '4px',
          background: '#5B3FD4',
          zIndex: 1001,
          transition: 'width 0.1s ease-out',
        }}
      />

      {post.is_published === false && (
        <div style={{ background: '#F59E0B', color: '#fff', textAlign: 'center', padding: '10px', fontSize: 13, fontWeight: 700, position: 'sticky', top: 0, zIndex: 1000 }}>
          DRAFT PREVIEW — This post is not yet visible to the public.
          <Link to={`/admin/blog/edit/${post.slug}`} style={{ color: '#fff', marginLeft: 12, textDecoration: 'underline' }}>Edit post</Link>
        </div>
      )}

      <article style={{ padding: '0 0 clamp(24px, 3vw, 40px)', background: '#fff' }}>
        {/* Hero Section */}
        {post.featured_image_url && (
          <div style={{ width: '100%', height: 'clamp(300px, 50vh, 500px)', overflow: 'hidden', position: 'relative', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
            <img
              src={post.featured_image_url}
              alt={post.featured_image_alt || post.title}
              fetchpriority="high"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.6), transparent)' }} />
          </div>
        )}

        <div className="container-page" style={{ maxWidth: 760 }}>
          <Link
            to="/blog"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#5B3FD4', marginBottom: 24 }}
          >
            <ArrowLeft size={14} /> All posts
          </Link>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#5B3FD4',
                fontWeight: 600,
              }}
            >
              {post.category}
            </span>
            <span style={{ color: '#CBD5E1' }}>·</span>
            <span style={{ fontSize: 13, color: '#94A3B8' }}>{fmt(post.published_at)}</span>
            <span style={{ color: '#CBD5E1' }}>·</span>
            <span style={{ fontSize: 13, color: '#94A3B8' }}>{post.read_minutes} min read</span>
          </div>
          <h1 className="h-display" style={{ fontSize: 'clamp(34px, 5vw, 56px)', margin: '0 0 18px' }}>
            {post.title}
          </h1>

          {/* Author Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EEEAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#5B3FD4', fontSize: 14, overflow: 'hidden' }}>
              {author?.avatar_url ? (
                <img src={author.avatar_url} alt={author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                post.author?.[0] || 'O'
              )}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{author?.name || post.author || 'ORVN Labs'}</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>{author?.role || post.category} · {fmt(post.published_at)}</div>
            </div>
          </div>

          <p className="lead" style={{ marginBottom: 24 }}>{post.excerpt}</p>

          {/* Table of Contents */}
          {toc.length > 1 && (
            <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 20, marginBottom: 32, border: '1px solid #E2E8F0' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In this article</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {toc.map((h, i) => (
                  <li key={i} style={{ paddingLeft: h.level === 'h3' ? 16 : 0 }}>
                    <a
                      href={`#${h.id}`}
                      style={{ color: '#5B3FD4', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
                      onClick={(e) => {
                        e.preventDefault();
                        const target = document.querySelector(`[data-toc-id="${h.id}"]`);
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: '#F1F5F9',
                    color: '#475569',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share Section */}
          <div style={{ paddingBottom: 32, borderBottom: '1px solid #F1F5F9', marginBottom: 32, display: 'flex', gap: 12 }}>
            <button
              onClick={handleLike}
              disabled={liked}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: liked ? '#FEF2F2' : '#fff',
                border: `1.5px solid ${liked ? '#FECACA' : '#E5E8F0'}`,
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: liked ? '#DC2626' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Heart size={16} fill={liked ? '#DC2626' : 'none'} />
              {likesCount} Likes
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: copied ? '#F0FDF4' : '#fff',
                border: `1.5px solid ${copied ? '#22C55E' : '#E5E8F0'}`,
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: copied ? '#16A34A' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? 'Link Copied!' : 'Share'}
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 10,
                border: '1.5px solid #E5E8F0',
                color: '#1DA1F2',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1DA1F2'; e.currentTarget.style.background = '#F0F9FF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E8F0'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Twitter size={18} fill="currentColor" />
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 10,
                border: '1.5px solid #E5E8F0',
                color: '#0A66C2',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A66C2'; e.currentTarget.style.background = '#F0F7FF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E8F0'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Linkedin size={18} fill="currentColor" />
            </a>
          </div>
        </div>

        <div className="container-page" style={{ maxWidth: 760, paddingBlock: 'clamp(16px, 3vw, 32px)' }}>
          <ContentRenderer html={processedBody || post.body} />
        </div>

        {/* Author Bio Section */}
        {author && (
          <div className="container-page" style={{ maxWidth: 760, marginTop: 40, paddingTop: 40, borderTop: '1px solid #F1F5F9' }}>
            <div style={{ background: '#F8FAFC', borderRadius: 20, padding: 32, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#EEEAFB', overflow: 'hidden', flexShrink: 0 }}>
                {author.avatar_url ? (
                   <img src={author.avatar_url} alt={author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#5B3FD4' }}>{author.name[0]}</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#5B3FD4', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Written by</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>{author.name}</h3>
                <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>{author.bio}</p>
                <div style={{ display: 'flex', gap: 16 }}>
                  {author.twitter_url && <a href={author.twitter_url} target="_blank" rel="noreferrer" style={{ color: '#94A3B8' }}><Twitter size={18} /></a>}
                  {author.github_url && <a href={author.github_url} target="_blank" rel="noreferrer" style={{ color: '#94A3B8' }}><Github size={18} /></a>}
                  {author.website_url && <a href={author.website_url} target="_blank" rel="noreferrer" style={{ color: '#94A3B8' }}><Share2 size={18} /></a>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Navigation */}
        {(prev || next) && (
          <div className="container-page" style={{ maxWidth: 760, marginTop: 40, paddingTop: 40, borderTop: '1px solid #F1F5F9' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
              {prev ? (
                <Link to={`/blog/${prev.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Previous</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArrowLeft size={16} style={{ color: '#5B3FD4' }} /> {prev.title}
                  </span>
                </Link>
              ) : <div />}

              {next ? (
                <Link to={`/blog/${next.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', textAlign: 'right' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Next</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {next.title} <ArrowRight size={16} style={{ color: '#5B3FD4' }} />
                  </span>
                </Link>
              ) : <div />}
            </div>
          </div>
        )}

        <div className="container-page" style={{ maxWidth: 760, marginTop: 40 }}>
          <div
            style={{
              background: '#F7F8FB',
              border: '1px solid #E5E8F0',
              borderLeft: '3px solid #5B3FD4',
              borderRadius: 12,
              padding: 'clamp(20px, 3vw, 28px)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                Run the leakage scorecard while it’s fresh.
              </div>
              <p style={{ fontSize: 13.5, color: '#475569', margin: 0, lineHeight: 1.6 }}>
                Five-minute diagnostic. No signup. Your inputs stay with you.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/calculators/leakage" className="btn-primary">
                Run scorecard <ArrowRight size={15} />
              </Link>
              <Link to="/pas" className="btn-secondary">Explore PAS</Link>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {post.settings?.enable_comments !== false && (
          <div className="container-page" style={{ maxWidth: 760, marginTop: 48, paddingBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <MessageSquare size={20} style={{ color: '#5B3FD4' }} />
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Comments ({comments.length})</h3>
            </div>

            {/* Existing Comments */}
            {comments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 }}>
                {comments.map((c) => (
                  <div key={c.id} style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#475569', fontSize: 14, flexShrink: 0 }}>
                      {c.author_name[0]}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{c.author_name}</span>
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{fmt(c.created_at)}</span>
                      </div>
                      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handlePostComment} style={{ background: '#F8FAFC', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0', marginBottom: 32 }}>
              <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Leave a comment</h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>NAME</label>
                  <input
                    type="text"
                    required
                    value={commenterName}
                    onChange={(e) => setCommenterName(e.target.value)}
                    placeholder="Your name"
                    style={{ width: '100%', padding: 12, border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>EMAIL (PRIVATE)</label>
                  <input
                    type="email"
                    required
                    value={commenterEmail}
                    onChange={(e) => setCommenterEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{ width: '100%', padding: 12, border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>COMMENT</label>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What do you think about this article?"
                  rows={3}
                  style={{ width: '100%', padding: 16, border: '1px solid #E2E8F0', borderRadius: 12, outline: 'none', fontSize: 14, fontFamily: 'inherit', marginBottom: 16, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={submittingComment}
                  style={{ background: '#5B3FD4', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: submittingComment ? 0.6 : 1 }}
                >
                  {submittingComment ? 'Sending...' : 'Post Comment'} <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </article>

      <Section borderTop background="surface">
        <Newsletter source={`blog_post_${post.slug}`} />
      </Section>

      {related && related.length > 0 && (
        <Section borderTop>
          <h2 className="h-section" style={{ fontSize: 'clamp(24px, 3vw, 32px)', margin: '0 0 20px' }}>
            Keep reading
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {related.map((p) => (
              <article key={p.slug} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {p.featured_image_url && (
                  <Link to={`/blog/${p.slug}`} style={{ display: 'block', height: 160, overflow: 'hidden' }}>
                    <img src={p.featured_image_url} alt={p.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Link>
                )}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#5B3FD4',
                      marginBottom: 8,
                      display: 'inline-block',
                      fontWeight: 600,
                    }}
                  >
                    {p.category}
                  </span>
                  <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Inter', sans-serif", color: '#0F172A', margin: '0 0 8px', lineHeight: 1.4 }}>
                    <Link to={`/blog/${p.slug}`} style={{ color: '#0F172A', textDecoration: 'none' }}>{p.title}</Link>
                  </h3>
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>
                    {p.excerpt}
                  </p>
                  <Link to={`/blog/${p.slug}`} style={{ fontSize: 13, fontWeight: 700, color: '#5B3FD4', textDecoration: 'none' }}>
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}
    </PageWrapper>
  );
}
