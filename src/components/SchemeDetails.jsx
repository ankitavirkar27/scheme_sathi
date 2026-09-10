function SchemeDetails({ scheme, onBack }) {

  if (!scheme) {
    return (
      <div>
        <p>No scheme selected.</p>
        <button className="primary-button" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="details-page">

      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="details-header">
        <div className="scheme-icon large">₹</div>
        <div>
          <h1>{scheme.title}</h1>
          <p>{scheme.description}</p>
        </div>
      </div>

      <div className="details-stats">
        <div>
          <span>Maximum Loan</span>
          <strong>{scheme.loan}</strong>
        </div>
        <div>
          <span>Interest Rate</span>
          <strong>{scheme.interest}</strong>
        </div>
        <div>
          <span>Tenure</span>
          <strong>{scheme.tenure}</strong>
        </div>
      </div>

      <div className="details-section">
        <h2>Eligibility Criteria</h2>
        <ul>
          <li>Annual family income below ₹5,00,000</li>
          <li>Age between 18 and 45 years</li>
          <li>Must belong to a marginalized/eligible category</li>
          <li>No existing default on government loan schemes</li>
        </ul>
      </div>

      <div className="details-section">
        <h2>Documents Required</h2>
        <ul>
          <li>Aadhaar Card</li>
          <li>Income Certificate</li>
          <li>Caste/Category Certificate (if applicable)</li>
          <li>Project Proposal / Business Plan</li>
        </ul>
      </div>

      <button className="primary-button full">
        Apply for this Scheme
      </button>

    </div>
  );
}

export default SchemeDe
