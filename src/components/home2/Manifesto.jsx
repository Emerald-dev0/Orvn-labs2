import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ChapterHead from '../site/ChapterHead';
import { ScrollHighlight, Reveal } from '../site/Reveal';

export default function Manifesto() {
  return (
    <section className="section-y manifesto" id="problem">
      <div className="shell">
        <ChapterHead
          index="01 / The problem"
          label="Why the work is harder than it looks"
          title={['Every property gets', <>explained <span className="em">three times.</span></>]}
          note="A listing, a deck, a message to a buyer. The same facts, re-typed, re-checked, slowly drifting apart."
        />

        <div className="manifesto-grid">
          <ScrollHighlight
            className="manifesto-quote"
            text="Most property work is not presentation. It is re-typing the same facts into a different shape — and hoping the version you send is still the version that is true."
          />

          <div>
            <Reveal>
              <div className="contrast-block">
                <div className="contrast-head">
                  <h3>The folder</h3>
                  <span className="label-mono">Before</span>
                </div>
                <ul className="contrast-list">
                  <li className="strike">Photos in a chat thread</li>
                  <li className="strike">A PDF emailed last month</li>
                  <li className="strike">Price changed on a call</li>
                  <li className="strike">Three versions of the same address</li>
                  <li className="strike">A deck rebuilt for every buyer</li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="contrast-block is-good">
                <div className="contrast-head">
                  <h3>The record</h3>
                  <span className="label-mono-primary">With LAREI</span>
                </div>
                <ul className="contrast-list">
                  <li>One property record, checked once</li>
                  <li>Page, sheet and summary generated from it</li>
                  <li>Conflicts marked before anything publishes</li>
                  <li>A single link that carries the deal</li>
                  <li>Changes update every output at once</li>
                </ul>
                <div style={{ marginTop: 24 }}>
                  <Link to="/how-it-works" className="arrow-link">
                    How the record is built
                    <ArrowRight size={15} strokeWidth={1.6} />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
