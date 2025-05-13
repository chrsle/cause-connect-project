import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/home';
import LandingPage from './views/landing-page';
import OrgOpportunity from './views/org-opportunity';
import CreateEvent from './views/create-opportunity';
import UserProfile from './views/user-profile';
import MyEvents from './views/user-my-events';
import OrgMyEvents from './views/org-my-events';


function App() {
  return (

    
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/about" element={<h1>About</h1>} />
        <Route path = "/home" element = {<h1>Home</h1>} />
        <Route path="/landing-page" element={<LandingPage/>} />
        <Route path ='/organization-page' element={<OrgOpportunity/>}></Route>
        <Route path ='/create-opportunity' element={<CreateEvent/>}></Route>
        <Route path ='/user-profile' element={<UserProfile/>}></Route>
        <Route path ='/my-events' element={<MyEvents/>}></Route>
        <Route path ='/org-my-events' element={<OrgMyEvents/>}></Route>
      </Routes>
    </Router>
  );
}
export default App;


// <Route path="/" element={<Home/>} />
// <Route path="/about" element={<h1>About</h1>} />
// <Route path = "/home" element = {<h1>Home</h1>} />
// <Route path="/landing-page" element={<LandingPage/>} />
// <Route path ='/organization-page' element={<OrgOpportunity/>}></Route>
// <Route path ='/createOpportunity' element={<CreateEvent/>}></Route>