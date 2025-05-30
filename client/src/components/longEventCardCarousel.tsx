import React, { useState } from 'react';
import "../views/styles/longEventCardCarousel.css";
import { Event } from "../types/types";
import LongEventCard from './longEventCards';

interface EventCardCarouselProps {
  events: Event[];
  userType: "student" | "organization";
}

const LongEventCardCarousel: React.FC<EventCardCarouselProps> = ({ events, userType }) => {
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
    <div className="long-carousel-container">
      {/* <button onClick={handlePrev} className="long-carousel-btn" disabled={currentIndex === 0}>
        ‹
      </button> */}

      <div className="long-carousel-content">
        <div
          // className="long-carousel-track"
          // style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {events.map((event, index) => (
            <div key={index} className="long-carousel-item">
              <LongEventCard event={event} userType={userType} />
            </div>
          ))}
        </div>
      </div>

      {/* <button onClick={handleNext} className="carousel-btn" disabled={currentIndex === events.length - 1}>
        ›
      </button> */}
    </div>
  );
};

export default LongEventCardCarousel;