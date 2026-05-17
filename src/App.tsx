import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Streaks from './pages/Streaks';
import Bilingual from './pages/Bilingual';
import WeeklyReview from './pages/WeeklyReview';
import ManageSchedule from './pages/ManageSchedule';
import Revisions from './pages/Revisions';
import ResetPassword from './pages/ResetPassword';

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Chargement…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/schedule"  element={<Schedule />} />
        <Route path="/streaks"   element={<Streaks />} />
        <Route path="/bilingual" element={<Bilingual />} />
        <Route path="/review"    element={<WeeklyReview />} />
        <Route path="/manage"    element={<ManageSchedule />} />
        <Route path="/revisions" element={<Revisions />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"          element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/*"             element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppProvider>
  );
}
