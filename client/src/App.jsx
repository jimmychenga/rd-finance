import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Nav } from './components/Nav.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { MonthDetail } from './pages/MonthDetail.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { JTT } from './pages/JTT.jsx';
import { Amex } from './pages/Amex.jsx';
import { Wealth } from './pages/Wealth.jsx';
import { Cards } from './pages/Cards.jsx';
import { Mobile } from './pages/Mobile.jsx';

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: 1 } } });

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          {/* Mobile quick-entry — no nav */}
          <Route path="/mobile" element={<Mobile />} />
          {/* Desktop layout */}
          <Route path="*" element={
            <div className="flex min-h-screen bg-[#0A0F1E]">
              <Nav />
              <main className="ml-16 flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/month" element={<MonthDetail />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/jtt" element={<JTT />} />
                  <Route path="/amex" element={<Amex />} />
                  <Route path="/wealth" element={<Wealth />} />
                  <Route path="/cards" element={<Cards />} />
                </Routes>
              </main>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
