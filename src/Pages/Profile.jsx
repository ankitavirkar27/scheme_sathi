import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../firebase/userService";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  category: "",
  annualIncome: "",
  education: "",
  occupation: "",
  state: "",
  district: "",
  city: "",
  pincode: "",
};

function Profile({ user }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setForm({
            ...initialForm,
            ...profile,
            email: profile.email || user.email || "",
            annualIncome: profile.annualIncome || "",
          });
        } else {
          setForm({
            ...initialForm,
            name: user.displayName || "",
            email: user.email || "",
          });
        }
      } catch (err) {
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user?.uid) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      await updateUserProfile(user.uid, form);
      setSuccess("Profile saved successfully — your matches are now more personalized.");
      window.setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="empty-result"><h2>Loading profile...</h2></div>;
  }

  return (
    <div>
      <div className="page-heading">
        <p className="eyebrow">MY PROFILE</p>
        <h1>Applicant Profile</h1>
        <p>Your information helps Scheme Sathi find relevant financial schemes.</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">{(form.name || user?.displayName || "U").charAt(0).toUpperCase()}</div>
        <div>
          <h2>{form.name || "Applicant"}</h2>
          <p>{form.occupation || "Entrepreneur"}</p>
        </div>
      </div>

      {error && <p className="auth-message error">{error}</p>}
      {success && <div className="toast success-toast" role="status">✓ {success}</div>}

      <div className="profile-form-grid">
        <div className="form-group"><label>Name</label><input name="name" value={form.name} onChange={handleChange} /></div>
        <div className="form-group"><label>Email</label><input name="email" value={form.email} onChange={handleChange} /></div>
        <div className="form-group"><label>Phone</label><input name="phone" value={form.phone} onChange={handleChange} /></div>
        <div className="form-group"><label>Date of Birth</label><input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} /></div>
        <div className="form-group"><label>Gender</label><select name="gender" value={form.gender} onChange={handleChange}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
        <div className="form-group"><label>Category</label><select name="category" value={form.category} onChange={handleChange}><option value="">Select</option><option value="General">General</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option><option value="EWS">EWS</option></select></div>
        <div className="form-group"><label>Annual Income</label><input type="number" name="annualIncome" value={form.annualIncome} onChange={handleChange} /></div>
        <div className="form-group"><label>Education</label><select name="education" value={form.education} onChange={handleChange}><option value="">Select</option><option value="School">School</option><option value="College">College</option><option value="Graduate">Graduate</option><option value="Post Graduate">Post Graduate</option></select></div>
        <div className="form-group"><label>Occupation</label><input name="occupation" value={form.occupation} onChange={handleChange} /></div>
        <div className="form-group"><label>State</label><input name="state" value={form.state} onChange={handleChange} /></div>
        <div className="form-group"><label>District</label><input name="district" value={form.district} onChange={handleChange} /></div>
        <div className="form-group"><label>City</label><input name="city" value={form.city} onChange={handleChange} /></div>
        <div className="form-group"><label>Pincode</label><input name="pincode" value={form.pincode} onChange={handleChange} /></div>
      </div>

      <button className="primary-button" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button>
    </div>
  );
}

export default Profile;
