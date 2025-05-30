import NavBar from "../components/navBar";
import { dummyStudent } from "../constants/dummyStudent";
import EventCardCarousel from "../components/eventCardCarousel";
import { dummyEvents } from "../constants/dummyEvents";
import { Event } from "../types/types";
import LongEventCardCarousel from "../components/longEventCardCarousel";
import "./styles/UserMyEvents.css";
import EventCard from "../components/eventCard";
import EventCardGrid from "../components/eventCardGrid";
import { useState } from "react";

interface EventCardProps {
    events: Event[];
  }
function MyEvents() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  
    // Filter events based on search query
    const filteredEvents = dummyEvents.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return(
        <>
            <NavBar userType="student"/>

            
            <div className="landing-page__content">
                    <div className="landing-page-header">
                      <h1 className="landing-page__greeting">
                        Hello, <span className="highlight">{dummyStudent.full_name}</span>
                      </h1>
                      <p className="landing-page__welcome">
                        Here are  <span className="highlight"> your events</span>{" "} 
                      </p>
                    </div>
            </div>

            <div className="landing-page-events">
                <h2 className="header-events">Upcoming Opportunities</h2>
                <p className="number_of_events"> You have {dummyStudent.upcoming_events} upcoming events</p>
                <EventCardCarousel events={dummyEvents} userType="student"  renderCard={(event, userType) => <EventCard event={event} userType={userType} />}/>

            </div>


            <div className="header-pastEvents">
                <h2 className="header-pastOpps">Past Opportunities</h2>
            </div>

            <div className="past-opportunities-grid">
                <EventCardGrid events={dummyEvents} userType="student"/>
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


export default MyEvents;