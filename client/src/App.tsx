import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.js';
import { AuthProvider } from './contexts/AuthContext.js';
import { AppLayout } from './components/AppLayout.js';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { MapPage } from './pages/MapPage.js';
import { DetailPage } from './pages/DetailPage.js';
import { ReportPage } from './pages/ReportPage.js';
import { LeaderboardPage } from './pages/LeaderboardPage.js';
import { AdminPage } from './pages/AdminPage.js';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Core Application Protected / Dynamic Routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="location/:id" element={<DetailPage />} />
              <Route path="report" element={<ReportPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="admin" element={<AdminPage />} />
              
              {/* Fallbacks */}
              <Route index element={<Navigate to="map" replace />} />
              <Route path="*" element={<Navigate to="map" replace />} />
            </Route>

            {/* Global Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
