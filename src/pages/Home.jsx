import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';

import Hero from '../components/home2/Hero';
import Band from '../components/home2/Band';
import Manifesto from '../components/home2/Manifesto';
import Stage from '../components/home2/Stage';
import Contents from '../components/home2/Contents';
import Gallery from '../components/home2/Gallery';
import Sheet from '../components/home2/Sheet';
import Compare from '../components/home2/Compare';
import Numbers from '../components/home2/Numbers';
import Principles from '../components/home2/Principles';
import Access from '../components/home2/Access';
import FaqTeaser from '../components/home2/FaqTeaser';
import ClosingCTA from '../components/home2/ClosingCTA';

export default function Home() {
  useDocumentMeta({
    title: 'A better place to be seen',
    description:
      'LAREI is one professional home for your brand, your property portfolio and every deal you present. One verified record behind every page, deal sheet and summary you publish.',
    path: '/',
  });

  return (
    <PageWrapper>
      <Hero />
      <Band />
      <Manifesto />
      <Stage />
      <Contents />
      <Gallery />
      <Sheet />
      <Compare />
      <Numbers />
      <Principles />
      <Access />
      <FaqTeaser />
      <ClosingCTA />
    </PageWrapper>
  );
}
