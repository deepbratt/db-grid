import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteFooter, SiteHeader } from './components/SiteChrome';
import { HomePage } from './pages/HomePage';
import './styles.css';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
