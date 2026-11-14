"use client";

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
    title: 'ORREI by ORVN Labs | Property records, deal sheets and pages',
    description:
      'ORREI, from ORVN Labs, turns property details into presentations you can share: organise a property, prepare an editable deal sheet and publish a professional page linked to your profile.',
    path: '/',
  });

  return (
    <PageWrapper>
      <Hero />
      <Bridge />

      <Showcase />

      <Steps />

      <FeatureSplit
        id="professional-presence"
        eyebrow="Your profile"
        title="The property page hangs off a profile you control."
        body="A published property is not a one-off link. It sits against your name, markets and contact details, so a buyer who opens it knows who is behind it. The profile is edited with structured controls and reviewed before it goes public."
        note="Profile · Markets · Contact details · Preview · Publish"
        media={<SiteEditorMock />}
      />

      <Portfolio />

      <FeatureSplit
        eyebrow="Your voice, not a generic template"
        title="Make your materials sound like your business."
        body="Set the tone and wording you prefer for property descriptions. ORREI is designed to draft from the details you approve, without making up missing information. Business-context memory is planned, not shipped."
        media={<VoiceMock />}
        reverse
      />

      <FeatureSplit
        eyebrow="Activity"
        title="Views and inquiries, kept separate from guesswork."
        body="The first release records that a published page was opened and stores the inquiries people choose to send. It does not identify visitors, and it does not estimate how many of them were real buyers. Reporting beyond that is planned, not shipped."
        media={<StatsMock />}
      />
      <Roles />
      <Trust />
      <Company />
      <Faq />
      <Cta />
    </PageWrapper>
  );
}
