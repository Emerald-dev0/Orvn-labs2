import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';

import Hero from '../components/home/Hero';
import Bridge from '../components/home/Bridge';
import FeatureSplit from '../components/home/FeatureSplit';
import Portfolio from '../components/home/Portfolio';
import Showcase from '../components/home/Showcase';
import Steps from '../components/home/Steps';
import Roles from '../components/home/Roles';
import Trust from '../components/home/Trust';
import Company from '../components/home/Company';
import Faq from '../components/home/Faq';
import Cta from '../components/home/Cta';
import { SiteEditorMock, VoiceMock, StatsMock } from '../components/home/mocks';

export default function Home() {
  useDocumentMeta({
    title: 'Professional websites and property deal pages',
    description:
      'LAREI is being built for wholesalers, agents, investors and real-estate operators who want one professional home for their brand, property portfolio and deal presentations.',
    path: '/',
  });

  return (
    <PageWrapper>
      <Hero />
      <Bridge />

      <FeatureSplit
        id="professional-presence"
        eyebrow="Your professional presence"
        title="One address for your business. A clear view of your work."
        body="Give people a direct destination to learn who you are, what markets you serve, how to contact you and which properties or projects you choose to show. Start with your details, review an AI-assisted page draft and make the site your own within a focused design system."
        note="My Website · Edit profile · Preview · Publish site · Copy public link"
        media={<SiteEditorMock />}
      />

      <Portfolio />

      <Showcase />

      <FeatureSplit
        eyebrow="Your voice, not a generic template"
        title="Make your materials sound like your business."
        body="Bring in approved business context and examples of how you communicate. Shape the tone, vocabulary and audience of your content without changing the underlying facts. You choose what the AI remembers for future drafts."
        media={<VoiceMock />}
        reverse
      />

      <FeatureSplit
        eyebrow="Observable activity"
        title="Know what was viewed and what prompted a response."
        body="See engagement on published professional and property pages, tracked clicks and buyer inquiries in one workspace. Understand which opportunities are receiving attention without guessing who an anonymous visitor is."
        media={<StatsMock />}
      />

      <Steps />
      <Roles />
      <Trust />
      <Company />
      <Faq />
      <Cta />
    </PageWrapper>
  );
}
