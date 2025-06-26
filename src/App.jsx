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
            </Routes>
        </AuthProvider>
    </BrowserRouter>
  )
}

export default App
