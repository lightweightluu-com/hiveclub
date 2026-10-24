import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import './index.css';
import App from './App';

// Admin-Bereich als eigener Chunk, damit die öffentliche Seite davon nichts laden muss.
const AdminApp = lazy(() => import('./admin/AdminApp'));
const isAdmin = location.pathname === '/admin' || location.pathname.startsWith('/admin/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      {isAdmin ? (
        <Suspense fallback={null}>
          <AdminApp />
        </Suspense>
      ) : (
        <App />
      )}
    </MotionConfig>
  </StrictMode>
);
