import { useEffect, useMemo, useState } from "react";
import StatCard from "../Components/StatCard";
import SchemeCard from "../Components/SchemeCard";
import SchemeAIChatbot from "../Components/SchemeAIChatbot";
import SchemeSeedButton from "../Components/SchemeSeedButton";

import { getUserProfile } from "../firebase/userService";
import { getAllSchemes } from "../firebase/schemeService";
import {
  getChannelPartners,
  sortPartnersByDistance,
} from "../firebase/partnerService";
import { generateSchemeRecommendations } from "../firebase/recommendationService";
import demoSchemes from "../data/schemes";
import demoPartners from "../data/partners";
import { CircleCheck, IndianRupee, MapPinned, ScanSearch } from "lucide-react";


// ======================================================
// DASHBOARD COMPONENT
// ======================================================

function Dashboard({
  user,
  onViewScheme,
  onNavigate,
}) {
  // ----------------------------------------------------
  // STATE
  // ----------------------------------------------------

  const [profile, setProfile] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [partners, setPartners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ======================================================
  // LOAD DATA FROM FIRESTORE
  // ======================================================

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      // No authenticated user
      if (!user?.uid) {
        if (mounted) {
          setProfile({});
          setSchemes(demoSchemes);
          setPartners(demoPartners);
          setLoading(false);
        }

        return;
      }

      try {
        if (mounted) {
          setLoading(true);
          setError("");
        }

        const [
          userProfileResult,
          availableSchemesResult,
          availablePartnersResult,
        ] = await Promise.allSettled([
          getUserProfile(user.uid),
          getAllSchemes(),
          getChannelPartners(),
        ]);

        if (!mounted) {
          return;
        }

        const userProfile =
          userProfileResult.status === "fulfilled"
            ? userProfileResult.value || {}
            : {};

        const availableSchemes =
          availableSchemesResult.status === "fulfilled" &&
          Array.isArray(availableSchemesResult.value)
            ? availableSchemesResult.value
            : [];

        const availablePartners =
          availablePartnersResult.status === "fulfilled" &&
          Array.isArray(availablePartnersResult.value)
            ? availablePartnersResult.value
            : [];

        setProfile(userProfile);
        // Fall back to the prototype catalogue until Firestore is seeded.
        setSchemes(availableSchemes.length ? availableSchemes : demoSchemes);
        setPartners(availablePartners.length ? availablePartners : demoPartners);

        const hasSuccessfulLoad =
          userProfileResult.status === "fulfilled" ||
          availableSchemesResult.status === "fulfilled" ||
          availablePartnersResult.status === "fulfilled";

        if (!hasSuccessfulLoad) {
          const failureReason =
            userProfileResult.status === "rejected"
              ? userProfileResult.reason
              : availableSchemesResult.status === "rejected"
                ? availableSchemesResult.reason
                : availablePartnersResult.reason;

          setError(
            failureReason?.message ||
              "Unable to load dashboard data."
          );
        }
      } catch (err) {
        console.error(
          "Dashboard Firebase error:",
          err
        );

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load dashboard data."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [user?.uid]);


  // ======================================================
  // USER NAME
  // ======================================================

  const userName = useMemo(() => {
    if (profile?.name) {
      return profile.name;
    }

    if (user?.displayName) {
      return user.displayName;
    }

    if (user?.email) {
      return user.email.split("@")[0];
    }

    return "User";
  }, [
    profile?.name,
    user?.displayName,
    user?.email,
  ]);


  // ======================================================
  // AGE CALCULATOR
  // ======================================================

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) {
      return 30;
    }

    let birthDate;

    // Firebase Firestore Timestamp
    if (
      typeof dateOfBirth === "object" &&
      typeof dateOfBirth.toDate === "function"
    ) {
      birthDate = dateOfBirth.toDate();
    }

    // JavaScript Date
    else if (dateOfBirth instanceof Date) {
      birthDate = dateOfBirth;
    }

    // String
    else {
      birthDate = new Date(dateOfBirth);
    }

    // Invalid date
    if (
      Number.isNaN(
        birthDate.getTime()
      )
    ) {
      return 30;
    }

    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() <
          birthDate.getDate()
      )
    ) {
      age--;
    }

    return Math.max(age, 0);
  };


  // ======================================================
  // SCHEME RECOMMENDATIONS
  // ======================================================

  const recommendations = useMemo(() => {
    if (
      !profile ||
      !Array.isArray(schemes) ||
      schemes.length === 0
    ) {
      return [];
    }

    try {
      // Calculate applicant age
      const age = calculateAge(
        profile.dateOfBirth
      );

      // Income
      const income = Number(
        profile.annualIncome || 0
      );

      // Applicant information
      const applicant = {
        age,

        income,

        category:
          profile.category ||
          "General",

        education:
          profile.education ||
          "",

        state:
          profile.state ||
          "",

        occupation:
          profile.occupation ||
          "",
      };


      // ------------------------------------------------
      // Project information
      // ------------------------------------------------

      const projectType =
        profile.projectType ||
        "Retail";

      const projectCost = Number(
        profile.projectCost ||
          250000
      );

      const requiredLoan = Number(
        profile.requiredLoan ||
          projectCost ||
          250000
      );

      const purpose =
        profile.purpose ||
        "business";


      const project = {
        projectType,
        projectCost,
        requiredLoan,
        purpose,
      };


      // ------------------------------------------------
      // Generate recommendations
      // ------------------------------------------------

      const result =
        generateSchemeRecommendations(
          applicant,
          project,
          schemes
        );


      if (!Array.isArray(result)) {
        return [];
      }


      // ------------------------------------------------
      // Sort by recommendation score
      // ------------------------------------------------

      return [...result]
        .sort(
          (a, b) =>
            Number(b?.score || 0) -
            Number(a?.score || 0)
        )
        .slice(0, 10);

    } catch (err) {
      console.error(
        "Recommendation error:",
        err
      );

      return [];
    }
  }, [profile, schemes]);


  // ======================================================
  // BEST INTEREST RATE
  // ======================================================

  const bestInterestRate = useMemo(() => {
    if (!schemes.length) {
      return "—";
    }

    const rates = schemes
      .map((scheme) =>
        Number(scheme?.interestRate)
      )
      .filter(
        (rate) =>
          Number.isFinite(rate) &&
          rate > 0
      );

    if (!rates.length) {
      return "—";
    }

    const lowestRate = Math.min(
      ...rates
    );

    return `${lowestRate}%`;
  }, [schemes]);


  // ======================================================
  // MAXIMUM POTENTIAL FUNDING
  // ======================================================

  const fundingTotal = useMemo(() => {
    if (!schemes.length) {
      return "₹0";
    }

    const loanAmounts = schemes
      .map((scheme) =>
        Number(
          scheme?.maximumLoanAmount || 0
        )
      )
      .filter(
        (amount) =>
          Number.isFinite(amount) &&
          amount > 0
      );

    if (!loanAmounts.length) {
      return "₹0";
    }

    const maximumLoan = Math.max(
      ...loanAmounts
    );


    // Crore
    if (maximumLoan >= 10000000) {
      return `₹${(
        maximumLoan / 10000000
      ).toFixed(1)} Cr`;
    }


    // Lakh
    if (maximumLoan >= 100000) {
      return `₹${(
        maximumLoan / 100000
      ).toFixed(1)} L`;
    }


    // Normal amount
    return `₹${maximumLoan.toLocaleString(
      "en-IN"
    )}`;
  }, [schemes]);


  // ======================================================
  // NEAREST CHANNEL PARTNERS
  // ======================================================

  const nearestPartners = useMemo(() => {
    if (!partners.length) {
      return [];
    }

    /*
      If latitude/longitude are not available
      in the user profile, Delhi coordinates
      are used only as a fallback.

      Later you can replace this with
      browser geolocation.
    */

    const latitude = Number(
      profile?.latitude ?? 28.6139
    );

    const longitude = Number(
      profile?.longitude ?? 77.2090
    );


    try {
      const sorted =
        sortPartnersByDistance(
          partners,
          latitude,
          longitude
        );

      if (!Array.isArray(sorted)) {
        return partners.slice(0, 4);
      }

      return sorted.slice(0, 4);

    } catch (err) {
      console.error(
        "Partner sorting error:",
        err
      );

      return partners.slice(0, 4);
    }
  }, [
    partners,
    profile?.latitude,
    profile?.longitude,
  ]);


  // ======================================================
  // NAVIGATION HELPERS
  // ======================================================

  const goToSchemeMatcher = () => {
    if (typeof onNavigate === "function") {
      onNavigate("Scheme Matcher");
    }
  };


  const viewScheme = (scheme) => {
    if (typeof onViewScheme === "function") {
      onViewScheme(scheme);
    }
  };


  // ======================================================
  // LOADING UI
  // ======================================================

  if (loading) {
    return (
      <div className="empty-result">

        <div className="ai-circle">
          <ScanSearch size={28} />
        </div>

        <h2>
          Loading your dashboard...
        </h2>

        <p>
          Fetching your profile,
          schemes and nearby partners.
        </p>

      </div>
    );
  }


  // ======================================================
  // ERROR UI
  // ======================================================

  if (error) {
    return (
      <div className="empty-result">

        <div className="ai-circle">
          !
        </div>

        <h2>
          Unable to load dashboard
        </h2>

        <p>
          {error}
        </p>

        <button
          className="primary-button"
          onClick={() =>
            window.location.reload()
          }
        >
          Try Again
        </button>

      </div>
    );
  }


  // ======================================================
  // MAIN DASHBOARD
  // ======================================================

  return (
    <div className="dashboard">


      {/* =================================================
          WELCOME SECTION
      ================================================= */}

      <section className="welcome">

        <div>

          <h1>
            Welcome back, {userName}
          </h1>

          <p>
            Find the right government
            scheme for your business,
            education or financial needs.
          </p>

        </div>


        <button
          className="primary-button"
          onClick={goToSchemeMatcher}
        >
          <ScanSearch size={16} /> Find my scheme
        </button>

      </section>



      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="stats-grid">

        <StatCard
          title="Eligible Schemes"
          value={String(
            recommendations.length
          ).padStart(2, "0")}
          subtitle="Based on your profile"
          icon={<CircleCheck size={19} />}
        />


        <StatCard
          title="Potential Funding"
          value={fundingTotal}
          subtitle="Maximum available amount"
          icon={<IndianRupee size={19} />}
        />


        <StatCard
          title="Best Interest Rate"
          value={bestInterestRate}
          subtitle="Lowest available rate"
          icon="%"
        />


        <StatCard
          title="Nearby Partners"
          value={String(
            nearestPartners.length
          ).padStart(2, "0")}
          subtitle="Closest channel partners"
          icon={<MapPinned size={19} />}
        />

      </section>



      {/* =================================================
          RECOMMENDED SCHEMES
      ================================================= */}

      <section className="section">

        <div className="section-heading">

          <div>

            <h2>
              AI Recommended Schemes
            </h2>

            <p>
              Personalized recommendations
              based on your profile and
              financial requirements.
            </p>

          </div>


          <button
            className="text-button"
            onClick={goToSchemeMatcher}
          >
            View All →
          </button>

        </div>



        <div className="scheme-grid">

          {recommendations.length > 0 ? (

            recommendations.map(
              (scheme, index) => {

                const schemeId =
                  scheme?.id ||
                  scheme?.schemeId ||
                  `scheme-${index}`;


                const maximumLoan =
                  Number(
                    scheme?.maximumLoanAmount ||
                    0
                  );


                const loanText =
                  scheme?.loan || (maximumLoan > 0
                    ? `₹${maximumLoan.toLocaleString(
                        "en-IN"
                      )}`
                    : "Amount varies");


                const interestText =
                  scheme?.interest || (scheme?.interestRate !==
                  undefined &&
                  scheme?.interestRate !==
                  null &&
                  scheme?.interestRate !== ""
                    ? `${scheme.interestRate}%`
                    : "Varies");


                const tenureText =
                  scheme?.tenure || (scheme?.tenureYears
                    ? `${scheme.tenureYears} Years`
                    : "Flexible");


                return (
                  <SchemeCard
                    key={schemeId}

                    scheme={scheme}

                    title={
                      scheme?.name ||
                      "Government Scheme"
                    }

                    description={
                      scheme?.description ||
                      "Government financial assistance scheme."
                    }

                    loan={loanText}

                    interest={interestText}

                    tenure={tenureText}

                    recommended={
                      scheme?.recommended || Number(
                        scheme?.score || 0
                      ) >= 70
                    }

                    onViewDetails={() =>
                      viewScheme(scheme)
                    }
                  />
                );
              }
            )

          ) : (

            <div className="empty-result">
              
              {schemes.length === 0 && (
                <SchemeSeedButton />
              )}

              <div className="ai-circle">
                <ScanSearch size={28} />
              </div>

              <h2>
                No matched schemes yet
              </h2>

              <p>
                Complete your profile and
                use the Scheme Matcher to
                find suitable government
                schemes.
              </p>

              <button
                className="primary-button"
                onClick={goToSchemeMatcher}
              >
                Start Scheme Matcher
              </button>

            </div>

          )}

        </div>

      </section>



      {/* =================================================
          SCHEME MATCHER CTA
      ================================================= */}

      <section className="quick-section">

        <div className="quick-card">

          <span>
            <ScanSearch size={26} />
          </span>


          <div>

            <h3>
              Not sure which scheme is right?
            </h3>

            <p>
              Answer a few simple questions
              and Scheme Sathi will find
              suitable government schemes
              for you.
            </p>

          </div>


          <button
            className="primary-button"
            onClick={goToSchemeMatcher}
          >
            <ScanSearch size={16} /> Start scheme matcher
          </button>

        </div>

      </section>



      {/* =================================================
          NEARBY PARTNERS
      ================================================= */}

      <section className="section">

        <div className="section-heading">

          <div>

            <h2>
              Nearby Channel Partners
            </h2>

            <p>
              Find financial institutions
              and support partners near you.
            </p>

          </div>

        </div>


        {nearestPartners.length > 0 ? (

          <div className="partner-grid">

            {nearestPartners.map(
              (partner, index) => (

                <div
                  className="partner-card"
                  key={
                    partner?.id ||
                    partner?.partnerId ||
                    `partner-${index}`
                  }
                >

                  <div className="partner-icon">
                    <MapPinned size={20} />
                  </div>


                  <div>

                    <h3>
                      {partner?.name ||
                        "Channel Partner"}
                    </h3>


                    <p>
                      {partner?.type ||
                        "Financial Partner"}
                    </p>


                    <p>
                      {partner?.city ||
                        partner?.district ||
                        partner?.state ||
                        "Location unavailable"}
                    </p>


                    {partner?.phone && (
                      <p>
                        {partner.phone}
                      </p>
                    )}

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="empty-result">

            <h3>
              No channel partners found
            </h3>

            <p>
              Partner information will
              appear here once available.
            </p>

          </div>

        )}

      </section>

      <SchemeAIChatbot profile={profile || {}} recommendations={recommendations} schemes={schemes} />

    </div>
  );
}


// ======================================================
// EXPORT
// ======================================================

export default Dashboard;
