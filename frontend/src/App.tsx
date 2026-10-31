import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import CandidateLayout from "./components/layout/CandidateLayout";
import PublicLayout from "./components/layout/PublicLayout";
import RecruiterLayout from "./components/layout/RecruiterLayout";
import CandidateApplicationsPage from "./pages/candidate/CandidateApplicationsPage";
import ProfilePage from "./pages/candidate/ProfilePage";
import ResumesPage from "./pages/candidate/ResumesPage";
import ApplicantsPage from "./pages/recruiter/ApplicantsPage";
import DashboardPage from "./pages/recruiter/DashboardPage";
import JobFormPage from "./pages/recruiter/JobFormPage";
import RecruiterJobsPage from "./pages/recruiter/RecruiterJobsPage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import FeaturesPage from "./pages/public/FeaturesPage";
import HomePage from "./pages/public/HomePage";
import JobDetailPage from "./pages/public/JobDetailPage";
import JobsPage from "./pages/public/JobsPage";
import LoginPage from "./pages/public/LoginPage";
import NotFoundPage from "./pages/public/NotFoundPage";
import PricingPage from "./pages/public/PricingPage";
import RegisterPage from "./pages/public/RegisterPage";
import ApplicationDetailPage from "./pages/shared/ApplicationDetailPage";

// All the pages of the website
export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Sign in and register */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Candidate area */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute role="Candidate">
            <CandidateLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="applications" replace />} />
        <Route path="applications" element={<CandidateApplicationsPage />} />
        <Route path="applications/:id" element={<ApplicationDetailPage />} />
        <Route path="resumes" element={<ResumesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Recruiter area */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute role="Recruiter">
            <RecruiterLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="jobs" element={<RecruiterJobsPage />} />
        <Route path="jobs/new" element={<JobFormPage />} />
        <Route path="jobs/:id/edit" element={<JobFormPage />} />
        <Route path="jobs/:id/applicants" element={<ApplicantsPage />} />
        <Route path="applications/:id" element={<ApplicationDetailPage />} />
      </Route>
    </Routes>
  );
}
