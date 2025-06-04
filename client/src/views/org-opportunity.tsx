import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import NavBar from "../components/navBar";
import { Event } from "../types/types";
import EventCard from "../components/eventCard";
import EventCardCarousel from "../components/eventCardCarousel";
import "./styles/landing-page.css";
import EventCardGrid from "../components/eventCardGrid";
import { Organization } from "../types/types";
import { dummyOrganization } from "../constants/dummyOrgs";
import "./styles/orgOpportunity.css";
import { getOrganizationProfile, getUserOpportunities } from '../utils/events-utils';

interface OrganizationProfile {
  nonprofit_name: string;
  // Add other fields as needed
}

function OrgOpportunity(){
    const navigate = useNavigate();
    const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile | null>(null);
    const [activeEvents, setActiveEvents] = useState<Event[]>([]);
    const [pastEvents, setPastEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);

    // Fetch organization profile on component mount
    useEffect(() => {
        const fetchOrganizationProfile = async () => {
            try {
                const profile = await getOrganizationProfile();
                setOrganizationProfile(profile);
            } catch (error) {
                console.error('Error fetching organization profile:', error);
                // Fallback to dummy data if API fails
                setOrganizationProfile({ nonprofit_name: dummyOrganization.name });
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrganizationProfile();
    }, []);

    // Function to categorize events
    const categorizeEvents = (events: Event[]) => {
        const currentDateTime = new Date();
        const active: Event[] = [];
        const past: Event[] = [];
        
        console.log('Categorizing events:', events.length); // Debug log
        
        events.forEach((event: Event) => {
            // Parse date without timezone conversion
            const [year, month, day] = event.startDate.split('-').map(Number);
            const eventDate = new Date(year, month - 1, day);
            
            // Use raw time for comparison (use rawTime if available, otherwise parse startTime)
            const timeToUse = event.rawTime || event.startTime;
            const [hours, minutes] = timeToUse.split(':').map(Number);
            eventDate.setHours(hours, minutes, 0, 0);
            
            console.log(`Event: ${event.title}, DateTime: ${eventDate}, Current: ${currentDateTime}, Future: ${eventDate > currentDateTime}`);
            
            // Compare the full datetime (date + time)
            if (eventDate > currentDateTime) {
                active.push(event);
            } else {
                past.push(event);
            }
        });
        
        console.log('Final categorization - Active:', active.length, 'Past:', past.length);
        
        setActiveEvents(active);
        setPastEvents(past);
    };

    // Function to refresh events (used after edit/delete operations)
    const refreshEvents = async () => {
        console.log('Refreshing events...');
        setIsLoadingEvents(true);
        try {
            const events = await getUserOpportunities();
            categorizeEvents(events);
        } catch (error) {
            console.error('Error refreshing events:', error);
            setActiveEvents([]);
            setPastEvents([]);
        } finally {
            setIsLoadingEvents(false);
        }
    };

    // Fetch organization's events - SINGLE useEffect for events
    useEffect(() => {
        const fetchOrganizationEvents = async () => {
            console.log('Fetching organization events...');
            try {
                const events = await getUserOpportunities();
                console.log('Raw events received:', events);
                categorizeEvents(events);
            } catch (error) {
                console.error('Error fetching organization events:', error);
                setActiveEvents([]);
                setPastEvents([]);
            } finally {
                setIsLoadingEvents(false);
            }
        };

        fetchOrganizationEvents();
    }, []); // Only run once on mount

    const handleCreateOpportunity = () => {
        navigate('/create-opportunity');
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="org-opportunity">
                <NavBar userType="organization"/>
                <div className="landing-page__content">
                    <div className="landing-page-header">
                        <h1 className="landing-page__greeting">Loading...</h1>
                    </div>
                </div>
            </div>
        );
    }

    return(
        <div className ="org-opportunity">
            <NavBar userType="organization"/>

            <div className = "landing-page__content">
                <div className="landing-page-header">
                    <h1 className="landing-page__greeting">
                        Hello, <span className='highlight'> {organizationProfile?.nonprofit_name || 'Organization'}</span>
                    </h1>
                    <p className="landing-page__welcome">
                        Welcome back to <span className="highlight"> your</span> platform for{" "}
                        <span className="highlight">connecting</span> with{" "}
                        <span className="highlight">causes</span> you{" "}
                        <span className="highlight">care</span> about
                    </p>
                </div>
            </div>

            <div className="landing-page-events">
                <h2 className="header-events">Active Opportunities</h2>
                {/* Added event count feature here */}
<p className="number_of_events">You have {activeEvents.length} active event{activeEvents.length !== 1 ? 's' : ''}</p>              
                {isLoadingEvents ? (
                    <p>Loading events...</p>
                ) : activeEvents.length > 0 ? (
                    <EventCardCarousel 
                        events={activeEvents} 
                        userType="organization"  
                        renderCard={(event, userType) => (
                            <EventCard 
                                event={event} 
                                userType={userType} 
                                onEventUpdated={refreshEvents}
                            />
                        )}
                    />
                ) : (
                    <p className="no-events-message">You have no active events at this time.</p>
                )}
            </div>

            <div className="landing-page_new-opportunities">
                <button
                    onClick={handleCreateOpportunity}
                    className="create-opportunity-button"
                    aria-label="Create a new opportunity"
                >
                    <div className="create-button-content">
                        <span className="create-button-icon">+</span>
                        <span className="create-button-text">Create a new opportunity</span>
                    </div>
                </button>
            </div>

            <div className="past-opportunities">
                <h2 className="header-pastOpps">Past Opportunities</h2>
                {/* Added event count feature here too */}
<p className="number_of_events">You have {pastEvents.length} active event{pastEvents.length !== 1 ? 's' : ''}</p>              
                {isLoadingEvents ? (
                    <p>Loading events...</p>
                ) : pastEvents.length > 0 ? (
                    <div className="past-opportunities-grid">
                        <EventCardGrid 
                            events={pastEvents} 
                            userType="organization" 
                            onEventUpdated={refreshEvents}
                        />
                    </div>
                ) : (
                    <p className="no-events-message">You have no past events at this time.</p>
                )}
            </div>
        </div>
    )
}

export default OrgOpportunity;