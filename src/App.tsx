import { useEffect, useState } from 'react';
import { AdminPortal } from './components/admin/AdminPortal';
import { FieldMobileApp } from './components/app/FieldMobileApp';
import { PublicShowcase } from './components/PublicShowcase';

type AppRoute = 'public' | 'admin' | 'app';

function resolveRoute(pathname: string): AppRoute {
  const normalized = pathname.replace(/\/+$/, '');
  if (normalized === '/admin' || normalized.endsWith('/admin')) return 'admin';
  if (normalized === '/app' || normalized.endsWith('/app')) return 'app';
  return 'public';
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => {
    if (typeof window === 'undefined') return 'public';
    return resolveRoute(window.location.pathname);
  });

  useEffect(() => {
    const onPopState = () => {
      setRoute(resolveRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (target: AppRoute) => {
    const nextUrl = target === 'admin' ? '/admin' : target === 'app' ? '/app' : '/';
    if (window.location.pathname !== nextUrl) {
      window.history.pushState({}, '', nextUrl);
    }
    setRoute(target);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  if (route === 'admin') {
    return <AdminPortal onBackToSite={() => navigateTo('public')} />;
  }

  if (route === 'app') {
    return (
      <FieldMobileApp
        onBackToSite={() => navigateTo('public')}
        onOpenAdmin={() => navigateTo('admin')}
      />
    );
  }

  return (
    <PublicShowcase
      onOpenAdmin={() => navigateTo('admin')}
      onOpenApp={() => navigateTo('app')}
    />
  );
}
