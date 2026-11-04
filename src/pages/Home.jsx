import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';

import Hero from '../components/home/Hero';
import Outputs from '../components/home/Outputs';
import Showcase from '../components/home/Showcase';
import Gallery from '../components/home/Gallery';
import Steps from '../components/home/Steps';
import Verify from '../components/home/Verify';
import Audience from '../components/home/Audience';
import Access from '../components/home/Access';
import Faq from '../components/home/Faq';
import Cta from '../components/home/Cta';

export default function Home() {
  useDocumentMeta({
    title: 'One property record, every way to present it',
    description:
      'LAREI keeps one verified record for each property and publishes it as a property page, a deal sheet, a buyer summary and a print sheet. Private beta, open by application.',
    path: '/',
  });

  return (
    <PageWrapper>
      <Hero />
      <Outputs />
      <Showcase />
      <Gallery />
      <Steps />
      <Verify />
      <Audience />
      <Access />
      <Faq />
      <Cta />
    </PageWrapper>
  );
}
