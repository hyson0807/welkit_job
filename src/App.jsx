import {BrowserRouter, Route, Routes} from "react-router-dom";
import MainPage from "./pages/MainPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import JobSeekerInfoPage from "./pages/jobseeker/JobSeekerInfoPage.jsx";
import CompanyInfoPage from "./pages/employer/CompanyInfoPage.jsx";
import {AuthProvider} from "./store/contexts/AuthContext.jsx";
import JobSeekerKeywordsPage from "./pages/jobseeker/JobSeekerKeywordsPage.jsx";
import CompanyKeywordsPage from "./pages/employer/CompanyKeywordsPage.jsx";
import CompanyMatchingPage from "./pages/employer/CompanyMatchingPage.jsx";
import JobSeekerMatchingPage from "./pages/jobseeker/JobSeekerMatchingPage.jsx";
import JobSeekerAdditionalInfoPage from "./pages/jobseeker/JobSeekerAdditionalInfoPage.jsx";
import JobSeekerResumePreviewPage from "./pages/jobseeker/JobSeekerResumePreviewPage.jsx";
import CompanyJobPreviewPage from "./pages/employer/CompanyJobPreviewPage.jsx";
import CompaniesListPage from "./pages/CompaniesListPage.jsx";
import JobSeekerDashboard from "./pages/jobseeker/JobSeekerDashboard.jsx";
import CompanyDashboard from "./pages/employer/CompanyDashboard.jsx";

function App() {

  return (
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/" element={<MainPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/jobseeker/info" element={<JobSeekerInfoPage/>}/>
                <Route path="/employer/info" element={<CompanyInfoPage/>}/>
                <Route path="/jobseeker/keywords" element={<JobSeekerKeywordsPage/>}/>
                <Route path="/employer/keywords" element={<CompanyKeywordsPage/>}/>
                <Route path="/employer/matching" element={<CompanyMatchingPage/>}/>
                <Route path="/jobseeker/matching" element={<JobSeekerMatchingPage/>}/>
                <Route path="/jobseeker/additional" element={<JobSeekerAdditionalInfoPage/>}/>
                <Route path="/jobseeker/resume-preview" element={<JobSeekerResumePreviewPage/>}/>
                <Route path="/employer/job-preview" element={<CompanyJobPreviewPage/>}/>
                <Route path="/companies" element={<CompaniesListPage/>}/>
                <Route path="/jobseeker/dashboard" element={<JobSeekerDashboard/>}/>
                <Route path="/employer/dashboard" element={<CompanyDashboard/>}/>
            </Routes>
        </AuthProvider>
    </BrowserRouter>
  )
}

export default App
