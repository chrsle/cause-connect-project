import React, { useState, useEffect } from 'react';
import {
  getAllOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getUserOpportunities, // Fetches only the user's opportunities
} from '../utils/events-utils'; // Adjust the path as needed

interface Opportunity {
  id: number;
  user_id: number;
  nonprofit_name: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

const OpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]); // All opportunities
  const [userOpportunities, setUserOpportunities] = useState<Opportunity[]>([]); // User-specific opportunities
  const [newOpportunity, setNewOpportunity] = useState({
    nonprofit_name: '',
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null); // Use the Opportunity type
  const [error, setError] = useState<string>('');

  // Fetch all opportunities and user-specific opportunities on component mount
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const allOpportunities = await getAllOpportunities();
        setOpportunities(allOpportunities);
        console.log('All opportunities:', allOpportunities);
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
          console.log('User opportunities front:', userCreatedOpportunities);
        } else {
          setUserOpportunities([]); // Empty array if no opportunities
        }
      } catch (err) {
        setError('Failed to fetch user opportunities');
        console.error(err);
      }
    };

    fetchOpportunities();
    fetchUserOpportunities();
  }, []); // Re-fetch when the component is mounted

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOpportunity({
      ...newOpportunity,
      [name]: value,
    });
  };

  // Handle the form submission to create a new opportunity
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
      // Re-fetch the opportunities after creation
      const allOpportunities = await getAllOpportunities();
      setOpportunities(allOpportunities);
      const userCreatedOpportunities = await getUserOpportunities();
      if (userCreatedOpportunities && Array.isArray(userCreatedOpportunities.rows)) {
        setUserOpportunities(userCreatedOpportunities.rows);
      }
    } catch (err) {
      setError('Failed to create opportunity');
      console.error(err);
    }
  };

  // Handle edit button click to update an opportunity
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

  // Handle update form submission
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
        // Re-fetch the opportunities after update
        const allOpportunities = await getAllOpportunities();
        setOpportunities(allOpportunities);
        const userCreatedOpportunities = await getUserOpportunities();
        if (userCreatedOpportunities && Array.isArray(userCreatedOpportunities.rows)) {
          setUserOpportunities(userCreatedOpportunities.rows);
        }
      } catch (err) {
        setError('Failed to update opportunity');
        console.error(err);
      }
    }
  };

  // Handle delete button click
  const handleDeleteOpportunity = async (id: number) => {
    try {
      await deleteOpportunity(id);
      // Re-fetch the opportunities after deletion
      const allOpportunities = await getAllOpportunities();
      setOpportunities(allOpportunities);
      const userCreatedOpportunities = await getUserOpportunities();
      if (userCreatedOpportunities && Array.isArray(userCreatedOpportunities.rows)) {
        setUserOpportunities(userCreatedOpportunities.rows);
      }
    } catch (err) {
      setError('Failed to delete opportunity');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Opportunities</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Display all opportunities */}
      <h2>All Opportunities</h2>
      <ul>
        {opportunities.map((opportunity) => (
          <li key={opportunity.id}>
            <h3>{opportunity.title}</h3>
            <p>{opportunity.description}</p>
            <p>{opportunity.date} at {opportunity.time}</p>
            <p>Location: {opportunity.location}</p>
            <button onClick={() => handleEditOpportunity(opportunity)}>Edit</button>
            <button onClick={() => handleDeleteOpportunity(opportunity.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Display user-specific opportunities */}
      <h2>Your Opportunities</h2>
      <ul>
        {userOpportunities.length > 0 ? (
          userOpportunities.map((opportunity) => (
            <li key={opportunity.id}>
              <h3>{opportunity.title}</h3>
              <p>{opportunity.description}</p>
              <p>{opportunity.date} at {opportunity.time}</p>
              <p>Location: {opportunity.location}</p>
              <button onClick={() => handleEditOpportunity(opportunity)}>Edit</button>
              <button onClick={() => handleDeleteOpportunity(opportunity.id)}>Delete</button>
            </li>
          ))
        ) : (
          <p>No opportunities created by you.</p>
        )}
      </ul>

      {/* Create or Edit Opportunity Form */}
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
