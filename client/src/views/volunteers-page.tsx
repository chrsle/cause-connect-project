import React, { useState } from 'react';
import NavBar from '../components/navBar'; 
import './styles/volunteers-page.css'
import { Event } from '../types/types';
import { useParams } from 'react-router-dom';

// Define interfaces for our data types
interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  signupDate: string;
  status: 'pending' | 'approved' | 'declined';
}

const VolunteerPage: React.FC = () => {
  // Mock event data - replace with actual data fetching logic
  const [event, setEvent] = useState<Event>({
    id: 5,
    title: "Community Cleanup",
    organization: "Green Earth",
    body: "Join us for a community cleanup event to beautify our neighborhood.",
    createdDate: "2025-04-01",
    author_id: 1,
    startDate: "2025-04-20",
    endDate: "2025-04-20",
    startTime: "10:00 AM",
    endTime: "1:00 PM",
    location: "Central Park",
    cause: "Environmental",
    volunteers: "0",
    status: "upcoming"
  });

  // Mock volunteer data - replace with actual data fetching logic
  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    {
      id: 'vol1',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '555-123-4567',
      signupDate: '2025-05-01',
      status: 'approved'
    },
    {
      id: 'vol2',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '555-987-6543',
      signupDate: '2025-05-03',
      status: 'pending'
    },
    {
      id: 'vol3',
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      signupDate: '2025-05-05',
      status: 'approved'
    },
    {
      id: 'vol4',
      name: 'Alex Johnson',
      email: 'alex.j@email.com',
      phone: '555-444-3333',
      signupDate: '2025-05-07',
      status: 'declined'
    }
  ]);

  // Filter state for our volunteer list
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');
  
  // Search term state
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

const toggleSelect = (id: string) => {
  setSelectedIds(prev => {
    const updated = new Set(prev);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    return updated;
  });
};

const toggleSelectAll = () => {
  const allVisibleIds = filteredVolunteers.map(v => v.id);
  const allSelected = allVisibleIds.every(id => selectedIds.has(id));
  setSelectedIds(allSelected ? new Set() : new Set(allVisibleIds));
};


  // Filter volunteers based on current filter and search term
  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesFilter = filter === 'all' || volunteer.status === filter;
    const matchesSearch = 
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'pending' | 'approved' | 'declined') => {
    setFilter(newFilter);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle bulk actions
  const handleBulkAction = (action: 'approve' | 'decline' | 'message') => {
    if (selectedIds.size === 0) return;
  
    if (action === 'approve' || action === 'decline') {
      setVolunteers(prev => 
        prev.map(v => 
          selectedIds.has(v.id) ? { ...v, status: action === 'approve' ? 'approved' : 'declined' } : v
        )
      );
      setSelectedIds(new Set()); // Optionally clear selection
    } else if (action === 'message') {
      // For example, open a message modal or console log
      const selectedEmails = volunteers.filter(v => selectedIds.has(v.id)).map(v => v.email);
      console.log('Send message to:', selectedEmails);
    }
  };

  return (
    <div className="volunteer-list-page">
      <NavBar userType="organization" />
      
      <div className="page-content">
        <div className="volunteer-list-container">
          {/* Header section with event details */}
          <header className="header-section">
            <div className="event-details">
              <h1 className="page-title">Volunteer Signups</h1>
              <h2 className="event-name">{event.title}</h2>
              
              <div className="event-meta">
                <div className="event-info">
                  <p className="event-date">
                    <span className="label">Date:</span> {new Date(event.startDate).toLocaleDateString()}
                  </p>
                  <p className="event-time">
                    <span className="label">Time:</span> {event.startTime} - {event.endTime}
                  </p>
                  <p className="event-location">
                    <span className="label">Location:</span> {event.location}
                  </p>
                </div>
                
                <div className="volunteer-stats">
                  <div className="stat-item">
                    <span className="stat-label">Volunteers Needed</span>
                    <span className="stat-value">{event.volunteers}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Signed Up</span>
                    <span className="stat-value">{event.volunteers}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Controls section */}
          <div className="controls-section">
            <div className="search-filter">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <button className="search-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('pending')}
                >
                  Pending
                </button>
                <button 
                  className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('approved')}
                >
                  Approved
                </button>
                <button 
                  className={`filter-tab ${filter === 'declined' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('declined')}
                >
                  Declined
                </button>
              </div>
            </div>
            
            <div className="bulk-actions">
              <button 
                className="action-button approve"
                onClick={() => handleBulkAction('approve')}
              >
                Approve Selected
              </button>
              <button 
                className="action-button decline"
                onClick={() => handleBulkAction('decline')}
              >
                Decline Selected
              </button>
              <button 
                className="action-button message"
                onClick={() => handleBulkAction('message')}
              >
                Message Selected
              </button>
            </div>
          </div>

          {/* Volunteer list section */}
          <div className="volunteer-list-section">
            <div className="volunteer-list-header">
              <div className="select-all">
                <input type="checkbox" id="select-all" checked={filteredVolunteers.length > 0 && filteredVolunteers.every(v => selectedIds.has(v.id))} 
  onChange={toggleSelectAll} />
                <label htmlFor="select-all">Select All</label>
              </div>
              <div className="list-headers">
                <span className="header-item name">Name</span>
                <span className="header-item email">Email</span>
                <span className="header-item phone">Phone</span>
                <span className="header-item signup-date">Signup Date</span>
                <span className="header-item status">Status</span>
                <span className="header-item actions">Actions</span>
              </div>
            </div>
            
            <div className="volunteer-list">
              {filteredVolunteers.length > 0 ? (
                filteredVolunteers.map(volunteer => (
                  <div key={volunteer.id} className="volunteer-row">
                    <div className="select-volunteer">
                      <input type="checkbox" id={`select-${volunteer.id}`} checked={selectedIds.has(volunteer.id)}  onChange={() => toggleSelect(volunteer.id)} />
                    </div>
                    
                    {/* This is where you would insert your ProfileCard component */}
                    <div className="volunteer-info">
                      <div className="volunteer-name">{volunteer.name}</div>
                      <div className="volunteer-email">{volunteer.email}</div>
                      <div className="volunteer-phone">{volunteer.phone || 'Not provided'}</div>
                      <div className="volunteer-signup-date">{new Date(volunteer.signupDate).toLocaleDateString()}</div>
                      <div className={`volunteer-status ${volunteer.status}`}>
                        {volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1)}
                      </div>
                      <div className="volunteer-actions">
                        <button className="action-icon view"
onClick={() => (window.location.href = 'user-profile')}>
                           <i className="material-icons">visibility</i>
                        </button>
                        <button className="action-icon message">
                          <i className="material-icons">sms</i>
                                   </button>
                        <button className="action-icon more">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No volunteers match your current filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination section */}
          <div className="pagination-section">
            <div className="showing-results">
              Showing {filteredVolunteers.length} of {volunteers.length} volunteers
            </div>
            <div className="pagination-controls">
              <button className="pagination-button prev" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Previous
              </button>
              <div className="pagination-pages">
                <button className="page-number active">1</button>
              </div>
              <button className="pagination-button next" disabled>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerPage;