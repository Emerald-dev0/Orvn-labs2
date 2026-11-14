import Product from '../../../src/views/Product';

export const metadata = {
  alternates: { canonical: '/product' },
  title: 'ORREI',
  description: 'The workspace behind the page: professional websites, property portfolios, AI-assisted drafts and published property pages.',
};

export default function Page() {
  return <Product />;
}
