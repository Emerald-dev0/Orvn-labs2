import NotFound from '../src/views/NotFound';

export const metadata = {
  title: 'Page not found',
  description: 'That page does not exist. Here is the way back.',
};

export default function NotFoundRoute() {
  return <NotFound />;
}
