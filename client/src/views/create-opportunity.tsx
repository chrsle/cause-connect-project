import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/navBar';
import { createOpportunity, getOrganizationProfile } from '../utils/events-utils';
import '../views/styles/create-opportunity.css'; 
import { Event } from "../types/types";

interface FormData {
  name: string;
  date: string;
  startTime: string;
  location: string;
  description: string;
}

interface OrganizationProfile {
  nonprofit_name: string;
}

type FormStep = 'details' | 'review' | 'publish';

function CreateEvent() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FormStep>('details');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    date: '',
    startTime: '',
    location: '',
    description: ''
  });
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch organization profile on component mount
  useEffect(() => {
    const fetchOrganizationProfile = async () => {
      try {
        const profile = await getOrganizationProfile();
        setOrganizationProfile(profile);
      } catch (error) {
        console.error('Error fetching organization profile:', error);
        setErrors({ name: 'Failed to load organization profile. Please try again.' });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchOrganizationProfile();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    let isValid = true;

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Opportunity name is required';
      isValid = false;
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
      isValid = false;
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
      isValid = false;
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (currentStep === 'details') {
      if (validateForm()) {
        setCurrentStep('review');
        window.scrollTo(0, 0);
      }
    } else if (currentStep === 'review') {
      setCurrentStep('publish');
      window.scrollTo(0, 0);
    } else if (currentStep === 'publish') {
      // Final submission - send data to backend
      if (!organizationProfile) {
        setErrors({ name: 'Organization profile not loaded. Please refresh and try again.' });
        return;
      }

      setIsSubmitting(true);
      
      try {
        const result = await createOpportunity(
          organizationProfile.nonprofit_name,
          formData.name,
          formData.description,
          formData.date,
          formData.startTime,
          formData.location
        );
        
        console.log('Opportunity created successfully:', result);
        
        // Redirect to confirmation page or dashboard
        navigate('/org-my-events', { 
          state: { 
            success: true, 
            message: 'Opportunity created successfully!',
            opportunityId: result.opportunityId
          } 
        });
      } catch (error) {
        console.error('Error creating opportunity:', error);
        setErrors({ name: 'Failed to create opportunity. Please try again.' });
        setCurrentStep('details');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/organization-page');
    }
  };

  const handleBack = () => {
    if (currentStep === 'review') {
      setCurrentStep('details');
    } else if (currentStep === 'publish') {
      setCurrentStep('review');
    }
    window.scrollTo(0, 0);
  };

  // Helper function to get today's date in local timezone
  const getTodayLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Show loading state while fetching organization profile
  if (isLoadingProfile) {
    return (
      <div className="create-opportunity-page">
        <NavBar userType="organization" />
        <div className="page-content">
          <div className="create-opportunity-container">
            <p>Loading organization profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if organization profile failed to load
  if (!organizationProfile) {
    return (
      <div className="create-opportunity-page">
        <NavBar userType="organization" />
        <div className="page-content">
          <div className="create-opportunity-container">
            <p>Error loading organization profile. Please refresh the page and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'details':
        return 'Create New Opportunity';
      case 'review':
        return 'Review Opportunity';
      case 'publish':
        return 'Publish Opportunity';
      default:
        return 'Create New Opportunity';
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 'details':
        return 'Review Opportunity';
      case 'review':
        return 'Continue to Publish';
      case 'publish':
        return isSubmitting ? 'Publishing...' : 'Publish Opportunity';
      default:
        return 'Next';
    }
  };

  return (
    <div className="create-opportunity-page">
      <NavBar userType="organization" />
      
      <div className="page-content">
        <div className="create-opportunity-container">
          {/* Header section with progress indicator */}
          <header className="header-section">
            <div className="header-content">
              <h1 className="page-title">{getStepTitle()}</h1>
              <p className="org-name">
                <span className="org-label">Organization:</span> {organizationProfile.nonprofit_name}
              </p>
            </div>
            
            <div className="progress-indicator">
              <div className={`progress-step ${currentStep === 'details' ? 'active' : ''}`}>
                <div className="step-circle">1</div>
                <span className="step-label">Details</span>
              </div>
              
              <div className="progress-connector"></div>
              
              <div className={`progress-step ${currentStep === 'review' ? 'active' : ''}`}>
                <div className="step-circle">2</div>
                <span className="step-label">Review</span>
              </div>
              
              <div className="progress-connector"></div>
              
              <div className={`progress-step ${currentStep === 'publish' ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <span className="step-label">Publish</span>
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="opportunity-form">
            {/* Form content based on current step */}
            {currentStep === 'details' && (
              <>
                <div className="form-section">
                  <h3 className="section-title">Basic Information</h3>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">
                      Opportunity Name <span className="required">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter a clear, descriptive name" 
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <p className="error-message">{errors.name}</p>}
                    <p className="field-hint">Choose a name that clearly describes the activity</p>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="date">
                        Date <span className="required">*</span>
                      </label>
                      <input 
                        type="date" 
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={getTodayLocalDate()} // FIXED: Now uses PST instead of UTC
                        className={errors.date ? 'error' : ''}
                      />
                      {errors.date && <p className="error-message">{errors.date}</p>}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="startTime">
                        Time <span className="required">*</span>
                      </label>
                      <input 
                        type="time" 
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className={errors.startTime ? 'error' : ''}
                      />
                      {errors.startTime && <p className="error-message">{errors.startTime}</p>}
                      <p className="field-hint">Event start time</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="location">
                      Location <span className="required">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter address or online meeting link" 
                      className={errors.location ? 'error' : ''}
                    />
                    {errors.location && <p className="error-message">{errors.location}</p>}
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Details</h3>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="description">
                      Description <span className="required">*</span>
                    </label>
                    <textarea 
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the opportunity, required skills, what volunteers will do, and any other relevant information"
                      rows={6}
                      className={errors.description ? 'error' : ''}
                    />
                    {errors.description && <p className="error-message">{errors.description}</p>}
                    <p className="field-hint">A detailed description helps volunteers understand if they're a good fit</p>
                  </div>
                </div>
              </>
            )}

            {currentStep === 'review' && (
              <div className="form-section">
                <h3 className="section-title">Review Your Opportunity</h3>
                <p>Please review the information below before publishing your opportunity.</p>
                
                <div style={{ marginTop: '20px' }}>
                  <h4><strong>Opportunity Name:</strong></h4>
                  <p>{formData.name}</p>
                  
                  <h4><strong>Date:</strong></h4>
                  <p>{new Date(formData.date).toLocaleDateString()}</p>
                  
                  <h4><strong>Time:</strong></h4>
                  <p>{formData.startTime}</p>
                  
                  <h4><strong>Location:</strong></h4>
                  <p>{formData.location}</p>
                  
                  <h4><strong>Description:</strong></h4>
                  <p>{formData.description}</p>
                  
                  <h4><strong>Organization:</strong></h4>
                  <p>{organizationProfile.nonprofit_name}</p>
                </div>
              </div>
            )}

            {currentStep === 'publish' && (
              <div className="form-section">
                <h3 className="section-title">Ready to Publish</h3>
                <p>
                  Your opportunity is ready to be published! Once you click "Publish Opportunity", 
                  it will be available for students to view and apply for.
                </p>
                
                <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <h4>Quick Summary:</h4>
                  <ul>
                    <li><strong>Event:</strong> {formData.name}</li>
                    <li><strong>Date & Time:</strong> {new Date(formData.date).toLocaleDateString()} at {formData.startTime}</li>
                    <li><strong>Location:</strong> {formData.location}</li>
                    <li><strong>Organization:</strong> {organizationProfile.nonprofit_name}</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleCancel}
                className="cancel-button"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              
              {currentStep !== 'details' && (
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="back-button"
                  disabled={isSubmitting}
                >
                  Back
                </button>
              )}
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {getButtonText()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;