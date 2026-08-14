import { useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { FileText, Landmark } from 'lucide-react';
import { Button, SectionCard } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import {
  LOAN_AMOUNT_STEP,
  LOAN_ELIGIBLE_MAX_AMOUNT,
  LOAN_MAX_TENURE_MONTHS,
  LOAN_MIN_AMOUNT,
  LOAN_MIN_TENURE_MONTHS,
  LOAN_OFFER_SUPPORT_EMAIL,
  LOAN_TENURE_STEP_MONTHS,
  calculateEmi,
  formatSanctionDate,
  generateApplicationId,
} from '../../mockLoanOffer.constants';
import './Step5LoanOffer.css';

const formatRupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

interface Step5LoanOfferProps {
  /** Only needed for the "Reject Offer" terminal state, so the customer
   *  has a real way back to the Hub without relying solely on the
   *  persistent header Exit button. */
  onExit: () => void;
}

/**
 * Step 5 — Loan Offer. A mock application ID and sanction date are
 * generated once on first mount (unchanged behavior from the old
 * Screen10LoanOffer). Loan Amount and Tenure are now customer-adjustable
 * via sliders, within fixed min/max bounds — EMI, total interest and APR
 * all recompute live via `calculateEmi` as either slider moves. Interest
 * rate and processing fee stay fixed for this prototype.
 *
 * "Accept Offer" advances to Step 6. "Reject Offer" shows a graceful
 * terminal state in-place rather than advancing.
 */
function Step5LoanOffer({ onExit }: Step5LoanOfferProps) {
  const { data, updateData, goNext } = useCustomerFlow();

  useEffect(() => {
    if (data.applicationId) return;
    updateData({
      applicationId: generateApplicationId(),
      loanOfferSanctionDate: formatSanctionDate(),
    });
  }, [data.applicationId, updateData]);

  const applicantName = data.preferredCardName.trim() || 'Applicant';

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const amount = Number(event.target.value);
    const calc = calculateEmi(amount, data.loanOfferTenureMonths);
    updateData({ loanOfferAmount: amount, loanOfferEmi: calc.emi, loanOfferAprPercent: calc.aprPercent });
  };

  const handleTenureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const tenure = Number(event.target.value);
    const calc = calculateEmi(data.loanOfferAmount, tenure);
    updateData({ loanOfferTenureMonths: tenure, loanOfferEmi: calc.emi, loanOfferAprPercent: calc.aprPercent });
  };

  const { totalInterest } = calculateEmi(data.loanOfferAmount, data.loanOfferTenureMonths, data.loanOfferInterestRatePercent);

  const handleAccept = () => {
    updateData({ loanOfferOutcome: 'Accepted' });
    goNext();
  };

  const handleReject = () => {
    updateData({ loanOfferOutcome: 'Rejected' });
  };

  if (data.loanOfferOutcome === 'Rejected') {
    return (
      <div className="step5-rejected">
        <h2 className="step5-rejected-heading">Offer Declined</h2>
        <p className="step5-rejected-text">
          Your application will not proceed further. You can return to the Hub using the Exit button above, or
          the button below.
        </p>
        <Button type="button" variant="secondary" onClick={onExit}>
          Back to Hub
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="step5-greeting-block">
        <p className="step5-greeting">
          Dear {applicantName}, your loan application{' '}
          <strong>{data.applicationId || 'Generating…'}</strong> has been created.
        </p>
        <div className="step5-meta-row">
          <div className="step5-meta-item">
            <span className="step5-meta-label">Sanction Date</span>
            <span className="step5-meta-value">{data.loanOfferSanctionDate || 'Generating…'}</span>
          </div>
          <div className="step5-meta-item">
            <span className="step5-meta-label">Processing Fee</span>
            <span className="step5-meta-value">{formatRupees(data.loanOfferProcessingFee)}</span>
          </div>
        </div>
      </div>

      <SectionCard icon={<Landmark size={16} />} title="Loan Details">
        <div className="step5-slider-block">
          <div className="step5-slider-header">
            <span className="step5-slider-label">Loan Amount</span>
            <span className="step5-slider-value">{formatRupees(data.loanOfferAmount)}</span>
          </div>
          <input
            type="range"
            className="step5-slider"
            min={LOAN_MIN_AMOUNT}
            max={LOAN_ELIGIBLE_MAX_AMOUNT}
            step={LOAN_AMOUNT_STEP}
            value={data.loanOfferAmount}
            onChange={handleAmountChange}
            aria-label="Loan Amount"
          />
          <div className="step5-slider-bounds">
            <span>Min: {formatRupees(LOAN_MIN_AMOUNT)}</span>
            <span>You're eligible for up to {formatRupees(LOAN_ELIGIBLE_MAX_AMOUNT)}</span>
          </div>
        </div>

        <div className="step5-slider-block">
          <div className="step5-slider-header">
            <span className="step5-slider-label">Tenure</span>
            <span className="step5-slider-value">{data.loanOfferTenureMonths} months</span>
          </div>
          <input
            type="range"
            className="step5-slider"
            min={LOAN_MIN_TENURE_MONTHS}
            max={LOAN_MAX_TENURE_MONTHS}
            step={LOAN_TENURE_STEP_MONTHS}
            value={data.loanOfferTenureMonths}
            onChange={handleTenureChange}
            aria-label="Tenure in months"
          />
          <div className="step5-slider-bounds">
            <span>Min: {LOAN_MIN_TENURE_MONTHS} months</span>
            <span>Max: {LOAN_MAX_TENURE_MONTHS} months</span>
          </div>
        </div>

        <div className="step5-summary-grid">
          <div className="step5-summary-tile">
            <span className="step5-summary-label">EMI</span>
            <span className="step5-summary-value">{formatRupees(data.loanOfferEmi)}</span>
          </div>
          <div className="step5-summary-tile">
            <span className="step5-summary-label">Total Interest</span>
            <span className="step5-summary-value">{formatRupees(totalInterest)}</span>
          </div>
          <div className="step5-summary-tile">
            <span className="step5-summary-label">Interest Rate</span>
            <span className="step5-summary-value">{data.loanOfferInterestRatePercent}% p.a.</span>
          </div>
        </div>
        <p className="step5-disclaimer">*Actual EMI may differ based on the date of loan disbursement.</p>
      </SectionCard>

      <SectionCard icon={<FileText size={16} />} title="Key Fact Statement">
        <div className="step5-kfs-apr">
          <span className="step5-kfs-apr-label">Annual Percentage Rate (APR)</span>
          <span className="step5-kfs-apr-value">{data.loanOfferAprPercent}% p.a.</span>
        </div>
        <p className="step5-kfs-line">
          APR reflects the true annualised cost of this loan, including the processing fee — slightly higher
          than the flat interest rate above.
        </p>
        <p className="step5-kfs-line">
          You may cancel this loan within 3 days of disbursal by repaying only the principal amount, with no
          additional charges.
        </p>
        <p className="step5-kfs-line">
          For queries or grievances, contact <a href={`mailto:${LOAN_OFFER_SUPPORT_EMAIL}`}>{LOAN_OFFER_SUPPORT_EMAIL}</a>.
        </p>
      </SectionCard>

      <div className="step5-actions">
        <Button type="button" variant="secondary" onClick={handleReject}>
          Reject Offer
        </Button>
        <Button type="button" onClick={handleAccept}>
          Accept Offer
        </Button>
      </div>
    </>
  );
}

export default Step5LoanOffer;
