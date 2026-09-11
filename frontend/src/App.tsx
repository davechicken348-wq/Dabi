import { Outlet, useLocation } from 'react-router-dom';
import { MarketingNavbar } from './marketing/components/MarketingNavbar/MarketingNavbar';
import { MarketingFooter } from './marketing/components/MarketingFooter/MarketingFooter';

function MarketingLayout() {
  return (
    <>
      <MarketingNavbar />
      <main>
        <Outlet />
      </main>
      <MarketingFooter />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isMarketing = !location.pathname.startsWith('/findroom') && !location.pathname.startsWith('/admin') && location.pathname !== '/';

  if (isMarketing) {
    return <MarketingLayout />;
  }

  return <Outlet />;
}
