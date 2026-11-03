import { useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import Home from "@/pages/Home";
import ServicePage from "@/pages/ServicePage";
import About from "@/pages/About";
import WorkPage from "@/pages/WorkPage";
import HowItWorksPage from "@/pages/HowItWorksPage";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Dashboard from "@/pages/portal/Dashboard";
import Account from "@/pages/portal/Account";
import CoursePage from "@/pages/portal/CoursePage";
import Profile from "@/pages/portal/Profile";
import Timeline from "@/pages/portal/Timeline";
import Exercises from "@/pages/portal/Exercises";
import ExercisePage from "@/pages/portal/ExercisePage";
import ExerciseDetail from "@/pages/admin/ExerciseDetail";
import Reviews from "@/pages/admin/Reviews";
import Notes from "@/pages/portal/Notes";
import NoteEditor from "@/pages/portal/NoteEditor";
import AdminOverview from "@/pages/admin/Overview";
import Students from "@/pages/admin/Students";
import NewStudent from "@/pages/admin/NewStudent";
import StudentDetail from "@/pages/admin/StudentDetail";
import Courses from "@/pages/admin/Courses";
import NewCourse from "@/pages/admin/NewCourse";
import CourseDetail from "@/pages/admin/CourseDetail";
import AdminLayout from "@/components/portal/AdminLayout";
import RequireRole from "@/components/portal/RequireRole";
import PortalLayout from "@/components/portal/PortalLayout";

// Router doesn't scroll on navigation: jump to the #section if there is one, otherwise to the top.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Wait a frame so the target page has rendered.
      requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView());
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function Layout() {
  return (
    <>
      <ScrollManager />
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
      >
        Skip to content
      </a>
      <Navbar />
      <Outlet />
      <Footer />
      <Chatbot />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Student portal and admin: no marketing navbar, footer or chatbot. */}
      <Route path="login" element={<Login />} />
      <Route path="portal" element={<RequireRole role="student" />}>
        <Route element={<PortalLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="courses/:slug" element={<CoursePage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="exercises" element={<Exercises />} />
          <Route path="exercises/:id" element={<ExercisePage />} />
          <Route path="notes" element={<Notes />} />
          <Route path="notes/:id" element={<NoteEditor />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Route>
      <Route path="admin" element={<RequireRole role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="students" element={<Students />} />
          <Route path="students/new" element={<NewStudent />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/new" element={<NewCourse />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="exercises/:id" element={<ExerciseDetail />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="notes" element={<Notes />} />
          <Route path="notes/:id" element={<NoteEditor />} />
        </Route>
      </Route>

      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="work" element={<WorkPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="contact" element={<Contact />} />
        <Route path="services/:slug" element={<ServicePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
