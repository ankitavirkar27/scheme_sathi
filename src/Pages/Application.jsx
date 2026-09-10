import { useEffect, useState } from "react";
import { getUserApplications } from "../firebase/applicationService";

const statusOrder = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "COMPLETED"];

function Applications({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getUserApplications(user.uid);
        setApplications(result || []);
      } catch (err) {
        setError(err.message || "Unable to load your applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  if (loading) {
    return <div className="empty-result"><h2>Loading your applications...</h2></div>;
  }

  if (error) {
    return <div className="empty-result"><h2>Unable to load applications</h2><p>{error}</p></div>;
  }

  if (!applications.length) {
    return (
      <div>
        <div className="page-heading">
          <p className="eyebrow">APPLICATION TRACKING</p>
          <h1>My Applications</h1>
          <p>Track the progress of your submitted schemes and follow-ups.</p>
        </div>
        <div className="empty-result"><h2>No applications yet</h2><p>Submitted schemes will appear here with their status timeline.</p></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <p className="eyebrow">APPLICATION TRACKING</p>
        <h1>My Applications</h1>
        <p>Track the progress of your submitted schemes and follow-ups.</p>
      </div>

      <div className="application-list">
        {applications.map((application) => {
          const currentIndex = statusOrder.indexOf(application.status || "DRAFT");
          const activeIndex = currentIndex >= 0 ? currentIndex : 0;

          return (
            <div className="application-card" key={application.id}>
              <div className="application-header">
                <div>
                  <h3>{application.schemeName || "Scheme Application"}</h3>
                  <p>Application ID: {application.applicationNumber || application.id}</p>
                </div>
                <span className="application-status">{application.status || "DRAFT"}</span>
              </div>

              <div className="timeline">
                {statusOrder.map((status, index) => (
                  <div key={status} className={`timeline-step ${index <= activeIndex ? "active" : ""}`}>
                    <span>{status}</span>
                  </div>
                ))}
              </div>

              <div className="application-meta">
                <div>
                  <span>Submitted</span>
                  <strong>{application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : "Not submitted"}</strong>
                </div>
                <div>
                  <span>Remarks</span>
                  <strong>{application.remarks || "No remarks yet"}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Applications;
