import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/home';
import LandingPage from './views/landing-page';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/about" element={<h1>About</h1>} />
        <Route path = "/home" element = {<h1>Home</h1>} />
        <Route path="/landing-page" element={<LandingPage/>} />
      </Routes>
    </Router>
  );
}
export default App;