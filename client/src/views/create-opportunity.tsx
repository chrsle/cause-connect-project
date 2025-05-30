import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/navBar'; // Adjust path as needed
import { dummyOrganization } from '../constants/dummyOrgs'; // Adjust path as needed
import '../views/styles/create-opportunity.css'; 
import { Event } from "../types/types";


interface FormData {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  volunteers: string;
  description: string;
}

type FormStep = 'details' | 'review' | 'publish';

function CreateEvent() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FormStep>('details');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    volunteers: '',
    description: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

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

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
      isValid = false;
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }

    if (!formData.volunteers.trim()) {
      newErrors.volunteers = 'Number of volunteers is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };



  const handleSubmit =  async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    //to save a draft, but we replace '/api/save-draft' with the actual backedn endpoint
    const saveDraft = async () => {
      try {
        const response = await fetch('/api/save-draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to save draft');
        }

        console.log('Draft saved successfully');
      } catch (error) {
        console.error('Error saving draft:', error);
        // Optionally show a message to the user
      }
};
    
    if (currentStep === 'details') {
      if (validateForm()) {
        await saveDraft(); //save draft before continuing
        setCurrentStep('review');
        window.scrollTo(0, 0); // Scroll to top when moving to the next step
      }
    } else if (currentStep === 'review') {
      setCurrentStep('publish');
      window.scrollTo(0, 0);
    } else if (currentStep === 'publish') {
      // Final submission - send data to backend
      console.log('Publishing opportunity:', formData);
      // Redirect to confirmation page or dashboard
      navigate('/org-my-events', { state: { success: true, message: 'Opportunity created successfully!' } });
    }

    console.log('Submitted at step:', currentStep);

    
  };

  const handleCancel = () => {
    console.log("chicken")
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

  const renderFormContent = () => {
    switch (currentStep) {
      case 'details':
        return renderDetailsForm();
      case 'review':
        return renderReviewForm();
      case 'publish':
        return renderPublishForm();
      default:
        return renderDetailsForm();
    }
  };

  const renderDetailsForm = () => (
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
              min={new Date().toISOString().split('T')[0]}  // 👈 Prevent past dates
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <p className="error-message">{errors.date}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="startTime">
              Start Time <span className="required">*</span>
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
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="endTime">
              End Time <span className="required">*</span>
            </label>
            <input 
              type="time" 
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={errors.endTime ? 'error' : ''}
            />
            {errors.endTime && <p className="error-message">{errors.endTime}</p>}
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

        <div className="form-group">
          <label className="form-label" htmlFor="volunteers">
            Number of Volunteers <span className="required">*</span>
          </label>
          <input 
            type="text" 
            id="volunteers"
            name="volunteers"
            value={formData.volunteers}
            onChange={handleChange}
            placeholder="Ex. 10-20" 
            className={errors.volunteers ? 'error' : ''}
          />
          {errors.volunteers && <p className="error-message">{errors.volunteers}</p>}
          <p className="field-hint">Specify a range or exact number needed</p>
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
  );

  const renderReviewForm = () => (
    <div className="review-section">
      <div className="form-section">
        <h3 className="section-title">Review Your Opportunity</h3>
        <p className="review-intro">Please review the information below before publishing your opportunity.</p>
        
        <div className="review-item">
          <h4 className="review-label">Opportunity Name</h4>
          <p className="review-value">{formData.name}</p>
        </div>
        
        <div className="review-row">
          <div className="review-item">
            <h4 className="review-label">Date</h4>
            <p className="review-value">{new Date(formData.date).toLocaleDateString()}</p>
          </div>
          
          <div className="review-item">
            <h4 className="review-label">Time</h4>
            <p className="review-value">{formData.startTime} - {formData.endTime}</p>
          </div>
          
          <div className="review-item">
            <h4 className="review-label">Location</h4>
            <p className="review-value">{formData.location}</p>
          </div>
        </div>
        
        <div className="review-item">
          <h4 className="review-label">Number of Volunteers</h4>
          <p className="review-value">{formData.volunteers}</p>
        </div>
        
        <div className="review-item">
          <h4 className="review-label">Description</h4>
          <p className="review-value description-preview">{formData.description}</p>
        </div>
      </div>
      
      <div className="form-section">
        <h3 className="section-title">Publishing Information</h3>
        <p className="review-notice">
          Once you proceed, your opportunity will be ready for the final publishing step. 
          You'll be able to add additional details like tags and categories.
        </p>
      </div>
    </div>
  );

  const renderPublishForm = () => (
    <div className="publish-section">
      <div className="form-section">
        <h3 className="section-title">Ready to Publish</h3>
        
        <div className="publish-summary">
          <div className="publish-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M12 3L4 7V12C4 15.866 7.13401 19 12 19C16.866 19 20 15.866 20 12V7L12 3Z" 
                stroke="#4a90e2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h4 className="publish-title">{formData.name}</h4>
          <p className="publish-date">
            {new Date(formData.date).toLocaleDateString()} • {formData.startTime} - {formData.endTime}
          </p>
          <p className="publish-location">{formData.location}</p>
          
          <div className="publish-details">
            <p className="publish-text">
              Your opportunity is ready to be published! Once published, it will be visible to all students
              on the platform who are looking for volunteer opportunities.
            </p>
          </div>
        </div>
        
        <div className="visibility-options">
          <h4 className="options-title">Visibility Options</h4>
          
          <div className="option-item">
            <input 
              type="radio" 
              id="public" 
              name="visibility" 
              value="public" 
              defaultChecked 
            />
            <label htmlFor="public">
              <span className="option-label">Public</span>
              <span className="option-description">Visible to all students on the platform</span>
            </label>
          </div>
          
          <div className="option-item">
            <input 
              type="radio" 
              id="private" 
              name="visibility" 
              value="private" 
            />
            <label htmlFor="private">
              <span className="option-label">Private</span>
              <span className="option-description">Only visible to students you invite</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const getButtonText = () => {
    switch (currentStep) {
      case 'details':
        return 'Save & Continue';
      case 'review':
        return 'Continue to Publish';
      case 'publish':
        return 'Publish Opportunity';
      default:
        return 'Save & Continue';
    }
  };

  return (
    <div className="create-opportunity-page">
      <NavBar userType="organization" />
      
      <div className="page-content">
        <div className="create-opportunity-container">
          <header className="header-section">
            <div className="header-content">
              <h1 className="page-title">Create New Opportunity</h1>
              <h2 className="org-name">
                <span className="org-label">Organization:</span> {dummyOrganization.name}
              </h2>
            </div>
            <div className="progress-indicator">
              <div className={`progress-step ${currentStep === 'details' ? 'active' : ''} ${currentStep === 'review' || currentStep === 'publish' ? 'completed' : ''}`}>
                <div className="step-circle">1</div>
                <span className="step-label">Details</span>
              </div>
              <div className={`progress-connector ${currentStep === 'review' || currentStep === 'publish' ? 'completed' : ''}`}></div>
              <div className={`progress-step ${currentStep === 'review' ? 'active' : ''} ${currentStep === 'publish' ? 'completed' : ''}`}>
                <div className="step-circle">2</div>
                <span className="step-label">Review</span>
              </div>
              <div className={`progress-connector ${currentStep === 'publish' ? 'completed' : ''}`}></div>
              <div className={`progress-step ${currentStep === 'publish' ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <span className="step-label">Publish</span>
              </div>
            </div>
          </header>

          <form className="opportunity-form" onSubmit={handleSubmit}>
            {renderFormContent()}

            <div className="form-actions">
              {currentStep !== 'details' && (
                <button type="button" className="back-button" onClick={handleBack}>
                  Back
                </button>
              )}
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="submit-button">
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