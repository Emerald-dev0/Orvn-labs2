import React from 'react';
import { Reveal } from '../site/Reveal';
import { FileText, Printer, Sheet, Send } from 'lucide-react';

const OUTPUTS = [
  {
    icon: FileText,
    title: 'Property page',
    body: 'A public listing page with your photography, the facts you approved and an enquiry button that reaches you directly.',
    tag: 'On the web',
  },
  {
    icon: Sheet,
    title: 'Deal sheet',
    body: 'A clean one-page summary for the buyer, the bank or the developer. Every figure pulled from the same record.',
    tag: 'PDF',
  },
  {
    icon: Send,
    title: 'Buyer summary',
    body: 'A short, forwardable overview for people who are not going to read a twelve-page brochure.',
    tag: 'Link',
  },
  {
    icon: Printer,
    title: 'Print sheet',
    body: 'A print-ready sheet for the site office and the Saturday inspection, laid out so nothing is cut off.',
    tag: 'A4',
  },
];

export default function Outputs() {
  return (
    <section className="outputs section-y">
      <div className="shell">
        <div className="outputs-head">
          <Reveal>
            <h2 className="h-display outputs-title">
              One record, four things to <span className="em">send</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="lead">
              Most property marketing is the same facts typed out five times, in five places, until
              one of them is wrong. LAREI keeps a single source and produces the versions you need
              from it.
            </p>
          </Reveal>
        </div>

        <div className="outputs-grid">
          {OUTPUTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={0.06 * i} className="output-card">
                <div className="output-card-top">
                  <span className="output-icon">
                    <Icon size={20} strokeWidth={1.9} />
                  </span>
                  <span className="pill">{item.tag}</span>
                </div>
                <h3 className="output-card-title">{item.title}</h3>
                <p className="output-card-body">{item.body}</p>
                <div className="output-card-preview" aria-hidden="true">
                  <span className="preview-line w-90" />
                  <span className="preview-line w-70" />
                  <span className="preview-line w-80" />
                  <span className="preview-line w-50" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
