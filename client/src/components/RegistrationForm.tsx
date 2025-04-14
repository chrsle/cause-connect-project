import React, { useState } from "react";
import "../views/styles/registration.css";

const Registration = () => {
    const [usertype, setUsertype] = useState<string | null>(null);
    const [slide, setSlide] = useState(0);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const[fullname, setFullname] = useState<string | null>(null);
    const[age, setAge] = useState<number | null>(null);
    const[school, setSchool] = useState<string | null>(null);
    const [bio, setBio] = useState<string | null>(null);

    const[nonprofitName, setNonprofitName] = useState<string | null>(null);
    const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
    const[mission, setMission] = useState<string | null>(null);
    const[location, setLocation] = useState<string | null>(null);


    const saveStudentInfo = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setFullname(formData.get("fullname") as string);
        setAge(Number(formData.get("age")));
        setSchool(formData.get("school") as string);
        setBio(formData.get("bio") as string);
    }

    const saveNonProfitInfo = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setNonprofitName(formData.get("name") as string);
        setLocation(formData.get("location") as string);
        setMission(formData.get("mission") as string);
    }

    const toggleCause = (cause: string) => {
        setSelectedCauses((prev) =>
          prev.includes(cause)
            ? prev.filter((c) => c !== cause)
            : [...prev, cause]
        );
    };
      

    const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
        prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
    };


    const handleUsertypeSelect = (type: string) => {
        setUsertype(type);
        setSlide(1);
    };

    const handleNextSlide = () => {
        setSlide((prev) => prev + 1);
    };

    const handlePreviousSlide = () => {
        setSlide((prev) => Math.max(prev - 1, 0));
    };
    
    const handleComplete = () => {
        console.log("Registration complete");
        // TODO: redirect to dashboard or trigger confirmation
        //Post to account db and refresh to login
        setSlide(3);
        setTimeout(() => {
            window.location.href = "/";  
        }, 2000);    
    };

  return (
    <div className="registration-flow-registration">
      {slide === 0 && (
        <div className="form-group-registration">
          <h2>Are you joining us as a...</h2>
          <div className="button-group-registration">
            <button onClick={() => handleUsertypeSelect("student")}>Student</button>
            <button onClick={() => handleUsertypeSelect("nonprofit")}>Nonprofit</button>
          </div>
        </div>
      )}

        {slide === 1 && usertype === "student" && (
        <form className="form-registration" onSubmit={(e) => { e.preventDefault(); handleNextSlide(); }}>
            <h2>Tell us about yourself..</h2>
            <input name="fullname" placeholder="Full Name" required />
            <input name="age" type="number" placeholder="Age" required />
            <input name="school" placeholder="School" required />
            <textarea name="bio" placeholder="Personal Bio" required />
            
            <div className="form-nav-buttons">
            <button type="button" onClick={handlePreviousSlide}>Back</button>
            <button type="submit">Next</button>
            </div>
        </form>
        )}


        {slide === 1 && usertype === "nonprofit" && (
        <form className="form-registration" onSubmit={(e) => { e.preventDefault(); handleNextSlide(); }}>
            <h2>Nonprofit Info</h2>
            <input name="name" placeholder="Nonprofit Name" required />
            <input name="location" placeholder="Location" required />
            <div>
                <p className = "cause-prompt">Select your cause(s):</p>
                <div className="interests-grid">
                    {[
                    "Animals",
                    "Children & Youth",
                    "Cultural & Education",
                    "Disabilities",
                    "Disaster Relief",
                    "Elderly",
                    "Environment",
                    "Global – Locale Based",
                    "Health & Disease",
                    "Homeless",
                    "Hunger & Poverty",
                    "International",
                    "Military Charities",
                    "Racial Equality",
                    "Service & Benevolence Clubs",
                    "Women's Issues"
                    ].map((cause) => (
                    <button
                        key={cause}
                        type="button"
                        className={`interest-btn ${selectedCauses.includes(cause) ? 'selected' : ''}`}
                        onClick={() => toggleCause(cause)}
                    >
                        {selectedCauses.includes(cause) ? cause : `+ ${cause}`}
                    </button>
                    ))}
                </div>
            </div>
            <textarea name="mission" placeholder="Mission Statement" required />
            
            <div className="form-nav-buttons">
            <button type="button" onClick={handlePreviousSlide}>Back</button>
            <button type="submit" onClick = {handleComplete}>Finish</button>
            </div>
        </form>
        )}


        {slide === 2 && usertype === "student" && (
        <form className="form-registration" onSubmit={(e) => { e.preventDefault(); handleComplete(); }}>
            <h2>What are your interests and passions?</h2>
            <div className="interests-grid">
            {[
                "Animals", "Art and Culture", "Education", "Engineering", "Environment",
                "Health & Wellness", "Mathematics", "Science", "Social Justice",
                "Sports and Fitness", "Technology"
            ].map((interest) => (
                <button
                key={interest}
                type="button"
                className={`interest-btn ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                onClick={() => toggleInterest(interest)}
                >
                {selectedInterests.includes(interest) ? interest : `+ ${interest}`}
                </button>
            ))}
            </div>
            <div className="form-nav-buttons">
            <button type="button" onClick={handlePreviousSlide}>Back</button>
            <button type="submit" className="complete-registration" onClick = {handleComplete}>Complete Registration</button>
            </div>
        </form>
        )}




    {slide === 3 && (
        <div className="redirect-message-registration">
          <p>Redirecting to you login...</p>
        </div>
      )}
    </div>
  );
};

export default Registration;
