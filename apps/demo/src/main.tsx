import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@db-grid/ui';
import App from './App';
import './styles.css';

/** Must match Vite `base` when deploying to GitHub Pages (e.g. `/db-grid`). */
const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider mode="light">
      <BrowserRouter basename={basename === '/' ? undefined : basename}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
