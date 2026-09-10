import { useState } from "react";

function Calculator() {

  const [loan, setLoan] = useState(500000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(7);

  const calculateEMI = () => {

    const principal = Number(loan);

    const monthlyRate =
      Number(rate) / 12 / 100;

    const months =
      Number(years) * 12;

    const emi =
      principal *
      monthlyRate *
      Math.pow(1 + monthlyRate, months) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return Math.round(emi);
  };

  const emi = calculateEMI();

  const totalPayment =
    emi * Number(years) * 12;

  const totalInterest =
    totalPayment - Number(loan);


  return (
    <div>

      <div className="page-heading">

        <p className="eyebrow">
          FINANCIAL PLANNER
        </p>

        <h1>
          EMI Calculator
        </h1>

        <p>
          Estimate your monthly repayment for a
          concessional government loan.
        </p>

      </div>


      <div className="calculator">

        <div className="calculator-form">

          <h2>
            Loan Details
          </h2>


          <div className="form-group">

            <label>
              Loan Amount
            </label>

            <input
              type="number"
              value={loan}
              onChange={(e) =>
                setLoan(e.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              Interest Rate (%)
            </label>

            <input
              type="number"
              value={rate}
              onChange={(e) =>
                setRate(e.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              Loan Tenure (Years)
            </label>

            <input
              type="number"
              value={years}
              onChange={(e) =>
                setYears(e.target.value)
              }
            />

          </div>

        </div>


        <div className="calculator-result">

          <p>
            Estimated Monthly EMI
          </p>

          <h1>
            ₹{emi.toLocaleString("en-IN")}
          </h1>

          <div className="calculator-line">
            <span>Principal</span>
            <strong>
              ₹{Number(loan).toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="calculator-line">
            <span>Total Interest</span>
            <strong>
              ₹{totalInterest.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="calculator-line">
            <span>Total Payment</span>
            <strong>
              ₹{totalPayment.toLocaleString("en-IN")}
            </strong>
          </div>

          <button className="primary-button full">
            Download Repayment Plan
          </button>

        </div>

      </div>

    </div>
  );
}

export default Calculator;
