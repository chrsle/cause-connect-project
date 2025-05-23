import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/home';
import LandingPage from './views/landing-page';
import OpportunitiesPage from './views/dummy';
import VolunteerSignupPage from './views/dummy2';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/about" element={<h1>About</h1>} />
        <Route path = "/home" element = {<h1>Home</h1>} />
        <Route path="/landing-page" element={<LandingPage/>} />
        <Route path = "/opportunities" element={<OpportunitiesPage/>} />
        <Route path = "/volunteer-signup" element={<VolunteerSignupPage/>} />
      </Routes>
    </Router>
  );
}
export default App;