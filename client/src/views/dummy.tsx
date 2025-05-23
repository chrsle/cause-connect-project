import React, { useState, useEffect } from 'react';
import {
  getAllOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getUserOpportunities,
  getNearbyOpportunities,
} from '../utils/events-utils';

interface Opportunity {
  id: number;
  user_id: number;
  nonprofit_name: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  distance?: number; // Optional distance field if available
}

const OpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [userOpportunities, setUserOpportunities] = useState<Opportunity[]>([]);
  const [nearbyOpportunities, setNearbyOpportunities] = useState<Opportunity[]>([]);
  const [newOpportunity, setNewOpportunity] = useState({
    nonprofit_name: '',
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [error, setError] = useState<string>('');
  const [nearbyLocation, setNearbyLocation] = useState('');

  // Fetch all opportunities and user-specific opportunities on mount
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const allOpportunities = await getAllOpportunities();
        setOpportunities(allOpportunities);
      } catch (err) {
        setError('Failed to fetch opportunities');
        console.error(err);
      }
    };

    const fetchUserOpportunities = async () => {
      try {
        const userCreatedOpportunities = await getUserOpportunities();
        if (userCreatedOpportunities && Array.isArray(userCreatedOpportunities)) {
          setUserOpportunities(userCreatedOpportunities);
        } else {
          setUserOpportunities([]);
        }
      } catch (err) {
        setError('Failed to fetch user opportunities');
        console.error(err);
      }
    };

    fetchOpportunities();
    fetchUserOpportunities();
  }, []);

  // Handle form input changes for new/edit opportunity
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOpportunity({
      ...newOpportunity,
      [name]: value,
    });
  };

  // Create new opportunity
  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createOpportunity(
        newOpportunity.nonprofit_name,
        newOpportunity.title,
        newOpportunity.description,
        newOpportunity.date,
        newOpportunity.time,
        newOpportunity.location
      );
      setNewOpportunity({
        nonprofit_name: '',
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
      });

      // Refresh lists
      const allOpportunities = await getAllOpportunities();
      setOpportunities(allOpportunities);

      const userCreatedOpportunities = await getUserOpportunities();
      if (userCreatedOpportunities && Array.isArray(userCreatedOpportunities)) {
        setUserOpportunities(userCreatedOpportunities);
      }
    } catch (err) {
      setError('Failed to create opportunity');
      console.error(err);
    }
  };

  // Start editing opportunity
  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setNewOpportunity({
      nonprofit_name: opportunity.nonprofit_name,
      title: opportunity.title,
      description: opportunity.description,
      date: opportunity.date,
      time: opportunity.time,
      location: opportunity.location,
    });
  };

  // Update opportunity
  const handleUpdateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingOpportunity) {
      try {
        await updateOpportunity(
          editingOpportunity.id,
          newOpportunity.nonprofit_name,
          newOpportunity.title,
          newOpportunity.description,
          newOpportunity.date,
          newOpportunity.time,
          newOpportunity.location
        );
        setEditingOpportunity(null);
        setNewOpportunity({
          nonprofit_name: '',
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
        });

        // Refresh lists
        const allOpportunities = await getAllOpportunities();
        setOpportunities(allOpportunities);

        const userCreatedOpportunities = await getUserOpportunities();
        if (userCreatedOpportunities && Array.isArray(userCreatedOpportunities)) {
          setUserOpportunities(userCreatedOpportunities);
        }
      } catch (err) {
        setError('Failed to update opportunity');
        console.error(err);
      }
    }
  };

  // Delete opportunity
  const handleDeleteOpportunity = async (id: number) => {
    try {
      await deleteOpportunity(id);

      // Refresh lists
      const allOpportunities = await getAllOpportunities();
      setOpportunities(allOpportunities);

      const userCreatedOpportunities = await getUserOpportunities();
      if (userCreatedOpportunities && Array.isArray(userCreatedOpportunities)) {
        setUserOpportunities(userCreatedOpportunities);
      }
    } catch (err) {
      setError('Failed to delete opportunity');
      console.error(err);
    }
  };

  // Nearby location input change
  const handleNearbyLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNearbyLocation(e.target.value);
  };

  // Submit nearby location search
  const handleNearbySearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nearbyLocation.trim() === '') {
      setError('Please enter a location to search nearby opportunities.');
      setNearbyOpportunities([]);
      return;
    }
    setError('');
    try {
      // Pass location string + fixed radius 25 miles
      const nearby = await getNearbyOpportunities(nearbyLocation.trim(), 25);
      setNearbyOpportunities(nearby);
    } catch (err) {
      setError('Failed to fetch nearby opportunities');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Opportunities</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Nearby Location Search Form */}
      <form onSubmit={handleNearbySearchSubmit} style={{ marginBottom: '2rem' }}>
        <label>
          Enter your location to find nearby opportunities (e.g., city or zip code):
          <input
            type="text"
            value={nearbyLocation}
            onChange={handleNearbyLocationChange}
            placeholder="Enter location"
            style={{ marginLeft: '0.5rem' }}
            required
          />
        </label>
        <button type="submit" style={{ marginLeft: '1rem' }}>
          Search Nearby
        </button>
      </form>

      {/* Nearby Opportunities */}
      <h2>Nearby Opportunities (within 25 miles)</h2>
      {nearbyOpportunities.length > 0 ? (
        <ul>
          {nearbyOpportunities.map((opportunity) => (
            <li key={opportunity.id}>
              <h3>{opportunity.title}</h3>
              <p>{opportunity.description}</p>
              <p>
                {opportunity.date} at {opportunity.time}
              </p>
              <p>Location: {opportunity.location}</p>
              {opportunity.distance !== undefined && (
                <p>Distance: {opportunity.distance} miles</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No nearby opportunities found. Use the form above to search.</p>
      )}

      {/* All Opportunities */}
      <h2>All Opportunities</h2>
      <ul>
        {opportunities.map((opportunity) => (
          <li key={opportunity.id}>
            <h3>{opportunity.title}</h3>
            <p>{opportunity.description}</p>
            <p>
              {opportunity.date} at {opportunity.time}
            </p>
            <p>Location: {opportunity.location}</p>
            <button onClick={() => handleEditOpportunity(opportunity)}>Edit</button>
            <button onClick={() => handleDeleteOpportunity(opportunity.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* User-Specific Opportunities */}
      <h2>Your Opportunities</h2>
      {userOpportunities.length > 0 ? (
        <ul>
          {userOpportunities.map((opportunity) => (
            <li key={opportunity.id}>
              <h3>{opportunity.title}</h3>
              <p>{opportunity.description}</p>
              <p>
                {opportunity.date} at {opportunity.time}
              </p>
              <p>Location: {opportunity.location}</p>
              <button onClick={() => handleEditOpportunity(opportunity)}>Edit</button>
              <button onClick={() => handleDeleteOpportunity(opportunity.id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No opportunities created by you.</p>
      )}

      {/* Create/Edit Opportunity Form */}
      <form onSubmit={editingOpportunity ? handleUpdateOpportunity : handleCreateOpportunity}>
        <h2>{editingOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}</h2>

        <input
          type="text"
          name="nonprofit_name"
          placeholder="Nonprofit Name"
          value={newOpportunity.nonprofit_name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newOpportunity.title}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newOpportunity.description}
          onChange={handleInputChange}
          required
        />
        <input
          type="date"
          name="date"
          value={newOpportunity.date}
          onChange={handleInputChange}
          required
        />
        <input
          type="time"
          name="time"
          value={newOpportunity.time}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={newOpportunity.location}
          onChange={handleInputChange}
          required
        />

        <button type="submit">
          {editingOpportunity ? 'Update Opportunity' : 'Create Opportunity'}
        </button>
      </form>
    </div>
  );
};

export default OpportunitiesPage;
