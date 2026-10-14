import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Signup from "./pages/Signup";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import DiseaseDetectionPage from "./pages/DiseaseDetectionPage";
import MyCropsPage from "./pages/MyCropsPage";
import SpraySchedulerPage from "./pages/SpraySchedulerPage";
import WeatherPage from "./pages/WeatherPage";
import HistoryReportsPage from "./pages/HistoryReportsPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import ProfilePage from "./pages/ProfilePage";
import FieldJournalPage from "./pages/FieldJournalPage";
import PrivateRoute from "./components/PrivateRoute";

const DashboardLayout = () => {
  const location = useLocation();
  const pageNames = {
    '/dashboard': 'Overview', '/disease-detection': 'Crop health',
    '/my-crops': 'Crop records', '/spray-scheduler': 'Care planner',
    '/weather-advisory': 'Weather outlook', '/history-reports': 'Scan journal',
    '/knowledge-base': 'Growing guide', '/field-journal': 'Field journal',
    '/profile': 'My account',
  };
  return (
    <div className="workspace-shell min-h-screen bg-[#f7f8f2] text-[#283b2c] font-sans">
      {/* Fixed Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="min-h-screen w-full min-w-0 p-4 pt-24 sm:p-6 sm:pt-24 lg:ml-72 lg:w-auto lg:p-8 transition-all duration-300">
        <div className="workspace-content mx-auto w-full min-w-0 max-w-7xl">
          <div className="workspace-topbar"><span>WORKSPACE <span className="mx-2 text-[#a7bb8b]">/</span> {pageNames[location.pathname]}</span><Link to="/profile">My account ↗</Link></div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing & Authentication Portal */}
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Farmer Platform */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/disease-detection"
              element={<DiseaseDetectionPage />}
            />
            <Route path="/my-crops" element={<MyCropsPage />} />
            <Route path="/spray-scheduler" element={<SpraySchedulerPage />} />
            <Route path="/weather-advisory" element={<WeatherPage />} />
            <Route path="/history-reports" element={<HistoryReportsPage />} />
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="/field-journal" element={<FieldJournalPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
