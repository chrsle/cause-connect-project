import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/home';
import LandingPage from './views/landing-page';
import OrgOpportunity from './views/org-opportunity';
import CreateEvent from './views/create-opportunity';
import OrganizationProfile from './views/organization-profile';
import UserProfile from './views/user-profile';
import MyEvents from './views/user-my-events';
import OrgMyEvents from './views/org-my-events';
import VolunteerPage from './views/volunteers-page';
import SettingsPage from './views/settings-page';

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
        <Route path ='/organization-profile' element={<OrganizationProfile/>}></Route>
        <Route path ='/my-events' element={<MyEvents/>}></Route>
        <Route path ='/org-my-events' element={<OrgMyEvents/>}></Route>
        <Route path="/event/:id/volunteers" element={<VolunteerPage/>} />
        <Route path="/settings-page" element={<SettingsPage/>} />
      </Routes>
    </Router>
  );
}
export default App;

//<Route path="/event/:id/volunteers" element={<VolunteerPage/>} /> (what I had before)

// <Route path="/" element={<Home/>} />
// <Route path="/about" element={<h1>About</h1>} />
// <Route path = "/home" element = {<h1>Home</h1>} />
// <Route path="/landing-page" element={<LandingPage/>} />
// <Route path ='/organization-page' element={<OrgOpportunity/>}></Route>
// <Route path ='/createOpportunity' element={<CreateEvent/>}></Route>