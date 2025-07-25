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
import ContactDetails from './Pages/ContactDetails';
import Image from './Pages/Image';
import PackagesAdmin from './Pages/PackagesAdmin';
import TopBrands from './Pages/TopBrands';

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
          <Route path="top-brands" element={<TopBrands />} />
          <Route path="BrandingAdmin" element={<BrandingAdmin />} />
          <Route path="PerformanceAdmin" element={<PerformanceAdmin />} />
          <Route path="PackagesAdmin" element={<PackagesAdmin />} />
          <Route path="GraphicAdmin" element={<GraphicAdmin />} />
          <Route path="contact-details" element={<ContactDetails />} />
          <Route path="image" element={<Image />} />
          <Route path="faqs" element={<Faqs />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
