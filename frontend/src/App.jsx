import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from 'c:/Users/jemaa/OneDrive/Bureau/PFE/Clyster/frontend/src/components/navbar';
import Home from 'c:/Users/jemaa/OneDrive/Bureau/PFE/Clyster/frontend/src/pages/home';
import About from 'c:/Users/jemaa/OneDrive/Bureau/PFE/Clyster/frontend/src/pages/about';
import Contact from 'c:/Users/jemaa/OneDrive/Bureau/PFE/Clyster/frontend/src/pages/contact';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
