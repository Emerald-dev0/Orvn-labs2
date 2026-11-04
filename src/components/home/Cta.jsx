import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

export default function Cta() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail('');
  };

  return (
    <section className="cta-home">
      <div className="shell">
        <div className="cta-frame">
          <img src="/images/interior-1.jpg" alt="" className="cta-photo" loading="lazy" />
          <div className="cta-scrim" aria-hidden="true" />

          <div className="cta-card glass">
            <h2 className="cta-title">Start with one property.</h2>
            <p className="cta-body">
              Put a listing you already know into LAREI and see whether the page is worth sending.
              If it is not, tell us why and we will fix it.
            </p>

            {sent ? (
              <p className="cta-sent">
                <Check size={17} strokeWidth={2.6} />
                Thanks. We will email you when your access is ready.
              </p>
            ) : (
              <form className="cta-form" onSubmit={submit}>
                <input
                  type="email"
                  className="cta-input"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Your email address"
                  required
                />
                <button type="submit" className="btn btn-lime cta-submit">
                  Request access
                  <ArrowRight strokeWidth={2.2} />
                </button>
              </form>
            )}

            <p className="cta-note">
              Or <Link to="/contact">talk to a person</Link> first. Either is fine.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
