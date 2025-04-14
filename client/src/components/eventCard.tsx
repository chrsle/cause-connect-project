import React from 'react';
import "../views/styles/eventCard.css";
import { Link } from 'react-router-dom';
import { useState } from "react";
import {Event} from "../types/types"
import "../views/styles/eventCard.css";

interface EventCardProps {
    event: Event;
  }

  const EventCard: React.FC<EventCardProps> = ({ event }) => {
    return (
      <div className="event-card">
        <h2 className="event-card__title">{event.title}</h2>
        <p className="event-card__startdate">{event.startDate}</p>
        <p className="event-card__enddate">{event.endDate}</p>
        <p className="event-card__starttime">{event.startTime}</p>
        <p className="event-card__endtime">{event.endTime}</p>
        <p className="event-card__location">{event.location}</p>
      </div>
    );
  };
  
export default EventCard;