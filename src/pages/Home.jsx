import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import ProductMockup from '../components/ProductMockup';
import { useDocumentMeta } from '../lib/seo';
import { SlArrowRight, SlShield, SlPeople, SlMap, SlEye, SlLayers, SlMagicWand, SlGraph, SlBulb } from 'react-icons/sl';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 1, ease: [0.23, 1, 0.32, 1], delay },
});

function Magnetic({ children, className, style, to }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.25;
    setPos({ x, y });
  };
  const reset = () => setPos({ x: 0, y: 0 });
  const Comp = to ? Link : 'button';
  return (
    <Comp
      ref={ref}
      to={to}
      className={className}
      style={{ ...style, transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1)' }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </Comp>
  );
}

export default function Home() {
  useDocumentMeta({
    title: 'ORVN Labs \u00b7 LAREI',
    description: 'LAREI is being built for wholesalers, agents, investors and real-estate operators who want one professional home for their brand, property portfolio and deal presentations.',
    path: '/',
  });

  return (
    <PageWrapper>
      <Hero />
      <Marquee />
      <Manifesto />
      <BigWord />
      <HorizontalFeatures />
      <VisualProof />
      <PropertyGallery />
      <HowSystemWorks />
      <Roles />
      <TrustBlock />
      <FaqPreview />
      <ClosingCTA />
    </PageWrapper>
  );
}

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={ref} style={{ position: 'relative', minHeight: '100vh', paddingTop: 'clamp(100px, 12vw, 160px)', paddingBottom: 'clamp(60px, 8vw, 100px)', background: 'var(--background)', overflow: 'hidden' }}>
      {/* animated aurora mesh */}
      <motion.div
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: '-30%', background: 'radial-gradient(circle at 20% 30%, rgba(57,125,119,0.28) 0%, transparent 42%), radial-gradient(circle at 80% 70%, rgba(10,10,15,0.12) 0%, transparent 48%), radial-gradient(circle at 50% 50%, rgba(57,125,119,0.12) 0%, transparent 55%)', backgroundSize: '200% 200%', filter: 'blur(50px)', scale, zIndex: 0 }}
      />
      {/* grid */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(10,10,15,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,15,0.04) 1px, transparent 1px)', backgroundSize: '80px 80px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)', zIndex: 0 }} />

      <div className="container-page" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}>
          <span className="eyebrow" style={{ marginBottom: 32 }}>LAREI \u00b7 REAL ESTATE PUBLISHING & PROFESSIONAL PRESENCE</span>
        </motion.div>

        <div style={{ position: 'relative' }}>
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(52px, 9.5vw, 150px)', lineHeight: 0.9, letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0, maxWidth: '12ch' }}
          >
            A better place<br />
            to be <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>seen.</em>
          </motion.h1>

          {/* parallax background word */}
          <motion.div
            style={{ y, position: 'absolute', top: '10%', right: '-8%', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(180px, 30vw, 460px)', lineHeight: 0.8, color: 'rgba(57,125,119,0.09)', pointerEvents: 'none', userSelect: 'none', zIndex: -1 }}
            aria-hidden
          >
            seen.
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(32px, 5vw, 80px)', alignItems: 'end', marginTop: 'clamp(40px, 6vw, 72px)' }}>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
            className="lead"
            style={{ fontSize: 'clamp(17px, 1.5vw, 20px)', maxWidth: 540, margin: 0 }}
          >
            LAREI is being built for wholesalers, agents, investors and real-estate operators who want one professional home for their brand, property portfolio and deal presentations. Organize the details, prepare the materials, publish with control, and share a page people can actually use.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1], delay: 0.4 }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
          >
            <Magnetic to="/early-access" className="btn-primary">Request early access <SlArrowRight size={16} /></Magnetic>
            <Magnetic to="/product" className="btn-secondary">Explore the product</Magnetic>
          </motion.div>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="label-mono" style={{ marginTop: 32, color: 'var(--ink-dim)' }}>
          Private beta \u00b7 Applications reviewed individually
        </motion.p>

        {/* PRODUCT STAGE */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
          style={{ marginTop: 'clamp(60px, 9vw, 120px)', position: 'relative' }}
        >
          <ProductMockup />
        </motion.div>
      </div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--ink-dim)' }}
      >
        <span className="label-mono" style={{ fontSize: 9 }}>Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ width: 1, height: 28, background: 'var(--ink-dim)' }} />
      </motion.div>
    </section>
  );
}

function StageCard({ children, label, tilt }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 22, boxShadow: 'var(--shadow-lg)', transform: `rotate(${tilt}deg)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--line-strong)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--line-strong)' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--line-strong)' }} />
        <span className="label-mono" style={{ marginLeft: 10, fontSize: 10 }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function Marquee() {
  const words = ['Professional presence', 'Property pages', 'Approved facts', 'AI assistance', 'Publish with control', 'Engagement insights', 'One record', 'Your voice', 'Discretion', 'Clarity'];
  return (
    <div style={{ background: 'var(--ink)', color: '#fff', padding: '26px 0', overflow: 'hidden', borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--ink)' }}>
      <div className="marquee">
        {[...words, ...words].map((w, i) => (
          <span key={i} style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(24px, 2.8vw, 38px)', padding: '0 40px', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.88)' }}>
            {w} <span style={{ color: 'var(--primary-light)', marginLeft: 40 }}>\u00b7</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Manifesto() {
  return (
    <section className="section-y" style={{ background: 'var(--background)' }}>
      <div className="container-page">
        <motion.div {...fadeUp(0)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(32px, 6vw, 100px)', alignItems: 'start' }}>
          <div>
            <span className="eyebrow" style={{ marginBottom: 20 }}>BUILT AROUND THE WORK</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.0, letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0 }}>
              Built around the work, <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>not another collection</em> of disconnected tools.
            </h2>
          </div>
          <p className="lead" style={{ fontSize: 20, paddingTop: 12, margin: 0 }}>
            Property information, professional identity and buyer-facing materials often sit in different places. That fragmentation costs attention. LAREI is designed to bring the presentation layer together, so what you share reflects a clear, approved record rather than another round of manual assembly.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function BigWord() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  return (
    <section ref={ref} style={{ padding: 'clamp(60px, 10vw, 140px) 0', background: 'var(--background)', overflow: 'hidden', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <motion.div style={{ x, whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(120px, 22vw, 320px)', lineHeight: 0.85, letterSpacing: '-0.03em', color: 'transparent', WebkitTextStroke: '1.5px rgba(57,125,119,0.35)', userSelect: 'none' }}>
          clarity · control · discretion
        </span>
      </motion.div>
    </section>
  );
}


function HorizontalFeatures() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const features = [
    { eyebrow: 'YOUR PROFESSIONAL PRESENCE', title: 'One address for your business. A clear view of your work.', body: 'Give people a direct destination to learn who you are, what markets you serve, how to contact you and which properties or projects you choose to show.', icon: SlPeople, img: '/images/prop-1.jpg' },
    { eyebrow: 'PROPERTY & PORTFOLIO', title: 'Every property has its place.', body: 'Prepare a dedicated page for each published opportunity, with approved details, images, location context, supporting materials and an easy inquiry route.', icon: SlLayers, img: '/images/prop-2.jpg' },
    { eyebrow: 'AI THAT WORKS WITH YOUR FACTS', title: 'Spend less time assembling. Keep control of what gets said.', body: 'Start from notes, documents and photos. Organize what you supply, flag gaps for review and help draft property descriptions, deal sheets and outreach copy. Your approval comes before publication.', icon: SlMagicWand, img: '/images/prop-3.jpg' },
    { eyebrow: 'YOUR VOICE, NOT A GENERIC TEMPLATE', title: 'Make your materials sound like your business.', body: 'Bring in approved business context and examples of how you communicate. Shape the tone, vocabulary and audience of your content without changing the underlying facts.', icon: SlBulb, img: '/images/prop-4.jpg' },
    { eyebrow: 'OBSERVABLE ACTIVITY', title: 'Know what was viewed, and what prompted a response.', body: 'See engagement on published professional and property pages, tracked clicks and buyer inquiries in one workspace. Understand which opportunities are receiving attention.', icon: SlGraph, img: '/images/hero-bg.jpg' },
  ];

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `-${(features.length - 1) * 100}%`]);
  const springX = useSpring(x, { stiffness: 120, damping: 30, mass: 0.5 });

  if (isMobile) {
    return (
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container-page" style={{ paddingBlock: 'var(--space-lg)' }}>
          <motion.div {...fadeUp(0)} style={{ marginBottom: 32 }}>
            <span className="eyebrow" style={{ marginBottom: 16 }}>CAPABILITIES</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(32px, 8vw, 44px)', lineHeight: 1.02, letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0 }}>
              What LAREI is being built to do.
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gap: 20 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.eyebrow} {...fadeUp(i * 0.04)} style={{ background: 'var(--background)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color="var(--primary)" />
                    </div>
                    <span className="eyebrow">{f.eyebrow}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic', fontSize: 22, color: 'var(--ink)', margin: '0 0 10px' }}>{f.title}</h3>
                  <p className="lead" style={{ fontSize: 15, margin: 0 }}>{f.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} style={{ position: 'relative', height: `${features.length * 100}vh`, background: 'var(--surface)' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <motion.div style={{ x: springX, display: 'flex', gap: 0, width: `${features.length * 100}vw` }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.eyebrow} style={{ width: '100vw', flexShrink: 0, padding: '0 clamp(24px, 6vw, 80px)', display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(32px, 6vw, 100px)', alignItems: 'center', width: '100%', maxWidth: 1280, margin: '0 auto' }}>
                  <div>
                    <span className="eyebrow" style={{ marginBottom: 18 }}>{f.eyebrow}</span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(32px, 4.5vw, 56px)', lineHeight: 1.02, letterSpacing: '-0.025em', color: 'var(--ink)', margin: '0 0 20px' }}>
                      {f.title}
                    </h2>
                    <p className="lead" style={{ fontSize: 18, margin: 0 }}>{f.body}</p>
                    <div className="label-mono" style={{ marginTop: 28, color: 'var(--ink-dim)' }}>0{i + 1} / 0{features.length}</div>
                  </div>
                  <div style={{ position: 'relative', height: 'clamp(320px, 42vw, 520px)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--line)', boxShadow: 'var(--shadow-xl)' }}>
                    <motion.img src={f.img} alt="" loading="lazy" whileHover={{ scale: 1.06 }} transition={{ duration: 1.2, ease: [0.23,1,0.32,1] }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,15,0.08) 0%, rgba(10,10,15,0.72) 100%)' }} />
                    <div style={{ position: 'absolute', left: 24, right: 24, bottom: 24, color: '#fff' }}>
                      <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '1px solid rgba(255,255,255,0.24)' }}>
                        <Icon size={26} color="#fff" />
                      </div>
                      <span className="label-mono" style={{ color: 'rgba(255,255,255,0.72)', display: 'block', marginBottom: 6 }}>0{i + 1} / 0{features.length}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: '#fff' }}>{f.eyebrow.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* progress bar */}
        <div style={{ position: 'absolute', bottom: 32, left: 'clamp(24px, 6vw, 80px)', right: 'clamp(24px, 6vw, 80px)', height: 2, background: 'var(--line)' }}>
          <motion.div style={{ height: '100%', background: 'var(--primary)', scaleX: scrollYProgress, transformOrigin: 'left' }} />
        </div>
      </div>
    </section>
  );
}

function VisualProof() {
  return (
    <section style={{ position: 'relative', height: 'clamp(460px, 62vw, 760px)', overflow: 'hidden' }}>
      <motion.div style={{ position: 'absolute', inset: 0 }} whileHover={{ scale: 1.02 }} transition={{ duration: 1.6 }}>
        <img src="/images/hero-bg.jpg" alt="A professional property page open on a laptop" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
      </motion.div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(10,10,15,0.72) 0%, rgba(10,10,15,0.18) 55%, rgba(10,10,15,0.55) 100%)' }} />
      <div className="container-page" style={{ position: 'relative', zIndex: 1, height: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'end', paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
        <motion.div {...fadeUp(0)} style={{ maxWidth: 720 }}>
          <span className="label-mono" style={{ color: 'rgba(255,255,255,0.72)', marginBottom: 16, display: 'block' }}>A page people can actually open, read and respond to</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(34px, 4.8vw, 62px)', lineHeight: 1.0, color: '#fff', margin: 0 }}>
            No account required. No invented inventory. Just a dependable destination for the professional and the property.
          </h2>
        </motion.div>
        <motion.div {...fadeUp(0.15)} style={{ justifySelf: 'end', maxWidth: 320, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.24)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-lg)', padding: 24, color: '#fff' }}>
          <span className="label-mono" style={{ color: 'rgba(255,255,255,0.72)', display: 'block', marginBottom: 10 }}>What a visitor sees</span>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10, fontSize: 14, lineHeight: 1.5 }}>
            <li>Business identity and market focus</li>
            <li>Approved property facts and media</li>
            <li>General location, not surveyed boundaries</li>
            <li>A direct inquiry route</li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

function HowSystemWorks() {
  const steps = [
    { n: '01', t: 'Establish your presence.', b: 'Tell LAREI about your role, market, business and style; review a draft of your public website.' },
    { n: '02', t: 'Bring in the property.', b: 'Paste notes, enter details and upload supported files. Review the structured record and resolve missing information.' },
    { n: '03', t: 'Prepare the presentation.', b: 'Edit generated descriptions, deal-sheet content and the individual property page.' },
    { n: '04', t: 'Publish with control.', b: 'Decide what is public, publish your site and property pages, then copy a link people can open without an account.' },
    { n: '05', t: 'Follow the interest.', b: 'Read buyer inquiries and examine measured page activity; revise and republish as needed.' },
  ];
  return (
    <section className="section-y" style={{ background: 'var(--ink)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '-10%', right: '-5%', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(200px, 28vw, 420px)', lineHeight: 1, color: 'rgba(255,255,255,0.05)', pointerEvents: 'none', userSelect: 'none' }}>flow</div>
      <div className="container-page" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div {...fadeUp(0)} style={{ marginBottom: 56, maxWidth: 760 }}>
          <span className="eyebrow" style={{ marginBottom: 16, color: 'var(--primary-light)' }}>HOW THE SYSTEM WORKS</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(34px, 5vw, 60px)', lineHeight: 1.02, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
            From a working file to a professional place to share it.
          </h2>
        </motion.div>
        <div style={{ display: 'grid', gap: 0 }}>
          {steps.map((s, i) => (
            <motion.div key={s.n} {...fadeUp(i * 0.05)} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 28, padding: '28px 0', borderBottom: '1px solid rgba(255,255,255,0.12)', alignItems: 'start' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--primary-light)', fontWeight: 600, letterSpacing: '0.08em' }}>{s.n}</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic', fontSize: 24, color: '#fff', marginBottom: 8 }}>{s.t}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(255,255,255,0.68)', margin: 0 }}>{s.b}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Roles() {
  const roles = [
    { k: 'Wholesalers', v: 'Present off-market opportunities with consistent property information and a more professional buyer experience.', icon: SlLayers },
    { k: 'Agents', v: 'Showcase authorized listings, services and professional identity from one branded destination.', icon: SlPeople },
    { k: 'Investors', v: 'Present projects, owned properties or investment opportunities with appropriate factual context.', icon: SlEye },
    { k: 'Operators & teams', v: 'Standardize how the business and its properties appear when shared.', icon: SlGraph },
  ];
  return (
    <section className="section-y" style={{ background: 'var(--background)', borderTop: '1px solid var(--line)' }}>
      <div className="container-page">
        <motion.div {...fadeUp(0)} style={{ marginBottom: 48, maxWidth: 760 }}>
          <span className="eyebrow" style={{ marginBottom: 16 }}>DESIGNED FOR THE PROFESSIONALS MOVING THE PROPERTY</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(34px, 4.6vw, 56px)', lineHeight: 1.02, letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0 }}>
            Designed for the professionals <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>moving the property.</em>
          </h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {roles.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.k}
                {...fadeUp(i * 0.05)}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 250, damping: 20 }}
                style={{ padding: 32, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}
              >
                <div aria-hidden style={{ position: 'absolute', top: -24, right: -12, opacity: 0.07 }}>
                  <Icon size={150} color="var(--primary)" />
                </div>
                <Icon size={28} color="var(--primary)" style={{ marginBottom: 18 }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic', fontSize: 22, color: 'var(--ink)', marginBottom: 10 }}>{r.k}</h3>
                <p className="lead" style={{ fontSize: 15, margin: 0 }}>{r.v}</p>
              </motion.div>
            );
          })}
        </div>
        <div style={{ marginTop: 36 }}>
          <Link to="/who-its-for" className="btn-ghost">See who it\u2019s for <SlArrowRight size={14} /></Link>
        </div>
      </div>
    </section>
  );
}

function TrustBlock() {
  return (
    <section className="section-y" style={{ background: 'var(--background)', borderTop: '1px solid var(--line)' }}>
      <div className="container-page">
        <motion.div {...fadeUp(0)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(32px, 6vw, 100px)', alignItems: 'start' }}>
          <div>
            <span className="eyebrow" style={{ marginBottom: 20 }}>YOUR BRAND. YOUR REVIEW. YOUR PUBLISHING DECISION.</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(34px, 4.6vw, 56px)', lineHeight: 1.02, letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0 }}>
              Your brand. Your review. <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Your publishing decision.</em>
            </h2>
          </div>
          <div>
            <p className="lead" style={{ fontSize: 18, margin: '0 0 20px' }}>
              LAREI is designed to separate private workspace material from information you explicitly approve for public pages. AI assists with the draft; the user makes the factual and publication decisions. Maps show general location in the first release, not surveyed property boundaries.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SlShield size={18} color="var(--primary)" />
              <span className="label-mono" style={{ color: 'var(--ink-dim)' }}>No fake trust badges, fabricated clients or false metrics.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FaqPreview() {
  const qs = [
    { q: 'Is LAREI a CRM?', a: 'No. It focuses on professional presentation and property publishing, not a full relationship or transaction management system.' },
    { q: 'Can anybody access it?', a: 'The first release is a controlled private beta. Requests are reviewed before invitations are issued.' },
    { q: 'Does LAREI verify real-estate facts automatically?', a: 'Not in its initial scope. Users must verify property facts and approve public claims.' },
  ];
  return (
    <section className="section-y" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
      <div className="container-page">
        <motion.div {...fadeUp(0)} style={{ marginBottom: 48, maxWidth: 760 }}>
          <span className="eyebrow" style={{ marginBottom: 16 }}>FAQ PREVIEW</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(34px, 4.6vw, 56px)', lineHeight: 1.02, letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0 }}>
            Questions, <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>answered plainly.</em>
          </h2>
        </motion.div>
        <div style={{ display: 'grid', gap: 0, maxWidth: 900 }}>
          {qs.map((q, i) => (
            <motion.div key={q.q} {...fadeUp(i * 0.05)} style={{ padding: '28px 0', borderBottom: '1px solid var(--line)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic', fontSize: 20, color: 'var(--ink)', margin: 0 }}>{q.q}</h3>
              <p className="lead" style={{ fontSize: 16, margin: 0 }}>{q.a}</p>
            </motion.div>
          ))}
        </div>
        <div style={{ marginTop: 36 }}>
          <Link to="/faq" className="btn-ghost">View all questions <SlArrowRight size={14} /></Link>
        </div>
      </div>
    </section>
  );
}


function PropertyGallery() {
  const items = [
    { img: '/images/prop-1.jpg', title: 'Oak Hollow Parcel', loc: 'Austin, TX', note: 'Published property page with approved facts and inquiry route.' },
    { img: '/images/prop-2.jpg', title: 'Riverbend Lot', loc: 'Nashville, TN', note: 'Draft record being reviewed before publication.' },
    { img: '/images/prop-3.jpg', title: 'Pine Ridge Acreage', loc: 'Boise, ID', note: 'Shareable deal summary connected to one professional profile.' },
    { img: '/images/prop-4.jpg', title: 'Maple Grove', loc: 'Raleigh, NC', note: 'Private files stay private until explicitly approved.' },
  ];
  return (
    <section className="section-y" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '-8%', right: '-4%', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(180px, 26vw, 360px)', lineHeight: 0.85, color: 'rgba(57,125,119,0.06)', pointerEvents: 'none', userSelect: 'none' }}>portfolio</div>
      <div className="container-page" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div {...fadeUp(0)} style={{ marginBottom: 48, maxWidth: 760 }}>
          <span className="eyebrow" style={{ marginBottom: 16 }}>SELECTED PROPERTY PAGES</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(34px, 4.6vw, 56px)', lineHeight: 1.02, letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0 }}>
            Property pages that look like <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>they belong to the business behind them.</em>
          </h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16 }}>
          {items.map((it, i) => {
            const span = i === 0 ? 7 : i === 1 ? 5 : i === 2 ? 5 : 7;
            const row = i < 2 ? 1 : 2;
            return (
              <motion.figure
                key={it.title}
                {...fadeUp(i * 0.06)}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                style={{ gridColumn: `span ${span}`, gridRow: row, position: 'relative', margin: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)', minHeight: 'clamp(260px, 28vw, 380px)', background: 'var(--ink)' }}
              >
                <img src={it.img} alt={it.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.9s cubic-bezier(0.23,1,0.32,1)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,15,0.05) 0%, rgba(10,10,15,0.78) 100%)' }} />
                <figcaption style={{ position: 'absolute', left: 24, right: 24, bottom: 24, color: '#fff' }}>
                  <span className="label-mono" style={{ color: 'rgba(255,255,255,0.72)', display: 'block', marginBottom: 8 }}>{it.loc}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic', fontSize: 24, margin: '0 0 8px', color: '#fff' }}>{it.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)', margin: 0, maxWidth: 360 }}>{it.note}</p>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="section-y" style={{ background: 'var(--ink)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', bottom: '-12%', left: '-4%', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(180px, 26vw, 400px)', lineHeight: 0.85, color: 'rgba(255,255,255,0.06)', pointerEvents: 'none', userSelect: 'none' }}>
        share.
      </div>
      <div className="container-page" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <motion.div {...fadeUp(0)} style={{ maxWidth: 820, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(40px, 6vw, 80px)', lineHeight: 0.98, letterSpacing: '-0.025em', color: '#fff', marginBottom: 20 }}>
            Make every property presentation <em style={{ fontStyle: 'italic', color: 'var(--primary-light)' }}>reflect the business behind it.</em>
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,0.68)', marginBottom: 36, maxWidth: 620, marginInline: 'auto' }}>
            We\u2019re inviting a small set of real-estate operators to help test the first release of LAREI.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Magnetic to="/early-access" className="btn-primary" style={{ background: '#fff', color: 'var(--ink)', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}>Request early access</Magnetic>
            <Magnetic to="/sign-in" className="btn-secondary" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>Already invited? Sign in</Magnetic>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
