import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlArrowDown, SlArrowRight } from 'react-icons/sl';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';

const FAQS = [
  { q: 'What is ORVN Labs?', a: 'ORVN Labs is a real-estate technology business developing LAREI, a platform for professional websites, property presentations and the work required to prepare and publish them.' },
  { q: 'What is LAREI?', a: 'LAREI is the provisional name of our product for real-estate professionals. It is being designed to connect a branded public profile, selected property portfolio, AI-assisted property records, shareable property pages and engagement insights.' },
  { q: 'Who is LAREI for?', a: 'The initial focus is on wholesalers, real-estate agents, investors and acquisitions/dispositions operators who regularly present property or business information to others.' },
  { q: 'Do I get my own website?', a: 'That is part of the planned beta experience. Approved users will be able to prepare a professional public page using their business profile and selected portfolio content. The supported URL format will be confirmed during the beta.' },
  { q: 'Can every deal have its own page?', a: 'The planned core workflow provides an individual published property page connected to the user\u2019s professional identity. Each page has its own shareable URL and an inquiry route.' },
  { q: 'Can I use my own domain?', a: 'Custom-domain support is being evaluated for a later phase and should not be assumed in the first private beta.' },
  { q: 'Does AI build the entire website for me?', a: 'LAREI is designed to draft copy and arrange a focused professional page using approved information. Users review the facts, control public sections and publish intentionally. It is not intended to be an unrestricted website builder.' },
  { q: 'Can I import my ChatGPT information?', a: 'The intended first approach is to paste relevant context or upload a prepared business summary or writing samples. Automatic access to an external AI account is not part of the confirmed initial scope.' },
  { q: 'Will the AI learn how I write?', a: 'Users are intended to be able to save reviewed style preferences and business context for more consistent generated writing. Those preferences should remain visible, editable and private to the relevant workspace.' },
  { q: 'Does LAREI verify property values or create an ARV?', a: 'No authoritative appraisal, automated underwriting or independently verified ARV is included in the initial scope. Professionals remain responsible for checking all material investment assumptions.' },
  { q: 'Does the map show exact parcel boundaries?', a: 'Not in the initial release. Basic location mapping or a map link is planned. Parcel GIS and surveyed/legal boundary interpretations are separate future work.' },
  { q: 'Can I hide my address or documents?', a: 'The planned publication process provides user control over what becomes public. The implemented settings and supported privacy options will be explained in the beta.' },
  { q: 'Can I market other people\u2019s properties?', a: 'Users must have the legal authority and necessary permissions to publish property information and imagery, including any agent/brokerage disclosures required in their market. LAREI does not establish that authority for them.' },
  { q: 'Does LAREI automatically find buyers or send campaigns?', a: 'No buyer-finding guarantee or mass distribution is part of the first release. It is designed to make approved property pages easy to share and inquiries easy to receive.' },
  { q: 'Can I see exactly who clicks my link?', a: 'Analytics can show measurable page activity and tracked clicks. They do not automatically reveal the identity of anonymous visitors. Identifying contact information is collected only when visitors choose to submit it.' },
  { q: 'Is LAREI a CRM?', a: 'No. The initial scope emphasizes presentation, publication and basic inquiry visibility rather than a full lead management, transaction or contract system.' },
  { q: 'Can I use LAREI if I\u2019m not a wholesaler?', a: 'Yes. The proposed workflow is designed to adapt core presentation features for agents, investors and real-estate operators, with appropriate content choices and disclosures.' },
  { q: 'Is it available now?', a: 'LAREI is being developed for a controlled private beta. Public sign-up may not yet be available. Interested professionals can request early access; approval is not guaranteed.' },
  { q: 'How much does LAREI cost?', a: 'Pricing has not been announced. Any pricing, plan limits and beta terms will be communicated before a paid commitment is requested.' },
  { q: 'How can I contact ORVN Labs?', a: 'Use the contact page or hello@orvnlabs.com if the address remains the confirmed support inbox. We respond to relevant product and early-access questions.' },
];

export default function FAQ() {
  useDocumentMeta({ title: 'FAQ \u00b7 ORVN Labs', description: 'Accuracy, access, map, privacy and scope objections.', path: '/faq' });
  const [open, setOpen] = useState(null);
  return (
    <PageWrapper>
      <section className="section-y" style={{ background: 'var(--background)' }}>
        <div className="container-page">
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <span className="eyebrow" style={{ marginBottom: 16 }}>FAQ</span>
            <h1 className="h-display" style={{ fontSize: 'clamp(36px, 5.5vw, 60px)', marginBottom: 16 }}>Questions, answered plainly.</h1>
            <p className="lead">Accuracy, access, map, privacy and scope objections.</p>
          </div>
          <div style={{ maxWidth: 820 }}>
            {FAQS.map((f, i) => (
              <div key={f.q} style={{ borderBottom: '1px solid var(--line)' }}>
                <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', textAlign: 'left', padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>{f.q}</span>
                  <SlArrowDown size={18} color="var(--ink-mid)" style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }} />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <p className="lead" style={{ fontSize: 16, paddingBottom: 22 }}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40 }}>
            <Link to="/early-access" className="btn-primary">Request early access</Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
