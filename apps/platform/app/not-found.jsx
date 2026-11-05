import NotFound from '../src/views/NotFound';

export const metadata = {
  title: 'Not on the register',
  description:
    'That address is not listed here. Search every page, or go back to the beginning.',
  robots: { index: false, follow: true },
};

export default function NotFoundRoute() {
  return <NotFound />;
}
