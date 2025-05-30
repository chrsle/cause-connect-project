import React from 'react';
import "../views/styles/eventCard.css";
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, } from "react";
import {Event} from "../types/types"
import "../views/styles/longEventCards.css";
import ExpandedCardPortal from "./expandedCard"


interface EventCardProps {
    event: Event;
    userType: "student" | "organization";
  }


  const LongEventCard: React.FC<EventCardProps> = ({ event, userType }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
  
    // Close dropdown when clicking outside
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
      
      // Add event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Clean up event listener
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [dropdownRef]);
  
    const toggleDropdown = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    return (

      <div className="long-event-card" >
        <div className="dropdown-container">
          <button className="long-event-card-menu" onClick={toggleDropdown}>...</button>
          
          {isOpen && (
            <div className="long-event-card-dropdown-menu" ref={dropdownRef}>
              {userType === "student" ? (
              <>
                <button className="dropdown-list">Event Details</button>
                  <ExpandedCardPortal 
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    event={event}
                    userType={userType}
                    isPast= {new Date(event.endDate) < new Date()}
                  />
                <Link className="dropdown-list" to="/leave-event">Leave Event</Link>
              </>
        ) : (
      <>
        <Link className="dropdown-list" to="/edit-event">Edit Event</Link>
        <Link className="dropdown-list" to="/delete-event">Delete Event</Link>
      </>
    )}
  </div>
)}
        </div>
        
        <h2 className="event-card__title">{event.title}</h2>
        <p className="event-card__body"><span className="event-card_label">Organization: </span>{event.organization}</p>
        <p className="event-card__startdate"><span className="event-card_label">Start Date: </span>{event.startDate}</p>
        <p className="event-card__enddate"><span className="event-card_label">End Date: </span>{event.endDate}</p>
        <p className="event-card__starttime"><span className="event-card_label">Start Time: </span>{event.startTime}</p>
        <p className="event-card__endtime"><span className="event-card_label">End Time: </span>{event.endTime}</p>
        <p className="event-card__location"><span className="event-card_label">Location: </span>{event.location}</p>
        <p className="event-care_description"><span className="event-card_label">Cause: </span>{event.cause}</p>
      </div>


    );
  };
  
export default LongEventCard;