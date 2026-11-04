import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import SmoothScroll from './components/SmoothScroll';
import Nav from './components/site/Nav';
import Footer from './components/site/Footer';
import Cursor from './components/site/Cursor';
import Intro from './components/site/Intro';
import ScrollToTop from './components/ScrollToTop';

const Home = lazy(() => import('./pages/Home'));
const Product = lazy(() => import('./pages/Product'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const WhoItsFor = lazy(() => import('./pages/WhoItsFor'));
const EarlyAccess = lazy(() => import('./pages/EarlyAccess'));
const Contact = lazy(() => import('./pages/Contact'));
const SignIn = lazy(() => import('./pages/SignIn'));
const PAS = lazy(() => import('./pages/PAS'));
// import Thesis from './pages/Thesis';
const RevenueCalculator = lazy(() => import('./pages/RevenueCalculator'));
const LeakageScorecard = lazy(() => import('./pages/LeakageScorecard'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const FAQ = lazy(() => import('./pages/FAQ'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const BlogDashboard = lazy(() => import('./pages/admin/BlogDashboard'));
const BlogEditor = lazy(() => import('./pages/admin/BlogEditor'));
const BlogCategories = lazy(() => import('./pages/admin/BlogCategories'));
const BlogTags = lazy(() => import('./pages/admin/BlogTags'));
const BlogSettings = lazy(() => import('./pages/admin/BlogSettings'));
const BlogAuthors = lazy(() => import('./pages/admin/BlogAuthors'));
const BlogComments = lazy(() => import('./pages/admin/BlogComments'));
const BlogSubscribers = lazy(() => import('./pages/admin/BlogSubscribers'));
// import Login from './pages/Login';
const NotFound = lazy(() => import('./pages/NotFound'));

const Privacy = lazy(() => import('./pages/legal/Privacy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const AIDisclosure = lazy(() => import('./pages/legal/AIDisclosure'));
const DataRetention = lazy(() => import('./pages/legal/DataRetention'));
const AcceptableUse = lazy(() => import('./pages/legal/AcceptableUse'));
const FairHousing = lazy(() => import('./pages/legal/FairHousing'));

function AnimatedRoutes() {
  const location = useLocation();

  // Handle anchor navigation
  React.useEffect(() => {
    const anchors = {
      '/calculate': 'calculate',
      '/pricing': 'pricing',
    };

    const targetId = anchors[location.pathname];
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/pas" element={<PAS />} />
        {/* <Route path="/thesis" element={<Thesis />} /> */}

        {/* Anchor Navigation Redirects to Home */}
        <Route path="/calculate" element={<Home />} />
        <Route path="/pricing" element={<Home />} />

        <Route path="/calculators/revenue" element={<RevenueCalculator />} />
        <Route path="/calculators/leakage" element={<LeakageScorecard />} />

        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        <Route path="/faq" element={<FAQ />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/blog" element={<BlogDashboard />} />
        <Route path="/admin/blog/categories" element={<BlogCategories />} />
        <Route path="/admin/blog/tags" element={<BlogTags />} />
        <Route path="/admin/blog/settings" element={<BlogSettings />} />
        <Route path="/admin/blog/authors" element={<BlogAuthors />} />
        <Route path="/admin/blog/comments" element={<BlogComments />} />
        <Route path="/admin/blog/subscribers" element={<BlogSubscribers />} />
        <Route path="/admin/blog/create" element={<BlogEditor />} />
        <Route path="/admin/blog/edit/:slug" element={<BlogEditor />} />

        {/* <Route path="/login" element={<Login />} /> */}

        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/ai-disclosure" element={<AIDisclosure />} />
        <Route path="/legal/data-retention" element={<DataRetention />} />
        <Route path="/legal/acceptable-use" element={<AcceptableUse />} />
        <Route path="/legal/fair-housing" element={<FairHousing />} />

        {/* Short URLs — kept aliases of the canonical longer paths so links shared
            externally (e.g. /scorecard, /test) resolve correctly. Canonical URLs in the
            sitemap and SEO meta still point at /calculators/leakage, /demo, /legal/*. */}
        <Route path="/scorecard" element={<Navigate to="/calculators/leakage" replace />} />
        <Route path="/lead-leakage-scorecard" element={<Navigate to="/calculators/leakage" replace />} />
        <Route path="/test" element={<Navigate to="/pas" replace />} />
        <Route path="/test-pas" element={<Navigate to="/pas" replace />} />
        <Route path="/resources" element={<Blog />} />
        <Route path="/newsletter" element={<Navigate to="/blog" replace />} />
        <Route path="/privacy" element={<Navigate to="/legal/privacy" replace />} />
        <Route path="/terms" element={<Navigate to="/legal/terms" replace />} />
        <Route path="/ai-call-disclosure" element={<Navigate to="/legal/ai-disclosure" replace />} />
        <Route path="/fair-housing" element={<Navigate to="/legal/fair-housing" replace />} />

        <Route path="/product" element={<Product />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/who-its-for" element={<WhoItsFor />} />
        <Route path="/early-access" element={<EarlyAccess />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/sign-in" element={<SignIn />} />
        {/* Legacy routes from the previous site — redirect rather than break inbound links. */}
        <Route path="/why-orvn" element={<Navigate to="/" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <Intro />
        <Cursor />
        <ScrollToTop />
        <Nav />
        <AnimatedRoutes />
        <Footer />
      </SmoothScroll>
    </BrowserRouter>
  );
}
