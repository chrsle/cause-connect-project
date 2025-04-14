import React, { useState } from 'react';
import "../views/styles/eventCardCarousel.css";
import { Event } from "../types/types";
import EventCard from './eventCard';

interface EventCardCarouselProps {
  events: Event[];
}

const EventCardCarousel: React.FC<EventCardCarouselProps> = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, events.length - 1)
    );
  };

  return (
    <div className="carousel-container">
      <button onClick={handlePrev} className="carousel-btn" disabled={currentIndex === 0}>
        ‹
      </button>

      <div className="carousel-content">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {events.map((event, index) => (
            <div key={index} className="carousel-item">
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleNext} className="carousel-btn" disabled={currentIndex === events.length - 1}>
        ›
      </button>
    </div>
  );
};

export default EventCardCarousel;
