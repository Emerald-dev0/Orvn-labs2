import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp, ArrowRight, Download } from 'lucide-react';

import PageWrapper from '../components/PageWrapper';
import Section from '../components/ui/Section';
import Eyebrow from '../components/ui/Eyebrow';
import { useDocumentMeta } from '../lib/seo';

const fm = (n) => {
  const num = Math.round(n);
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
  return '$' + num.toLocaleString();
};
const pct = (n) => (n * 100).toFixed(0) + '%';
const pct1 = (n) => (n * 100).toFixed(1) + '%';

const formatResp = (v) => (v <= 60 ? `${v} min` : `${(v / 60).toFixed(1)} hrs`);

// Qualitative response-time risk band. No revenue multiplier — there is no sourced
// response-time→conversion distribution in this repo, so response time is a risk
// signal only, never a dollar figure.
const responseBand = (rt) => {
  if (rt < 5) return { label: 'Target zone', tone: 'var(--ok)', bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' };
  if (rt <= 15) return { label: 'Early leakage risk', tone: 'var(--warn)', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' };
  if (rt <= 60) return { label: 'Meaningful delay', tone: 'var(--warn)', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' };
  if (rt <= 240) return { label: 'High delay', tone: 'var(--risk)', bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' };
  return { label: 'Severe delay', tone: 'var(--risk)', bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' };
};

function AnimCounter({ target, prefix = '', suffix = '', duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return (
    <>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </>
  );
}

const MathRow = ({ label, value, color, bold, border }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: border !== false ? '1px solid var(--line-strong)' : 'none',
      borderTop: bold ? '1px solid var(--line)' : 'none',
      marginTop: bold ? 4 : 0,
    }}
  >
    <span style={{ fontSize: 13, color: bold ? 'var(--ink)' : 'var(--ink-mid)', fontWeight: bold ? 600 : 400 }}>{label}</span>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: bold ? 700 : 500, color: color || (bold ? 'var(--ink)' : 'var(--ink-mid)') }}>
      {value}
    </span>
  </div>
);

function AuditPanel({ number, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--surface)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          borderBottom: open ? '1px solid var(--line)' : 'none',
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {number}
        </span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{title}</span>
        {open ? <ChevronUp size={16} color="var(--ink-dim)" /> : <ChevronDown size={16} color="var(--ink-dim)" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '20px' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TblRow = ({ cols, header }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(100px, 2fr) repeat(3, minmax(56px, 1fr))',
      gap: 8,
      padding: '8px 12px',
      background: header ? 'var(--surface)' : '#fff',
      borderBottom: '1px solid var(--line-strong)',
      width: '100%',
      minWidth: 'fit-content',
    }}
  >
    {cols.map((c, i) => (
      <span
        key={i}
        style={{
          fontSize: header ? 10 : 13,
          fontFamily: header ? 'var(--font-mono)' : 'var(--font-body)',
          color: c.color || (header ? 'var(--ink-dim)' : 'var(--ink-mid)'),
          fontWeight: c.bold ? 600 : header ? 500 : 400,
          letterSpacing: header ? '0.1em' : 0,
          textTransform: header ? 'uppercase' : 'none',
        }}
      >
        {c.text}
      </span>
    ))}
  </div>
);

export default function RevenueCalculator() {
  useDocumentMeta({
    title: 'Real Estate Revenue Recovery Calculator',
    description: 'Estimate the annual revenue your brokerage could recover by improving first-contact consistency and speed-to-lead. Model your close-rate lift and database reactivation potential.',
    path: '/calculators/revenue',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'Real Estate Revenue Recovery Calculator',
      'operatingSystem': 'Web',
      'applicationCategory': 'FinanceApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    }
  });

  const [searchParams] = useSearchParams();
  // Inputs are lazily initialised from query params (emailed-report deep links),
  // so prefill happens at first render — no setState inside the effect below.
  const [leads, setLeads] = useState(() => searchParams.get('leads') || 150);
  const [commission, setCommission] = useState(() => searchParams.get('comm') || 12000);
  const [currentClose, setCurrentClose] = useState(() => searchParams.get('cr') || 8);
  // Pre-filled, editable target scenario — a modest lift above the current rate.
  const [targetClose, setTargetClose] = useState(() => {
    const tc = searchParams.get('tc');
    if (tc) return tc;
    const cr = parseFloat(searchParams.get('cr'));
    return cr ? String(Math.min(30, cr + 4)) : 12;
  });
  const [responseTime, setResponseTime] = useState(() => searchParams.get('rt') || 45);
  const [isaCost, setIsaCost] = useState(() => {
    const isa = searchParams.get('isa');
    return isa && isa !== '0' ? isa : '';
  });
  const [crmSize, setCrmSize] = useState(() => {
    const crm = searchParams.get('crm');
    return crm && crm !== '0' ? crm : '';
  });
  const [results, setResults] = useState(null);
  const [showAudit, setShowAudit] = useState(false);
  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [submitState, setSubmitState] = useState('idle');

  const calculate = (scroll = true) => {
    const rt = parseInt(responseTime, 10) || 0;
    const curCR = (parseFloat(currentClose) || 0) / 100;
    const tgtCR = (parseFloat(targetClose) || 0) / 100;
    const L = parseFloat(leads) || 0;
    const C = parseFloat(commission) || 0;
    const ISA = parseFloat(isaCost) || 0;

    // CRM fallback preserved from main: default to ~24 months of accumulated leads if blank.
    const crmFallback = !(parseFloat(crmSize) > 0);
    const CRM = parseFloat(crmSize) || (L * 24);

    // ── Recoverable-opportunity model (current close rate is never penalized twice) ──
    const currentDeals = L * curCR;
    const targetDeals = L * tgtCR;
    const hasGap = tgtCR > curCR;
    const recoverableDeals = hasGap ? Math.max(targetDeals - currentDeals, 0) : 0;
    const recoverableMonth = recoverableDeals * C;
    const recoverableYear = recoverableMonth * 12;

    // ── Database re-engagement ("graveyard") — separate, clearly-labeled, illustrative bucket ──
    const reRate = 0.12; // illustrative assumption — not research-backed
    const reactivatable = CRM * reRate;
    const graveyardClose = curCR * 0.4; // 40% OF the current close rate (a 60% haircut)
    const graveyardDeals = reactivatable * graveyardClose;
    const graveyardValue = graveyardDeals * C;

    // ── ISA coverage / operating-cost context (no fabricated PAS price) ──
    const isaHoursWeek = 45;
    const isaAnnualHours = isaHoursWeek * 52; // 2,340 hrs/yr
    const pasAnnualHours = 8760; // 24 × 365
    const coverageGap = Math.max(pasAnnualHours - isaAnnualHours, 0); // 6,420 hrs/yr
    const isaMonthly = ISA / 12;

    // Combined upside is only ever shown as an explicitly-labeled scenario.
    const combinedUpside = recoverableYear + graveyardValue;

    const band = responseBand(rt);

    let insight = '';
    if (!hasGap) {
      insight = `Based on your inputs, your target close rate (${pct(tgtCR)}) isn't higher than your current rate (${pct(curCR)}), so there's no modeled close-rate gap to recover. Faster, more consistent first contact still reduces risk on the leads you're currently losing — your response time of ${formatResp(rt)} is in the "${band.label.toLowerCase()}" range.`;
    } else {
      insight = `Lifting your close rate from ${pct(curCR)} to a target of ${pct(tgtCR)} on ${L.toLocaleString()} monthly leads models ${recoverableDeals.toFixed(1)} additional deals per month — ${fm(recoverableMonth)}/month, ${fm(recoverableYear)}/year of recoverable opportunity. This is a systems opportunity: protect more of the intent you already pay for.`;
    }
    if (CRM > 500) {
      insight += ` Separately, your database of ${CRM.toLocaleString()} leads holds an illustrative ${Math.round(reactivatable)} re-engageable contacts (a ${pct(reRate)} editable assumption) worth roughly ${fm(graveyardValue)} at a conservative reactivation close rate.`;
    }
    if (ISA > 0) {
      insight += ` Your ISA investment of ${fm(ISA)}/year (${fm(isaMonthly)}/month) is your current first-contact cost. A human ISA covers about ${isaAnnualHours.toLocaleString()} hours/year against continuous coverage — a gap of roughly ${coverageGap.toLocaleString()} hours. PAS early-access pricing is quoted per brokerage.`;
    }

    setResults({
      rt, band, curCR, tgtCR, hasGap, L, C, ISA, CRM, crmFallback, reRate,
      currentDeals, targetDeals, recoverableDeals, recoverableMonth, recoverableYear,
      reactivatable, graveyardClose, graveyardDeals, graveyardValue,
      isaHoursWeek, isaAnnualHours, pasAnnualHours, coverageGap, isaMonthly,
      combinedUpside, insight,
    });
    setShowAudit(false);

    if (scroll) {
      setTimeout(() => {
        document.getElementById('calc-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  // If the visitor arrived from an emailed report link, auto-run the calculation once.
  // Inputs are already prefilled via lazy useState initialisers above, so the effect
  // body performs no synchronous setState.
  useEffect(() => {
    if (searchParams.get('email')) {
      const t = setTimeout(() => calculate(false), 100);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleDownloadPdf = () => {
    if (!results || !window.jspdf) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const dateStr = new Date().toLocaleDateString();
    const margin = 15;
    let yPos = margin;

    const addPage = () => {
      doc.addPage();
      yPos = margin;
    };

    const checkPageBreak = (spaceNeeded) => {
      if (yPos + spaceNeeded > pageHeight - margin) {
        addPage();
      }
    };

    // ─── HEADER ──────────────────────────────────────────────────────────────
    doc.setFillColor(91, 63, 212);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('ORVN LABS', margin, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('REVENUE AUDIT REPORT', margin, 24);
    doc.text(`Generated: ${dateStr}`, pageWidth - margin, 24, { align: 'right' });
    yPos = 45;

    // ─── HEADLINE METRICS ────────────────────────────────────────────────────
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Total Annual Opportunity', margin, yPos);
    yPos += 10;
    doc.setFontSize(28);
    doc.setTextColor(220, 38, 38);
    doc.text(fm(results.total), margin, yPos);
    yPos += 15;

    doc.setDrawColor(229, 232, 240);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // ─── SECTION 1: AUDIT INPUTS ────────────────────────────────────────────
    checkPageBreak(60);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. AUDIT INPUTS', margin, yPos);
    yPos += 8;

    const inputRows = [
      ['Monthly Inbound Leads', results.L.toLocaleString()],
      ['Average Commission', fm(results.C)],
      ['Lead-to-Close Rate', pct(results.cr)],
      ['Response Time', formatResp(results.rt)],
      ['CRM Database Size', results.CRM > 0 ? results.CRM.toLocaleString() : 'N/A'],
      ['Annual ISA Cost', results.ISA > 0 ? fm(results.ISA) : 'N/A'],
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    inputRows.forEach(([label, value]) => {
      doc.setTextColor(100, 116, 139);
      doc.text(label, margin, yPos);
      doc.setTextColor(15, 23, 42);
      doc.text(value, pageWidth - margin - 20, yPos, { align: 'right' });
      yPos += 7;
    });
    yPos += 10;

    // ─── SECTION 2: SPEED-TO-LEAD CALCULATION ───────────────────────────────
    checkPageBreak(80);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('2. SPEED-TO-LEAD ANALYSIS', margin, yPos);
    yPos += 8;

    doc.setFillColor(254, 242, 242);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 30, 'F');
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Annual Revenue Lost to Slow Response', margin + 5, yPos + 8);
    doc.setFontSize(18);
    doc.text(fm(results.annualLost), margin + 5, yPos + 18);
    doc.setFontSize(9);
    doc.setTextColor(127, 29, 29);
    doc.text(`${pct(results.P)} conversion potential lost before first human contact`, margin + 5, yPos + 25);
    yPos += 35;

    // Calculation breakdown
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    yPos += 3;
    doc.text(`Ideal deals/month: ${results.L} leads × ${pct(results.cr)} close rate = ${results.idealDeals.toFixed(1)}`, margin + 5, yPos);
    yPos += 6;
    doc.text(`Deals lost/month: ${results.idealDeals.toFixed(1)} × ${pct(results.P)} = ${results.dealsLost.toFixed(1)}`, margin + 5, yPos);
    yPos += 6;
    doc.text(`Revenue lost/month: ${results.dealsLost.toFixed(1)} deals × ${fm(results.C)} = ${fm(results.monthlyLost)}`, margin + 5, yPos);
    yPos += 6;
    doc.text(`Annual total: ${fm(results.monthlyLost)} × 12 months = ${fm(results.annualLost)}`, margin + 5, yPos);
    yPos += 12;

    // ─── SECTION 3: GRAVEYARD ANALYSIS ──────────────────────────────────────
    if (results.CRM > 0 && results.graveyardValue > 0) {
      checkPageBreak(70);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('3. CRM GRAVEYARD ANALYSIS', margin, yPos);
      yPos += 8;

      doc.setFillColor(236, 253, 245);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 30, 'F');
      doc.setTextColor(13, 158, 110);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Recoverable Revenue in Dormant Leads', margin + 5, yPos + 8);
      doc.setFontSize(18);
      doc.text(fm(results.graveyardValue), margin + 5, yPos + 18);
      doc.setFontSize(9);
      doc.setTextColor(13, 158, 110);
      doc.text(`${Math.round(results.reactivatable)} leads × ${pct(results.adjustedClose)} adjusted close rate`, margin + 5, yPos + 25);
      yPos += 35;

      // Calculation breakdown
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      yPos += 3;
      doc.text(`Reactivatable leads: ${results.CRM.toLocaleString()} × 12% = ${Math.round(results.reactivatable)}`, margin + 5, yPos);
      yPos += 6;
      doc.text(`Adjusted close rate: ${pct(results.cr)} × 40% discount = ${pct(results.adjustedClose)}`, margin + 5, yPos);
      yPos += 6;
      doc.text(`Recoverable deals: ${Math.round(results.reactivatable)} × ${pct(results.adjustedClose)} = ${results.recoverableDeals.toFixed(1)}`, margin + 5, yPos);
      yPos += 6;
      doc.text(`Graveyard value: ${results.recoverableDeals.toFixed(1)} deals × ${fm(results.C)} = ${fm(results.graveyardValue)}`, margin + 5, yPos);
      yPos += 12;
    }

    // ─── SECTION 4: ISA vs PAS ───────────────────────────────────────────────
    if (results.ISA > 0) {
      checkPageBreak(60);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('4. ISA COST vs PAS', margin, yPos);
      yPos += 8;

      const isaRows = [
        ['Annual ISA Cost', fm(results.ISA)],
        ['Monthly ISA Cost', fm(results.isaMonthly)],
        ['PAS Starter Monthly', '$500'],
        ['Monthly Savings', fm(results.isaSaving)],
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      isaRows.forEach(([label, value]) => {
        doc.setTextColor(100, 116, 139);
        doc.text(label, margin, yPos);
        doc.setTextColor(15, 23, 42);
        const color = value.includes('-') ? [220, 38, 38] : [13, 158, 110];
        doc.setTextColor(...color);
        doc.text(value, pageWidth - margin - 20, yPos, { align: 'right' });
        yPos += 7;
      });
      yPos += 10;
    }

    // ─── SECTION 5: BREAK-EVEN ANALYSIS ─────────────────────────────────────
    if (results.breakEvenAppts) {
      checkPageBreak(50);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('5. PAS BREAK-EVEN ANALYSIS', margin, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Revenue per appointment:', margin, yPos);
      doc.setTextColor(15, 23, 42);
      doc.text(fm(results.revenuePerAppt), pageWidth - margin - 20, yPos, { align: 'right' });
      yPos += 7;

      doc.setTextColor(100, 116, 139);
      doc.text('PAS Starter monthly cost:', margin, yPos);
      doc.setTextColor(15, 23, 42);
      doc.text('$500', pageWidth - margin - 20, yPos, { align: 'right' });
      yPos += 7;

      doc.setTextColor(100, 116, 139);
      doc.text('Break-even appointments needed:', margin, yPos);
      doc.setTextColor(13, 158, 110);
      doc.setFont('helvetica', 'bold');
      doc.text(`${results.breakEvenAppts} appointments`, pageWidth - margin - 20, yPos, { align: 'right' });
      yPos += 12;
    }

    // ─── SECTION 6: INSIGHTS & RECOMMENDATIONS ──────────────────────────────
    checkPageBreak(60);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('6. KEY INSIGHTS & RECOMMENDATIONS', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const insight = results.insight || 'Review your calculation inputs above.';
    const splitInsight = doc.splitTextToSize(insight, pageWidth - 2 * margin - 5);
    doc.text(splitInsight, margin + 5, yPos);
    yPos += splitInsight.length * 6 + 15;

    // ─── FOOTER ──────────────────────────────────────────────────────────────
    doc.setDrawColor(229, 232, 240);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('ORVN LABS © 2025 · HELLO@ORVNLABS.COM', pageWidth / 2, pageHeight - 8, { align: 'center' });

    doc.save(`ORVN-Audit-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@') || !results) return;
    setSubmitState('loading');

    const payload = {
      email,
      submittedAt: new Date().toISOString(),
      source: 'revenue_calculator',
      inputs: {
        monthlyLeads: results.L,
        avgCommission: results.C,
        currentCloseRate: results.curCR,
        targetCloseRate: results.tgtCR,
        responseTimeMin: results.rt,
        annualIsaCost: results.ISA || null,
        crmDatabaseSize: results.CRM || null,
        reEngagementRate: results.reRate,
      },
      outputs: {
        recoverableRevenuePerMonth: Math.round(results.recoverableMonth),
        recoverableRevenuePerYear: Math.round(results.recoverableYear),
        recoverableDealsPerMonth: Number(results.recoverableDeals.toFixed(2)),
        databaseReactivationValue: Math.round(results.graveyardValue),
        combinedUpsideScenario: Math.round(results.combinedUpside),
        responseRiskBand: results.band.label,
      },
    };

    try {
      // Server-side function handles Resend / Sheet / Slack. NEVER call those services directly
      // from the browser — secrets must not ship in the bundle.
      const res = await fetch('/api/calculator-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.warn('[calculator] backend unavailable, captured locally', err, payload);
    }
    setSubmitState('success');
  };

  const R = results;

  return (
    <PageWrapper>
      <style>{`
        @media print {
          body { background: #fff !important; }
          nav, footer, .no-print, header, .btn-primary, .btn-secondary, button { display: none !important; }
          .container-page { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          #calc-results { display: block !important; border: none !important; padding: 0 !important; }
          .section-y { padding: 0 !important; }
          .print-header { display: block !important; margin-bottom: 32px; border-bottom: 2px solid var(--primary); padding-bottom: 16px; }
          .card { box-shadow: none !important; border: 1px solid var(--line) !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .print-header { display: none; }
      `}</style>

      <section className="no-print section-y-sm" style={{ background: '#fff' }}>
        <div className="container-page" style={{ maxWidth: 760 }}>
          <Eyebrow>Revenue calculator</Eyebrow>
          <h1 className="h-display-2" style={{ margin: '14px 0 16px' }}>
            How much revenue could faster first contact recover?
          </h1>
          <p className="lead-2">
            Every formula shown step by step. Every assumption conservative — this is a floor, not
            a ceiling. The real number is usually higher.
          </p>
        </div>
      </section>

      <Section borderTop background="surface">
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              padding: '18px 28px',
              borderBottom: '1px solid var(--line-strong)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--surface)',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>
              Recoverable revenue model
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)' }}>
              All inputs editable · runs locally · no signup
            </span>
          </div>

          <div style={{ padding: 'clamp(24px, 4vw, 36px)' }}>
            <div
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderLeft: '3px solid var(--warn)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                marginBottom: 24,
                fontSize: 13.5,
                color: '#92400E',
                lineHeight: 1.6,
              }}
            >
              <strong>Conservative by design.</strong> Every formula is shown step by step after
              you calculate. Every assumption tilts low. The real opportunity is almost always
              higher.
            </div>

            {/* C1 — How to read this number */}
            <div
              style={{
                background: 'var(--primary-pale)',
                border: '1px solid #C7BCF5',
                borderLeft: '3px solid var(--primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 16px',
                marginBottom: 24,
                fontSize: 13.5,
                color: '#3A2899',
                lineHeight: 1.7,
              }}
            >
              <strong>How to read this number.</strong> Your current close rate already reflects
              your current operation — including how fast you respond today. This calculator does
              not punish that number twice. Instead, it estimates the annual opportunity if faster,
              more consistent first contact lifts your close rate from your current baseline to a
              target scenario you control. If your target isn't higher than your current rate, the
              recoverable opportunity is $0 — and the response-time risk below still applies to the
              leads you're currently losing.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 24 }}>
              {[
                { label: 'Monthly inbound leads', value: leads, set: setLeads, prefix: null, hint: 'All new inquiries across all sources', required: true },
                { label: 'Avg commission per deal', value: commission, set: setCommission, prefix: '$', hint: 'Your average take-home per closed deal', required: true },
                { label: 'Annual ISA cost', value: isaCost, set: setIsaCost, prefix: '$', hint: 'Salary + benefits. Leave blank if none.', required: false },
                { label: 'Total CRM database size', value: crmSize, set: setCrmSize, prefix: null, hint: 'All historical leads ever captured', required: false },
              ].map((f, idx) => (
                <div key={idx}>
                  <label className="label-mono" style={{ marginBottom: 8 }}>
                    {f.label}
                    {f.required && <span style={{ color: 'var(--primary)', marginLeft: 4 }}>*</span>}
                  </label>
                  <div style={{ position: 'relative' }}>
                    {f.prefix && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 14,
                          color: 'var(--ink-dim)',
                        }}
                      >
                        {f.prefix}
                      </span>
                    )}
                    <input
                      type="number"
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      placeholder=""
                      style={{
                        width: '100%',
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-sm)',
                        padding: `12px 14px 12px ${f.prefix ? '28px' : '14px'}`,
                        fontSize: 15,
                        color: 'var(--ink)',
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--ink-dim)', marginTop: 6 }}>{f.hint}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 28 }}>
              <div>
                <label className="label-mono" style={{ marginBottom: 8 }}>
                  Current close rate <span style={{ color: 'var(--primary)' }}>*</span>
                </label>
                <input type="range" min="1" max="30" value={currentClose} onChange={(e) => setCurrentClose(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)' }}>1%</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{currentClose}%</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)' }}>30%</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--ink-dim)', textAlign: 'center', marginTop: 4 }}>What you close today, as-is</p>
              </div>
              <div>
                <label className="label-mono" style={{ marginBottom: 8 }}>
                  Target close rate — editable scenario <span style={{ color: 'var(--primary)' }}>*</span>
                </label>
                <input type="range" min="1" max="30" value={targetClose} onChange={(e) => setTargetClose(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)' }}>1%</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--ok)' }}>{targetClose}%</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)' }}>30%</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--ink-dim)', textAlign: 'center', marginTop: 4 }}>Achievable with faster, better first contact</p>
              </div>
              <div>
                <label className="label-mono" style={{ marginBottom: 8 }}>
                  Avg lead response time <span style={{ color: 'var(--primary)' }}>*</span>
                </label>
                <input type="range" min="1" max="480" value={responseTime} onChange={(e) => setResponseTime(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)' }}>&lt;1 min</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 18,
                      fontWeight: 700,
                      color: responseTime > 60 ? 'var(--risk)' : responseTime > 15 ? 'var(--warn)' : 'var(--ok)',
                    }}
                  >
                    {formatResp(parseInt(responseTime, 10))}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)' }}>8 hrs+</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--ink-dim)', textAlign: 'center', marginTop: 4 }}>
                  Risk signal only — not a revenue multiplier
                </p>
              </div>
            </div>

            <button type="button" onClick={calculate} className="btn-primary" style={{ width: '100%', padding: 16, fontSize: 16 }}>
              Calculate recoverable opportunity <ArrowRight size={16} />
            </button>
          </div>

          <AnimatePresence>
            {R && (
              <motion.div
                id="calc-results"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ borderTop: '2px solid var(--line-strong)', padding: 'clamp(24px, 4vw, 36px)', position: 'relative', overflow: 'hidden' }}
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
                  {/* Visible only when printing */}
                  <div className="print-header">
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>ORVN LABS</div>
                    <div style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>Official Revenue Audit Report</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-dim)', marginTop: 12 }}>
                      Generated for: {email || 'Anonymous Operator'} · {new Date().toLocaleDateString()}
                    </div>
                  </div>

                  {R.hasGap ? (
                    <div
                      style={{
                        background: 'var(--primary-pale)',
                        border: '1px solid #C7BCF5',
                        borderRadius: 'var(--radius-sm)',
                        padding: 32,
                        textAlign: 'center',
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          letterSpacing: '0.16em',
                          color: 'var(--primary)',
                          textTransform: 'uppercase',
                          marginBottom: 12,
                        }}
                      >
                        Estimated annual recoverable opportunity
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(48px, 8vw, 78px)',
                          color: 'var(--primary)',
                          lineHeight: 1,
                          marginBottom: 8,
                        }}
                      >
                        <AnimCounter target={R.recoverableYear} prefix="$" />
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--ink-mid)', margin: 0 }}>
                        Close-rate opportunity · math shown below · database reactivation shown separately
                      </p>

                      {/* Download Button */}
                      <div className="no-print" style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12 }}>
                        <button
                          onClick={handleDownloadPdf}
                          className="btn-secondary"
                          style={{ background: '#fff', fontSize: 13, padding: '10px 20px' }}
                        >
                          <Download size={14} /> Download PDF Report
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        borderLeft: '3px solid var(--primary)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 28,
                        marginBottom: 20,
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 10 }}>
                        Estimated annual recoverable opportunity · $0
                      </div>
                      <p style={{ fontSize: 14.5, color: 'var(--ink)', margin: 0, lineHeight: 1.7 }}>
                        Based on your inputs, there's no modeled close-rate gap to recover — your
                        target rate isn't higher than your current rate. Faster first contact still
                        reduces risk on the leads you're currently losing — see the response-time risk
                        below.
                      </p>
                      <div className="no-print" style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                        <button
                          onClick={handleDownloadPdf}
                          className="btn-secondary"
                          style={{ background: '#fff', fontSize: 13, padding: '10px 20px' }}
                        >
                          <Download size={14} /> Download PDF Report
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Response-time risk — qualitative band, no dollar figure */}
                  <div
                    style={{
                      background: R.band.bg,
                      border: `1px solid ${R.band.border}`,
                      borderLeft: `3px solid ${R.band.tone}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '16px 20px',
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: R.band.text, marginBottom: 6 }}>
                      Response-time risk
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
                      {formatResp(R.rt)} — {R.band.label}
                    </div>
                    <p style={{ fontSize: 13.5, color: 'var(--ink-mid)', margin: 0, lineHeight: 1.65 }}>
                      Faster first contact protects intent before it cools. The sub-5-minute window is
                      the ceiling most operations never reach — not because people aren't trying, but
                      because no human is on every inbound lead the moment it arrives.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                    {[
                      { label: 'Recoverable deals / month', value: Number(R.recoverableDeals.toFixed(1)), color: 'var(--ok)', sub: 'target − current close' },
                      { label: 'Recoverable revenue / month', value: Math.round(R.recoverableMonth), prefix: '$', color: 'var(--ok)', sub: 'close-rate opportunity' },
                      { label: 'Database reactivation', value: Math.round(R.graveyardValue), prefix: '$', color: 'var(--primary)', sub: 'separate · illustrative' },
                    ].map((c, i) => (
                      <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 18, textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-dim)', textTransform: 'uppercase', marginBottom: 8 }}>
                          {c.label}
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: c.color, lineHeight: 1, marginBottom: 4 }}>
                          <AnimCounter target={c.value} prefix={c.prefix || ''} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-dim)' }}>{c.sub}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 20, marginBottom: 20 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--warn)', textTransform: 'uppercase', marginBottom: 14 }}>
                      Step-by-step calculation
                    </div>
                    <MathRow label="Monthly leads" value={R.L} />
                    <MathRow label="Current close rate" value={pct(R.curCR)} />
                    <MathRow label="Target close rate (editable scenario)" value={pct(R.tgtCR)} color="var(--ok)" />
                    <MathRow label={`Current deals/month  (${R.L} × ${pct(R.curCR)})`} value={R.currentDeals.toFixed(1)} />
                    <MathRow label={`Target deals/month  (${R.L} × ${pct(R.tgtCR)})`} value={R.targetDeals.toFixed(1)} color="var(--ok)" />
                    <MathRow label="Recoverable deals/month  (target − current)" value={R.recoverableDeals.toFixed(1)} color="var(--ok)" />
                    <MathRow label={`Recoverable revenue/month  (${R.recoverableDeals.toFixed(1)} × ${fm(R.C)})`} value={fm(R.recoverableMonth)} color="var(--ok)" />
                    <MathRow label="Recoverable revenue/year  (× 12)" value={fm(R.recoverableYear)} color="var(--ok)" bold border={false} />
                    {!R.hasGap && (
                      <div style={{ marginTop: 10, fontSize: 12.5, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                        Guardrail: target ≤ current, so recoverable opportunity is set to $0.
                      </div>
                    )}
                  </div>

                  {R.CRM > 0 && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 20, marginBottom: 20 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Database reactivation — separate bucket
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--ink-dim)', margin: '0 0 12px', lineHeight: 1.6 }}>
                        Kept separate from the close-rate opportunity above. The re-engagement rate is
                        an editable, illustrative assumption — not research-backed.
                      </p>
                      <MathRow label={`Re-engageable leads  (${R.CRM.toLocaleString()} × ${pct(R.reRate)} illustrative)`} value={Math.round(R.reactivatable)} color="var(--primary)" />
                      <MathRow label={`Reactivation close rate  (${pct(R.curCR)} × 40% of current = 60% haircut)`} value={pct1(R.graveyardClose)} color="var(--primary)" />
                      <MathRow label={`Recoverable deals  (${Math.round(R.reactivatable)} × ${pct1(R.graveyardClose)})`} value={R.graveyardDeals.toFixed(1)} color="var(--primary)" />
                      <MathRow label={`Database reactivation value  (${R.graveyardDeals.toFixed(1)} × ${fm(R.C)})`} value={fm(R.graveyardValue)} color="var(--primary)" bold border={false} />
                    </div>
                  )}

                  {R.CRM > 0 && (R.recoverableYear > 0 || R.graveyardValue > 0) && (
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 18,
                        marginBottom: 20,
                      }}
                    >
                      <MathRow label="Recoverable revenue/year (close-rate opportunity)" value={fm(R.recoverableYear)} color="var(--ok)" />
                      <MathRow label="Database reactivation (illustrative)" value={fm(R.graveyardValue)} color="var(--primary)" />
                      <MathRow label="Combined upside scenario (revenue opportunity + database reactivation)" value={fm(R.combinedUpside)} color="var(--primary)" bold border={false} />
                    </div>
                  )}

                  {/* Assumptions note */}
                  <div
                    style={{
                      background: 'var(--surface)',
                      border: '1px dashed #C7BCF5',
                      borderRadius: 'var(--radius-sm)',
                      padding: '14px 18px',
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 8 }}>
                      Assumptions in this model
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--ink-mid)', lineHeight: 1.7 }}>
                      <li>Recoverable opportunity = (target − current close rate) × leads × commission. Close rate is never penalized twice.</li>
                      <li>Response time is a qualitative risk signal only — it does not multiply any dollar figure.</li>
                      <li>Database reactivation uses an editable {pct(R.reRate)} re-engagement assumption and a reactivation close rate of 40% of your current rate. Both are illustrative, not research-backed.</li>
                      {R.crmFallback ? <li>CRM size was left blank, so it's estimated at ~24 months of your monthly lead volume.</li> : null}
                      {R.ISA > 0 && <li>ISA coverage assumes ~{R.isaHoursWeek} hrs/week ({R.isaAnnualHours.toLocaleString()} hrs/year) against 24/7 ({R.pasAnnualHours.toLocaleString()} hrs/year).</li>}
                    </ul>
                  </div>

                  <div
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      borderLeft: '3px solid var(--primary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '18px 20px',
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 10 }}>
                      ORVN analysis
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ink)', margin: 0 }}>{R.insight}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAudit((o) => !o);
                      setTimeout(() => document.getElementById('full-audit')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
                    }}
                    className="btn-secondary"
                    style={{ width: '100%', marginBottom: 16 }}
                  >
                    {showAudit ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {showAudit ? 'Hide' : 'View'} full personalised audit report
                  </button>

                  <AnimatePresence>
                    {showAudit && (
                      <motion.div
                        id="full-audit"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        style={{ marginBottom: 20 }}
                      >
                        <div style={{ background: 'var(--primary-pale)', border: '1px solid #C7BCF5', borderRadius: 'var(--radius-sm)', padding: 22, marginBottom: 14 }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 8 }}>
                            ORVN — Full revenue audit
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', marginBottom: 4 }}>Revenue Audit Report</div>
                          <div style={{ fontSize: 12, color: 'var(--ink-mid)', marginBottom: 12 }}>
                            Prepared {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                            {[
                              ['Leads/mo', R.L],
                              ['Commission', fm(R.C)],
                              ['Current close', pct(R.curCR)],
                              ['Target close', pct(R.tgtCR)],
                              ['Response time', formatResp(R.rt)],
                              ...(R.CRM > 0 ? [['CRM size', R.CRM.toLocaleString()]] : []),
                            ].map(([k, v]) => (
                              <div key={k} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)' }}>{k}:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <AuditPanel number="1" title="Close-rate opportunity analysis">
                          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderLeft: '3px solid var(--ok)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 16, fontSize: 13.5, color: '#065F46' }}>
                            <strong>Finding:</strong> Lifting your close rate from <strong>{pct(R.curCR)}</strong> to a target of <strong>{pct(R.tgtCR)}</strong> models <strong>{R.recoverableDeals.toFixed(1)} additional deals/month</strong>. {R.hasGap ? '' : 'Your target is not above your current rate, so the modeled opportunity is $0.'}
                          </div>
                          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 16 }}>
                            <div style={{ overflowX: 'auto' }}>
                              <TblRow header cols={[{ text: 'Metric' }, { text: 'Current' }, { text: 'Target scenario' }, { text: 'Gap' }]} />
                              <TblRow cols={[{ text: 'Close rate' }, { text: pct(R.curCR) }, { text: pct(R.tgtCR), color: 'var(--ok)' }, { text: R.hasGap ? `+${pct(R.tgtCR - R.curCR)}` : '0%', color: R.hasGap ? 'var(--ok)' : 'var(--ink-dim)' }]} />
                              <TblRow cols={[{ text: 'Deals/month' }, { text: R.currentDeals.toFixed(1) }, { text: R.targetDeals.toFixed(1), color: 'var(--ok)' }, { text: `+${R.recoverableDeals.toFixed(1)}`, color: 'var(--ok)' }]} />
                            </div>
                          </div>
                          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-sm)', padding: 20, textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--ok)', lineHeight: 1, marginBottom: 6 }}>{fm(R.recoverableYear)}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-dim)', textTransform: 'uppercase' }}>
                              Annual recoverable revenue opportunity
                            </div>
                          </div>
                        </AuditPanel>

                        <AuditPanel number="2" title="Response-time risk (qualitative)">
                          <div style={{ background: R.band.bg, border: `1px solid ${R.band.border}`, borderLeft: `3px solid ${R.band.tone}`, borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: 13.5, color: R.band.text }}>
                            <strong>Finding:</strong> Your response time of <strong>{formatResp(R.rt)}</strong> falls in the <strong>{R.band.label}</strong> band.
                          </div>
                          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {[
                              ['Under 5 minutes', 'Target zone'],
                              ['5–15 minutes', 'Early leakage risk'],
                              ['15–60 minutes', 'Meaningful delay'],
                              ['1–4 hours', 'High delay'],
                              ['4+ hours', 'Severe delay'],
                            ].map(([range, label]) => (
                              <div key={range} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--line-strong)' }}>
                                <span style={{ color: 'var(--ink-mid)' }}>{range}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: label === R.band.label ? R.band.tone : 'var(--ink-dim)', fontWeight: label === R.band.label ? 700 : 400 }}>{label}</span>
                              </div>
                            ))}
                          </div>
                          <p style={{ fontSize: 12.5, color: 'var(--ink-dim)', margin: '12px 0 0', lineHeight: 1.65 }}>
                            Response time is a risk signal, not a revenue multiplier. There is no
                            sourced response-time→conversion distribution behind a dollar figure, so we
                            don't invent one.
                          </p>
                        </AuditPanel>

                        {R.CRM > 0 && (
                          <AuditPanel number="3" title="Database reactivation (illustrative)">
                            <div style={{ background: 'var(--primary-pale)', border: '1px solid #C7BCF5', borderLeft: '3px solid var(--primary)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 16, fontSize: 13.5, color: '#3A2899' }}>
                              <strong>Finding:</strong> Your database of <strong>{R.CRM.toLocaleString()} leads</strong> may hold recoverable revenue. The figures below use editable, illustrative assumptions — not research-backed rates.
                            </div>
                            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 16 }}>
                              <div style={{ overflowX: 'auto' }}>
                                <TblRow header cols={[{ text: 'Component' }, { text: 'Value' }, { text: 'Formula' }, { text: 'Basis' }]} />
                                <TblRow cols={[{ text: 'CRM database' }, { text: `${R.CRM.toLocaleString()} leads` }, { text: 'Your input' }, { text: '—' }]} />
                                <TblRow cols={[{ text: 'Re-engagement rate' }, { text: pct(R.reRate) }, { text: `CRM × ${pct(R.reRate)}` }, { text: 'Illustrative' }]} />
                                <TblRow cols={[{ text: 'Re-engageable leads' }, { text: `${Math.round(R.reactivatable)} leads`, color: 'var(--primary)' }, { text: '' }, { text: '' }]} />
                                <TblRow cols={[{ text: 'Reactivation close rate' }, { text: pct1(R.graveyardClose) }, { text: `${pct(R.curCR)} × 40% of current` }, { text: 'Conservative' }]} />
                                <TblRow cols={[{ text: 'Recoverable deals' }, { text: `${R.graveyardDeals.toFixed(1)} deals`, color: 'var(--primary)' }, { text: '' }, { text: '' }]} />
                              </div>
                            </div>
                            <div style={{ background: 'var(--primary-pale)', border: '1px solid #C7BCF5', borderRadius: 'var(--radius-sm)', padding: 20, textAlign: 'center' }}>
                              <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--primary)', lineHeight: 1, marginBottom: 6 }}>{fm(R.graveyardValue)}</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--ink-dim)', textTransform: 'uppercase' }}>
                                Illustrative database reactivation value
                              </div>
                            </div>
                          </AuditPanel>
                        )}

                        {R.ISA > 0 && (
                          <AuditPanel number={R.CRM > 0 ? '4' : '3'} title="ISA coverage & cost context">
                            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                              <div style={{ overflowX: 'auto' }}>
                                <TblRow header cols={[{ text: 'Component' }, { text: 'Human ISA' }, { text: 'PAS' }, { text: 'Note' }]} />
                                <TblRow cols={[{ text: 'Annual cost' }, { text: `${fm(R.ISA)}/yr`, color: 'var(--risk)' }, { text: 'Custom early-access quote' }, { text: 'Your input' }]} />
                                <TblRow cols={[{ text: 'Coverage' }, { text: `~${R.isaHoursWeek} hrs/wk (${R.isaAnnualHours.toLocaleString()} hrs/yr)` }, { text: `24/7/365 (${R.pasAnnualHours.toLocaleString()} hrs/yr)`, color: 'var(--ok)' }, { text: `+${R.coverageGap.toLocaleString()} hrs/yr`, bold: true }]} />
                                <TblRow cols={[{ text: 'Response time' }, { text: 'Varies by rep & shift', color: 'var(--risk)' }, { text: 'Consistent, every channel', color: 'var(--ok)' }, { text: 'Structural' }]} />
                                <TblRow cols={[{ text: 'Turnover risk' }, { text: 'Typically high-turnover', color: 'var(--risk)' }, { text: 'Infrastructure', color: 'var(--ok)' }, { text: 'No re-hire cost' }]} />
                              </div>
                            </div>
                            <p style={{ fontSize: 12.5, color: 'var(--ink-dim)', margin: '12px 0 0', lineHeight: 1.65 }}>
                              Revenue opportunity and operating-cost savings are different buckets — they
                              are not added together. PAS early-access pricing is quoted per brokerage,
                              so no PAS price is asserted here.
                            </p>
                          </AuditPanel>
                        )}

                        <AuditPanel number={[R.CRM > 0, R.ISA > 0].filter(Boolean).length + 3} title="Summary — opportunity by bucket">
                          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                              <TblRow header cols={[{ text: 'Bucket' }, { text: 'Annual value' }, { text: 'Confidence' }, { text: '' }]} />
                              <TblRow cols={[{ text: 'Recoverable revenue (close-rate opportunity)' }, { text: fm(R.recoverableYear), color: 'var(--ok)', bold: true }, { text: 'Your target scenario' }, { text: '' }]} />
                              {R.CRM > 0 && <TblRow cols={[{ text: 'Database reactivation (illustrative)' }, { text: fm(R.graveyardValue), color: 'var(--primary)', bold: true }, { text: 'Illustrative assumptions' }, { text: '' }]} />}
                              {R.CRM > 0 && (
                                <div style={{ background: 'var(--primary-pale)', borderTop: '2px solid #C7BCF5' }}>
                                  <TblRow cols={[{ text: 'Combined upside scenario', bold: true }, { text: fm(R.combinedUpside), color: 'var(--primary)', bold: true }, { text: 'Revenue + reactivation' }, { text: '' }]} />
                                </div>
                              )}
                              {R.ISA > 0 && <TblRow cols={[{ text: 'ISA cost (separate — operating cost, not revenue)' }, { text: `${fm(R.ISA)}/yr` }, { text: 'Context only' }, { text: '' }]} />}
                            </div>
                          </div>

                          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                              { n: 1, text: 'This week: stand up a sub-5-minute response mechanism for every inbound channel — the highest-leverage move on response-time risk.' },
                              { n: 2, text: R.CRM > 0 ? `This week: run a re-engagement pass on your database. The ${fm(R.graveyardValue)} above is illustrative — treat it as a hypothesis to test, not a promise.` : 'This week: capture your CRM database size to model database reactivation as a separate bucket.' },
                              { n: 3, text: 'This month: run the Lead Leakage Scorecard to identify the single bottleneck with the highest payoff.' },
                            ].map((s) => (
                              <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                  {s.n}
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.65, margin: 0 }}>{s.text}</p>
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <Link to="/calculators/leakage" className="btn-secondary">Run Lead Leakage Scorecard</Link>
                          </div>
                        </AuditPanel>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 28,
                      marginTop: 8,
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--ink)', margin: '0 0 6px' }}>
                          Email me the full audit report.
                        </h3>
                        <p style={{ fontSize: 13.5, color: 'var(--ink-mid)', margin: 0, lineHeight: 1.6 }}>
                          A copy of these numbers, the math, and a one-page diagnosis you can share
                          with your team. No spam.
                        </p>
                      </div>
                      {submitState === 'success' ? (
                        <div
                          style={{
                            background: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            borderRadius: 'var(--radius-sm)',
                            padding: 16,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            color: '#065F46',
                            fontSize: 14,
                          }}
                        >
                          <CheckCircle2 size={18} /> Full audit sent. Download your PDF above or check your inbox.
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
                              borderRadius: 'var(--radius-sm)',
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
                    <p style={{ fontSize: 12, color: 'var(--ink-dim)', marginTop: 12, width: '100%', textAlign: 'center' }}>
                      Check your spam folder if you don't see the report in 5 minutes.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>
    </PageWrapper>
  );
}
