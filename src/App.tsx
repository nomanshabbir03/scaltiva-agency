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
