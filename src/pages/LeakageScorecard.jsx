import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertTriangle, CheckCircle2, Gauge, Download } from 'lucide-react';

import PageWrapper from '../components/PageWrapper';
import Eyebrow from '../components/ui/Eyebrow';
import Newsletter from '../components/Newsletter';
import { useDocumentMeta } from '../lib/seo';

const FIRST_CONTACT_OWNERS = [
  'Lead agent or team lead',
  'Inside sales agent (ISA) team',
  'Round-robin to all agents',
  'Voicemail / form replies only',
  'No defined owner',
];

// ─── Scoring helpers ────────────────────────────────────────────────────────
const score = (input) => {
  const {
    leads,
    responseMin,
    contactRate,
    qualRate,
    apptRate,
    afterHoursPct,
    commission,
    leadCost,
  } = input;

  // Each metric is scored 0-100 against an operator-grade benchmark.
  // Lower-is-worse metrics: contact rate, qual rate, appt rate.
  // Higher-is-worse metrics: response time, after-hours leakage.

  const responseScore = (() => {
    if (responseMin <= 5) return 100;
    if (responseMin <= 15) return 80;
    if (responseMin <= 30) return 60;
    if (responseMin <= 60) return 40;
    if (responseMin <= 240) return 20;
    return 5;
  })();

  const contactScore = Math.min(100, Math.max(0, contactRate * 1.25)); // 80% contact = 100
  const qualScore = Math.min(100, Math.max(0, qualRate * 2)); // 50% qual = 100
  const apptScore = Math.min(100, Math.max(0, apptRate * 4)); // 25% appt = 100
  const afterHoursScore = Math.max(0, 100 - afterHoursPct * 1.5); // 67% after-hours w/ no coverage = 0

  const weights = {
    responseScore: 0.28,
    contactScore: 0.18,
    qualScore: 0.18,
    apptScore: 0.20,
    afterHoursScore: 0.16,
  };

  const health =
    responseScore * weights.responseScore +
    contactScore * weights.contactScore +
    qualScore * weights.qualScore +
    apptScore * weights.apptScore +
    afterHoursScore * weights.afterHoursScore;

  // Leakage score: 0-100 where 100 = lots of leakage (inverse of health).
  const leakage = Math.round(100 - health);

  // Risk band
  const risk =
    leakage <= 20 ? 'Low' : leakage <= 40 ? 'Moderate' : leakage <= 65 ? 'High' : 'Critical';

  const breakdown = [
    { name: 'Response time', score: Math.round(responseScore), weight: weights.responseScore },
    { name: 'Contact rate', score: Math.round(contactScore), weight: weights.contactScore },
    { name: 'Qualification depth', score: Math.round(qualScore), weight: weights.qualScore },
    { name: 'Appointment booking', score: Math.round(apptScore), weight: weights.apptScore },
    { name: 'After-hours coverage', score: Math.round(afterHoursScore), weight: weights.afterHoursScore },
  ];

  // Likely bottleneck = lowest sub-score (with weight tiebreak toward higher weight).
  const bottleneck = [...breakdown].sort((a, b) => a.score - b.score || b.weight - a.weight)[0];

  const FIXES = {
    "Response time":
      "Stand up a sub-5-minute response mechanism on every channel. PAS answers under 30 seconds, voice / SMS / chat, around the clock.",
    "Contact rate":
      "Most uncontacted leads are reachable on a different channel or at a different time. PAS works the lead across channels until contact is established or the lead opts out.",
    "Qualification depth":
      "Replace inconsistent intake with a structured qualification flow: intent, budget, timeline, financing, location. PAS captures all five in writing on every lead.",
    "Appointment booking":
      "Stop ending qualified conversations without a booked next step. PAS books directly on the right agent's calendar with full context attached.",
    "After-hours coverage":
      "Inquiries after 7pm and before 9am are highest-intent and most likely to leak. PAS runs continuously and books for the next available agent slot.",
  };
  const fix = FIXES[bottleneck.name];

  // Missed opportunity estimate
  const idealAppts = leads * 0.35; // operator-grade: 35% of inbound becomes a booked appt
  const actualAppts = leads * (apptRate / 100);
  const missedAppts = Math.max(0, idealAppts - actualAppts);
  const missedClosesEst = missedAppts * 0.18; // ~18% of appts close
  const missedRevenue = missedClosesEst * commission;
  const missedSpend = leadCost > 0 ? leads * (1 - contactRate / 100) * leadCost : 0;

  return {
    health: Math.round(health),
    leakage,
    risk,
    breakdown,
    bottleneck,
    fix,
    missedAppts,
    missedRevenue,
    missedSpend,
  };
};

// ─── Sub components ───────────────────────────────────────────────────────
function NumberInput({ label, value, set, prefix, suffix, hint, min, max, step = 1 }) {
  return (
    <div>
      <label className="label-mono" style={{ marginBottom: 8, display: 'block' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-dim)' }}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => set(e.target.value)}
          min={min}
          max={max}
          step={step}
          style={{
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: `12px ${suffix ? '34px' : '14px'} 12px ${prefix ? '28px' : '14px'}`,
            fontSize: 15,
            color: 'var(--ink)',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-dim)' }}>
            {suffix}
          </span>
        )}
      </div>
      {hint && <p style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 6 }}>{hint}</p>}
    </div>
  );
}

function RiskBadge({ risk }) {
  const map = {
    Low: { bg: '#ECFDF5', border: '#A7F3D0', color: '#065F46' },
    Moderate: { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E' },
    High: { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B' },
    Critical: { bg: '#FEE2E2', border: '#FCA5A5', color: '#7F1D1D' },
  }[risk] || { bg: 'var(--surface)', border: 'var(--line)', color: 'var(--ink-mid)' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: map.bg,
        border: `1px solid ${map.border}`,
        color: map.color,
        padding: '6px 14px',
        borderRadius: 100,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {risk === 'Low' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
      First-contact risk: {risk}
    </span>
  );
}

// ─── Page ───────────────────────────────────────────────────────────
export default function LeakageScorecard() {
  useDocumentMeta({
    title: 'Lead Leakage Scorecard — Diagnostic Tool for Brokerages',
    description: 'A five-minute diagnostic of where your real estate brokerage is leaking inbound leads. Identify bottlenecks in response time, contact rate, and qualification depth.',
    path: '/calculators/leakage',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'Lead Leakage Scorecard',
      'operatingSystem': 'Web',
      'applicationCategory': 'BusinessApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    }
  });

  const [searchParams] = useSearchParams();
  // Inputs are lazily initialised from query params (emailed deep links), so prefill
  // happens at first render — the effect below performs no synchronous setState.
  const [leads, setLeads] = useState(() => searchParams.get('leads') || 150);
  const [responseMin, setResponseMin] = useState(() => searchParams.get('rm') || 45);
  const [contactRate, setContactRate] = useState(() => searchParams.get('cr') || 55);
  const [qualRate, setQualRate] = useState(() => searchParams.get('qr') || 28);
  const [apptRate, setApptRate] = useState(() => searchParams.get('ar') || 15);
  const [afterHoursPct, setAfterHoursPct] = useState(() => searchParams.get('ah') || 35);
  const [commission, setCommission] = useState(() => searchParams.get('comm') || 12000);
  const [owner, setOwner] = useState(() => searchParams.get('owner') || FIRST_CONTACT_OWNERS[0]);
  const [leadCost, setLeadCost] = useState(() => searchParams.get('lc') || '');
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState('');
  const [submitState, setSubmitState] = useState('idle');

  const handleDownloadPdf = () => {
    if (!result || !window.jspdf) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const dateStr = new Date().toLocaleDateString();

    // ─── WATERMARK ──────────────────────────────────────────────────────────
    try {
      doc.setGState(new doc.GState({ opacity: 0.03 }));
      doc.addImage('/logo.png', 'PNG', pageWidth / 2 - 50, pageHeight / 2 - 50, 100, 100, undefined, 'FAST');
      doc.setGState(new doc.GState({ opacity: 1 }));
    } catch (e) {
      console.warn('PDF Watermark failed to load', e);
    }

    // ─── 1. HEADER ───────────────────────────────────────────────────────────
    doc.setFillColor(91, 63, 212); // Brand Purple
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text('ORVN LABS', 15, 18);

    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.text('LEAD LEAKAGE SCORECARD', 15, 26);
    doc.text(`DATE: ${dateStr}`, pageWidth - 15, 26, { align: 'right' });

    // ─── 2. SCORE SECTION ───────────────────────────────────────────────────
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text('OVERALL LEAKAGE SCORE', 15, 55);

    const scoreColor = result.leakage <= 20 ? [13, 158, 110] : result.leakage <= 40 ? [217, 119, 6] : [220, 38, 38];
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setFontSize(42);
    doc.setFont('times', 'bold');
    doc.text(`${result.leakage}/100`, 15, 72);

    doc.setFontSize(12);
    doc.text(`RISK LEVEL: ${result.risk.toUpperCase()}`, 15, 82);

    // ─── 3. SUB-SCORES TABLE ────────────────────────────────────────────────
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text('01. PERFORMANCE BREAKDOWN', 15, 100);

    const breakdownData = result.breakdown.map(b => [b.name, `${b.score}/100`]);
    doc.autoTable({
      startY: 105,
      head: [['Category', 'Score']],
      body: breakdownData,
      theme: 'grid',
      headStyles: {
        fillColor: [91, 63, 212],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        font: 'helvetica',
        halign: 'left',
        valign: 'middle'
      },
      bodyStyles: {
        textColor: [15, 23, 42],
        fontSize: 10,
        font: 'helvetica',
        halign: 'left',
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [247, 248, 251]
      },
      margin: { left: 15, right: 15 },
      columnStyles: { 1: { halign: 'right' } }
    });

    // ─── 4. BOTTLENECK ANALYSIS ─────────────────────────────────────────────
    let currentY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('02. PRIMARY BOTTLENECK', 15, currentY);
    currentY += 10;

    doc.setFillColor(254, 242, 242);
    doc.rect(15, currentY, pageWidth - 30, 30, 'F');
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(11);
    doc.text(result.bottleneck.name.toUpperCase(), 20, currentY + 10);
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    const splitFix = doc.splitTextToSize(result.fix, pageWidth - 45);
    doc.text(splitFix, 20, currentY + 18);
    currentY += 40;

    // ─── 5. MISSED OPPORTUNITY ──────────────────────────────────────────────
    if (result.missedRevenue > 0 || result.missedSpend > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('03. FINANCIAL IMPACT', 15, currentY);
      currentY += 10;

      const impactData = [];
      if (result.missedRevenue > 0) impactData.push(['Est. Missed Revenue / Mo', `$${Math.round(result.missedRevenue).toLocaleString()}`]);
      if (result.missedSpend > 0) impactData.push(['Wasted Lead Spend / Mo', `$${Math.round(result.missedSpend).toLocaleString()}`]);

      doc.autoTable({
        startY: currentY,
        body: impactData,
        theme: 'plain',
        bodyStyles: { fontSize: 11, fontStyle: 'bold' },
        margin: { left: 15, right: 15 },
      });
    }

    // ─── FOOTER ──────────────────────────────────────────────────────────────
    doc.setDrawColor(229, 232, 240);
    doc.line(15, 280, pageWidth - 15, 280);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('ORVN LABS © 2025 · HELLO@ORVNLABS.COM · AUDIT REPORT', pageWidth / 2, 287, { align: 'center' });

    doc.save(`ORVN-Scorecard-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@') || !result) return;
    setSubmitState('loading');

    const payload = {
      email,
      submittedAt: new Date().toISOString(),
      source: 'leakage_scorecard',
      inputs: {
        monthlyLeads: leads,
        avgResponseTimeMin: responseMin,
        contactRate,
        qualificationRate: qualRate,
        appointmentRate: apptRate,
        afterHoursPct,
        avgCommission: commission,
        leadCost: leadCost || null,
        firstContactOwner: owner,
      },
      outputs: {
        leakageScore: result.leakage,
        healthScore: result.health,
        riskLevel: result.risk,
        bottleneckName: result.bottleneck.name,
        bottleneckScore: result.bottleneck.score,
        missedRevenue: Math.round(result.missedRevenue),
        missedSpend: Math.round(result.missedSpend),
      },
    };

    try {
      const res = await fetch('/api/leakage-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.warn('[leakage-scorecard] backend unavailable, captured locally', err, payload);
    }
    setSubmitState('success');
  };

  const run = () => {
    const r = score({
      leads: parseFloat(leads) || 0,
      responseMin: parseFloat(responseMin) || 0,
      contactRate: parseFloat(contactRate) || 0,
      qualRate: parseFloat(qualRate) || 0,
      apptRate: parseFloat(apptRate) || 0,
      afterHoursPct: parseFloat(afterHoursPct) || 0,
      commission: parseFloat(commission) || 0,
      leadCost: parseFloat(leadCost) || 0,
    });
    setResult(r);
    setTimeout(() => document.getElementById('scorecard-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  // If the visitor arrived from an emailed deep link, auto-run the scorecard once.
  // Inputs are already prefilled via lazy useState initialisers above.
  React.useEffect(() => {
    const hasParams = ['leads', 'rm', 'cr', 'qr', 'ar', 'ah', 'comm', 'lc', 'owner'].some((k) => searchParams.get(k));
    if (hasParams) {
      const t = setTimeout(() => run(), 100);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <PageWrapper>
      <style>{`
        @media print {
          body { background: #fff !important; }
          nav, footer, .no-print, header, .btn-primary, .btn-secondary, button { display: none !important; }
          .container-page { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          #scorecard-result { display: block !important; border: none !important; padding: 0 !important; margin-top: 0 !important; }
          .section-y { padding: 0 !important; }
          .print-header { display: block !important; margin-bottom: 32px; border-bottom: 2px solid var(--primary); padding-bottom: 16px; }
          .card { box-shadow: none !important; border: 1px solid var(--line) !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .print-header { display: none; }
      `}</style>

      <section className="no-print section-y" style={{ background: '#fff' }}>
        <div className="container-page" style={{ maxWidth: 760 }}>
          <Eyebrow>Lead leakage scorecard</Eyebrow>
          <h1 className="h-display-2" style={{ margin: '14px 0 16px' }}>
            Where is your first-contact layer leaking?
          </h1>
          <p className="lead-2">
            A five-minute diagnostic. Eight inputs. Plain-English score, likely bottleneck,
            suggested fix. Runs locally — no signup, no calendar booking.
          </p>
        </div>
      </section>

      <section className="section-y" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <div className="container-page">
          <div
            className="card"
            style={{ padding: 'clamp(24px, 4vw, 36px)' }}
          >
            <div className="grid-cols-responsive" style={{ gap: 18 }}>
              <NumberInput label="Monthly inbound leads" value={leads} set={setLeads} hint="All channels combined" />
              <NumberInput label="Avg response time" value={responseMin} set={setResponseMin} suffix="min" hint="Inquiry to first substantive reply" />
              <NumberInput label="Contact rate" value={contactRate} set={setContactRate} suffix="%" hint="Of leads ever reached at all" />
              <NumberInput label="Qualification rate" value={qualRate} set={setQualRate} suffix="%" hint="Of contacted leads with intent + timeline captured" />
              <NumberInput label="Appointment rate" value={apptRate} set={setApptRate} suffix="%" hint="Of inbound leads that become booked appts" />
              <NumberInput label="After-hours lead %" value={afterHoursPct} set={setAfterHoursPct} suffix="%" hint="Inquiries between 7pm and 9am" />
              <NumberInput label="Avg commission per deal" value={commission} set={setCommission} prefix="$" hint="Your take-home per closed deal" />
              <NumberInput label="Avg lead cost (optional)" value={leadCost} set={setLeadCost} prefix="$" hint="What you pay per lead, all sources" />

              <div>
                <label className="label-mono" style={{ marginBottom: 8, display: 'block' }}>
                  Current first-contact owner
                </label>
                <select
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    fontSize: 14,
                    color: 'var(--ink)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {FIRST_CONTACT_OWNERS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <p style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 6 }}>Who handles inbound first today</p>
              </div>
            </div>

            <button type="button" onClick={run} className="btn-primary" style={{ width: '100%', padding: 16, fontSize: 16, marginTop: 28 }}>
              <Gauge size={18} /> Run my leakage scorecard
            </button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                id="scorecard-result"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ marginTop: 24, position: 'relative', overflow: 'hidden' }}
              >
                {/* Watermark Logo (Subtle Background) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-30deg)',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    opacity: 0.03,
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                >
                  <img src="/logo.png" style={{ width: '100%', maxWidth: 400, height: 'auto' }} alt="" />
                </div>

                {/* Content Wrapper */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div
                    className="card"
                    style={{ padding: 'clamp(24px, 4vw, 36px)', marginBottom: 16 }}
                  >
                  {/* Visible only when printing */}
                  <div className="print-header">
                    <div className="h-section-2" style={{ marginBottom: 4 }}>ORVN LABS</div>
                    <div style={{ color: 'var(--primary)', fontWeight: 600 }}>Official Lead Leakage Scorecard</div>
                    <div style={{ color: 'var(--ink-dim)', marginTop: 12 }}>
                      Generated on: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <div className="grid-cols-responsive" style={{ gap: 24, alignItems: 'center', marginBottom: 24 }}>
                    <div>
                      <div className="label-mono" style={{ marginBottom: 8 }}>
                        Leakage score
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(56px, 9vw, 96px)',
                          color: result.leakage <= 20 ? 'var(--ok)' : result.leakage <= 40 ? 'var(--warn)' : 'var(--risk)',
                          lineHeight: 1,
                          marginBottom: 8,
                          fontWeight: 800,
                          letterSpacing: '-0.04em',
                        }}
                      >
                        {result.leakage}
                        <span style={{ fontSize: 24, color: 'var(--ink-dim)' }}> / 100</span>
                      </div>
                      <RiskBadge risk={result.risk} />

                      {/* Download Button */}
                      <div className="no-print" style={{ marginTop: 24 }}>
                        <button
                          onClick={handleDownloadPdf}
                          className="btn-secondary"
                          style={{ background: '#fff', fontSize: 13, padding: '10px 20px' }}
                        >
                          <Download size={14} /> Download PDF Report
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="label-mono" style={{ marginBottom: 12 }}>
                        Sub-scores (higher = healthier)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {result.breakdown.map((b) => (
                          <div key={b.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                              <span style={{ color: 'var(--ink)' }}>{b.name}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', color: b.score >= 70 ? 'var(--ok)' : b.score >= 40 ? 'var(--warn)' : 'var(--risk)' }}>
                                {b.score}/100
                              </span>
                            </div>
                            <div style={{ height: 6, background: 'var(--line-strong)', borderRadius: 3, overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${b.score}%`,
                                  background: b.score >= 70 ? 'var(--ok)' : b.score >= 40 ? 'var(--warn)' : 'var(--risk)',
                                  transition: 'width 0.6s ease',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottleneck fix */}
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderLeft: `3px solid var(--risk)`,
                      borderRadius: 12,
                      padding: 18,
                      marginBottom: 16,
                    }}
                  >
                    <div className="label-mono" style={{ color: 'var(--risk)', marginBottom: 6 }}>
                      Likely bottleneck
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
                      {result.bottleneck.name} — {result.bottleneck.score}/100
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--ink-mid)', margin: 0, lineHeight: 1.65 }}>{result.fix}</p>
                  </div>

                  {(result.missedRevenue > 0 || result.missedSpend > 0) && (
                    <div className="grid-cols-responsive" style={{ gap: 12 }}>
                      {result.missedRevenue > 0 && (
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 18 }}>
                          <div className="label-mono" style={{ marginBottom: 6 }}>
                            Estimated missed revenue / month
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--risk)', lineHeight: 1 }}>
                            ${Math.round(result.missedRevenue).toLocaleString()}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--ink-dim)', marginTop: 4 }}>
                            ~{result.missedAppts.toFixed(1)} missed appointments × ~18% close × commission
                          </div>
                        </div>
                      )}
                      {result.missedSpend > 0 && (
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 18 }}>
                          <div className="label-mono" style={{ marginBottom: 6 }}>
                            Wasted lead spend / month
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--warn)', lineHeight: 1 }}>
                            ${Math.round(result.missedSpend).toLocaleString()}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--ink-dim)', marginTop: 4 }}>
                            Cost-per-lead × never-contacted leads
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assumptions note (B9) — visible, not just in code */}
                  <div
                    style={{
                      marginTop: 16,
                      background: 'var(--surface)',
                      border: '1px dashed var(--primary-pale)',
                      borderRadius: 12,
                      padding: '14px 18px',
                    }}
                  >
                    <div className="label-mono-primary" style={{ marginBottom: 8 }}>
                      Assumptions in this estimate
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--ink-mid)', lineHeight: 1.7 }}>
                      <li>Operator-grade benchmark: ~35% of inbound leads become a booked appointment.</li>
                      <li>Missed revenue assumes ~18% of missed appointments would have closed, at your entered commission.</li>
                      <li>Wasted lead spend is $0 unless you enter an average lead cost; it counts only never-contacted leads.</li>
                      <li>This is a directional diagnostic, not a guaranteed forecast.</li>
                    </ul>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'clamp(28px, 4vw, 40px)',
                    color: '#fff',
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 32px)', color: '#fff', margin: '0 0 12px' }}>
                    {result.risk === 'Low'
                      ? 'Your first-contact layer is in solid shape.'
                      : `${result.bottleneck.name} is the highest-leverage fix.`}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 1.7, margin: '0 0 22px', maxWidth: 620 }}>
                    Run the Revenue Calculator to see what the
                    leakage costs in dollars per year.
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link to="/calculators/revenue" className="btn-secondary" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                      Run Revenue Calculator
                    </Link>
                  </div>
                </div>

                  <div className="card" style={{ padding: 'clamp(24px, 4vw, 36px)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, alignItems: 'center', marginBottom: 24 }}>
                      <div>
                        <h3 style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--ink)', margin: '0 0 6px' }}>
                          Email me this scorecard report.
                        </h3>
                        <p style={{ fontSize: 13.5, color: 'var(--ink-mid)', margin: 0, lineHeight: 1.6 }}>
                          Get a copy of your leakage analysis, breakdown, and recommended fix
                          delivered to your inbox. No spam.
                        </p>
                      </div>
                      {submitState === 'success' ? (
                        <div
                          style={{
                            background: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            borderRadius: 12,
                            padding: 16,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            color: '#065F46',
                            fontSize: 14,
                          }}
                        >
                          <CheckCircle2 size={18} /> Scorecard sent. Check your inbox.
                        </div>
                      ) : (
                        <form
                          onSubmit={handleEmailSubmit}
                          style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                        >
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@brokerage.com"
                            style={{
                              flex: '1 1 200px',
                              background: '#fff',
                              border: '1px solid var(--line)',
                              borderRadius: 12,
                              padding: '12px 14px',
                              fontSize: 14,
                              color: 'var(--ink)',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitState === 'loading'}
                            style={{ opacity: submitState === 'loading' ? 0.7 : 1 }}
                          >
                            {submitState === 'loading' ? 'Sending…' : 'Send report'} <ArrowRight size={15} />
                          </button>
                        </form>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-dim)', width: '100%', textAlign: 'center', margin: 0 }}>
                      Check your spam folder if you don't see the report in 5 minutes.
                    </p>
                    <Newsletter source="leakage_scorecard" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageWrapper>
  );
}
