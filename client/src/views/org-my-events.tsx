import NavBar from "../components/navBar";
import { dummyStudent } from "../constants/dummyStudent";
import { dummyEvents } from "../constants/dummyEvents";
import { Event } from "../types/types";
import LongEventCardCarousel from "../components/longEventCardCarousel";
import "./styles/UserMyEvents.css";
import EventCardGrid from "../components/eventCardGrid";
import { useState } from "react";
import { dummyOrganization } from "../constants/dummyOrgs";

interface EventCardProps {
    events: Event[];
    userType: "student" | "organization";
  }
function OrgMyEvents() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  
    // Filter events based on search query
    const filteredEvents = dummyEvents.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return(
        <>
            <NavBar userType="organization"/>

            
            <div className="landing-page__content">
                    <div className="landing-page-header">
                      <h1 className="landing-page__greeting">
                        Hello, <span className="highlight">{dummyOrganization.name}</span>
                      </h1>
                      <p className="landing-page__welcome">
                        Here are  <span className="highlight"> your events</span>{" "} 
                      </p>
                    </div>
            </div>

            <div className="landing-page-events">
                <h2 className="header-events">Upcoming Opportunities</h2>
                <p className="number_of_events"> You have {dummyStudent.upcoming_events} upcoming events</p>
                <LongEventCardCarousel events={dummyEvents} userType="organization"/>

            </div>


            <div className="header-pastEvents">
                <h2 className="header-pastOpps">Past Opportunities</h2>
            </div>

            <div className="past-opportunities-grid">
                <EventCardGrid events={dummyEvents} userType="organization" />
            </div>

        
            {/* <div className="my-events-events">
                <h2 className="header-events">Upcoming Opportunities</h2>
                <p className="number_of_events"> You have {dummyStudent.upcoming_events} upcoming events</p>
                    <LongEventCardCarousel events={dummyEvents} />
                
            </div>

            <div className="my-events-pastEvents">
                <h2 className="header-pastEvents">Past Opportunities</h2>
                <p className="number_of_events"> You completed {dummyStudent.past_events} events</p>
                    <LongEventCardCarousel events={dummyEvents} />
                
            </div> */}
        </>
    )
}


export default OrgMyEvents;