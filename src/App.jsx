import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AdminNav from '@/components/AdminNav';
import { AnalyseProvider } from '@/lib/AnalyseContext';
import SupplementAdmin832 from './pages/SupplementAdmin832';
import SupplementStrategy832 from './pages/SupplementStrategy832';
import ContentPlanning832 from './pages/ContentPlanning832';
import KundenPortal from './pages/KundenPortal';
import BrandAssets832 from './pages/BrandAssets832';
import Progress from './pages/Progress';
import TestimonialAdmin832 from './pages/TestimonialAdmin832';
import ProgressReport from './pages/ProgressReport';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import SalesCockpit from './pages/SalesCockpit';
import SalesWizard from './pages/SalesWizard';
import AdStudio832 from './pages/AdStudio832';
import TestimonialCards832 from './pages/TestimonialCards832';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <>
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/SupplementAdmin832" element={<LayoutWrapper currentPageName="SupplementAdmin832"><SupplementAdmin832 /></LayoutWrapper>} />
      <Route path="/SupplementStrategy832" element={<LayoutWrapper currentPageName="SupplementStrategy832"><SupplementStrategy832 /></LayoutWrapper>} />
      <Route path="/ContentPlanning832" element={<LayoutWrapper currentPageName="ContentPlanning832"><ContentPlanning832 /></LayoutWrapper>} />
      <Route path="/kunde/:clientName" element={<KundenPortal />} />
      <Route path="/BrandAssets832" element={<LayoutWrapper currentPageName="BrandAssets832"><BrandAssets832 /></LayoutWrapper>} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/TestimonialAdmin832" element={<LayoutWrapper currentPageName="TestimonialAdmin832"><TestimonialAdmin832 /></LayoutWrapper>} />
      <Route path="/progress-report" element={<ProgressReport />} />
      <Route path="/impressum" element={<Impressum />} />
      <Route path="/datenschutz" element={<Datenschutz />} />
      <Route path="/sales-cockpit" element={<LayoutWrapper currentPageName="SalesCockpit"><SalesCockpit /></LayoutWrapper>} />
      <Route path="/sales-wizard/:callId" element={<SalesWizard />} />
      <Route path="/AdStudio832" element={<LayoutWrapper currentPageName="AdStudio832"><AdStudio832 /></LayoutWrapper>} />
      <Route path="/TestimonialCards832" element={<LayoutWrapper currentPageName="TestimonialCards832"><TestimonialCards832 /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    <AdminNav />
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AnalyseProvider>
            <AuthenticatedApp />
          </AnalyseProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App