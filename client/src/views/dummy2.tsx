import React, { useEffect, useState } from 'react';
import {getAllOpportunities} from '../utils/events-utils'; // Adjust path as needed
import {volunteerForOpportunity, getVolunteeredOpportunities, cancelVolunteerSignup} from '../utils/reserve-utils'; // Adjust path as needed

interface Opportunity {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

const VolunteerSignupPage = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [volunteeredOpportunities, setVolunteeredOpportunities] = useState<number[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allOpps = await getAllOpportunities();
        setOpportunities(allOpps);

        const volunteered = await getVolunteeredOpportunities();
        const volunteeredIds = volunteered.map((opp: Opportunity) => opp.id);
        setVolunteeredOpportunities(volunteeredIds);
      } catch (err) {
        setError('Failed to fetch opportunities or reservations.');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleVolunteer = async (id: number) => {
    try {
      await volunteerForOpportunity(id);
      setVolunteeredOpportunities([...volunteeredOpportunities, id]);
    } catch (err) {
      setError('Failed to volunteer.');
      console.error(err);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelVolunteerSignup(id);
      setVolunteeredOpportunities(volunteeredOpportunities.filter((vid) => vid !== id));
    } catch (err) {
      setError('Failed to cancel volunteer signup.');
      console.error(err);
    }
  };

  const isVolunteered = (id: number) => volunteeredOpportunities.includes(id);

  return (
    <div>
      <h1>Volunteer Opportunities</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {opportunities.map((opp) => (
          <li key={opp.id}>
            <h3>{opp.title}</h3>
            <p>{opp.description}</p>
            <p>{opp.date} at {opp.time}</p>
            <p>Location: {opp.location}</p>

            {isVolunteered(opp.id) ? (
              <button onClick={() => handleCancel(opp.id)}>Cancel Signup</button>
            ) : (
              <button onClick={() => handleVolunteer(opp.id)}>Volunteer</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VolunteerSignupPage;
