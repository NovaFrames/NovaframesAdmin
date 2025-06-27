import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './Pages/Auth';
import Projects from './Pages/Projects';
import Navbar from './Components/Navbar';
import Clients from './Pages/Clients';
import BrandingAdmin from './Pages/BrandingAdmin';
import Faqs from './Pages/Faqs';
import PerformanceAdmin from './Pages/PerformanceAdmin';
import GraphicAdmin from './Pages/GraphicAdmin';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Root route to Auth */}
        <Route path="/" element={<Auth />} />

        {/* Admin layout with nested routes */}
        <Route path="/admin" element={<Navbar />}>
          <Route index element={<Projects />} />
          <Route path="projects" element={<Projects />} />
          <Route path="clients" element={<Clients />} />
          <Route path="BrandingAdmin" element={<BrandingAdmin />} />
          <Route path="PerformanceAdmin" element={<PerformanceAdmin />} />
          <Route path="GraphicAdmin" element={<GraphicAdmin />} />
          <Route path="faqs" element={<Faqs />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
