import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './Pages/Auth';
import Projects from './Pages/Projects';
import Navbar from './Components/Navbar';
import Clients from './Pages/Clients';
import Services from './Pages/Services';
import Faqs from './Pages/Faqs';

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
          <Route path="services" element={<Services />} />
          <Route path="faqs" element={<Faqs />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
