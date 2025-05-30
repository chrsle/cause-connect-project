import React, { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile } from '../utils/profile-utils'; // import the utils file you created

type StudentProfile = {
  full_name: string; //steven
  age: number;
  school: string;
  bio: string;
  interests: string;
};

type NonprofitProfile = {
  nonprofit_name: string;
  location: string;
  category: string;
  statement: string;
};

type Profile = StudentProfile | NonprofitProfile;

const isStudentProfile = (profile: Profile): profile is StudentProfile => {
  return 'full_name' in profile;
};

const ProfileEditPage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;

    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: name === 'age' ? Number(value) : value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateUserProfile(profile);
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!profile) return <div>No profile data available.</div>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        {isStudentProfile(profile) ? (
          <>
            <label>
              Full Name:
              <input
                type="text"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                required
              />
            </label>
            <br />
            <label>
              Age:
              <input
                type="number"
                name="age"
                value={profile.age || ''}
                onChange={handleChange}
                min={0}
                required
              />
            </label>
            <br />
            <label>
              School:
              <input
                type="text"
                name="school"
                value={profile.school || ''}
                onChange={handleChange}
                required
              />
            </label>
            <br />
            <label>
              Bio:
              <textarea
                name="bio"
                value={profile.bio || ''}
                onChange={handleChange}
                rows={3}
              />
            </label>
            <br />
            <label>
              Interests:
              <input
                type="text"
                name="interests"
                value={profile.interests || ''}
                onChange={handleChange}
              />
            </label>
          </>
        ) : (
          <>
            <label>
              Nonprofit Name:
              <input
                type="text"
                name="nonprofit_name"
                value={profile.nonprofit_name}
                onChange={handleChange}
                required
              />
            </label>
            <br />
            <label>
              Location:
              <input
                type="text"
                name="location"
                value={profile.location || ''}
                onChange={handleChange}
                required
              />
            </label>
            <br />
            <label>
              Category:
              <input
                type="text"
                name="category"
                value={profile.category || ''}
                onChange={handleChange}
                required
              />
            </label>
            <br />
            <label>
              Statement:
              <textarea
                name="statement"
                value={profile.statement || ''}
                onChange={handleChange}
                rows={3}
              />
            </label>
          </>
        )}

        <br />
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ProfileEditPage;
