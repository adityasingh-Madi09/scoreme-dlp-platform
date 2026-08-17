import { useEffect } from 'react';
import { FileText, Landmark } from 'lucide-react';
import { Button, SectionCard } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import { LOAN_OFFER_SUPPORT_EMAIL, formatSanctionDate, generateApplicationId } from '../../mockLoanOffer.constants';
import './Screen10LoanOffer.css';

const formatRupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

interface Screen10LoanOfferProps {
  /** Only needed for the "Reject Offer" terminal state, so the user has a
   *  real way back to the Hub without relying solely on the persistent
   *  header Exit button — same pattern as `MoreScreensPlaceholder`'s
   *  `onBackToRoleSelect`. */
  onExit: () => void;
}

/**
 * SUPERSEDED — not imported or rendered anywhere in the current app.
 * `CustomerFlowContainer` uses `Step5LoanOffer` (the slider-adjustable
 * rebuild) instead; this file is a leftover from the original 14-screen
 * build (see `docs/journey-01-idbi-personal-loan-plan.md`) and should be
 * deleted from the project. Kept compiling (rather than left broken)
 * purely so an unused file can't break `tsc -b`/the Vercel build again —
 * see the fix note in that same plan doc for the incident this caused.
 *
 * Customer Flow — Screen 10 (Loan Offer). No live application scoring
 * happens here — a mock application ID and sanction date are generated
 * once on first mount; the loan terms themselves now come from context
 * (`data.loanOfferAmount` etc., pre-seeded in `useCustomerFlow.ts`'s
 * `initialCustomerFlowData`), same source `Step5LoanOffer` reads from.
 * Alongside a short Key-Fact-Statement-style disclosure box (APR,
 * cooling-off period, grievance contact) modelled on real RBI Digital
 * Lending Guidelines practice, adapted here as realistic prototype content
 * rather than actual legal certification.
 *
 * "Accept Offer" advances to Screen 11. "Reject Offer" does not — it shows
 * a graceful terminal state in-place (no dead end, no crash), with an exit
 * affordance back to the Hub.
 */
function Screen10LoanOffer({ onExit }: Screen10LoanOfferProps) {
  const { data, updateData, goNext } = useCustomerFlow();

  // Generate the mock application ID + sanction date exactly once per
  // flow, the first time this screen mounts, and persist them in context
  // so returning to this screen (or a later screen reading them) sees the
  // same values rather than a fresh one each time.
  useEffect(() => {
    if (data.applicationId) return;
    updateData({
      applicationId: generateApplicationId(),
      loanOfferSanctionDate: formatSanctionDate(),
    });
  }, [data.applicationId, updateData]);

  const applicantName = data.preferredCardName.trim() || 'Applicant';

  const handleAccept = () => {
    updateData({ loanOfferOutcome: 'Accepted' });
    goNext();
  };

  const handleReject = () => {
    updateData({ loanOfferOutcome: 'Rejected' });
  };

  if (data.loanOfferOutcome === 'Rejected') {
    return (
      <section className="screen-loan-offer">
        <div className="screen-loan-offer-card screen-loan-offer-rejected">
          <h1 className="screen-loan-offer-heading">Offer Declined</h1>
          <p className="screen-loan-offer-subtext">
            Your application will not proceed further. You can return to the
            Hub using the Exit button above, or the button below.
          </p>
          <div className="screen-loan-offer-actions">
            <Button type="button" variant="secondary" onClick={onExit}>
              Back to Hub
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="screen-loan-offer">
      <div className="screen-loan-offer-card">
        <p className="screen-loan-offer-greeting">
          Dear {applicantName}, your loan application{' '}
          <strong>{data.applicationId || 'Generating…'}</strong> has been created.
        </p>

        <div className="screen-loan-offer-meta-row">
          <div className="screen-loan-offer-meta-item">
            <span className="screen-loan-offer-meta-label">Sanction Date</span>
            <span className="screen-loan-offer-meta-value">
              {data.loanOfferSanctionDate || 'Generating…'}
            </span>
          </div>
          <div className="screen-loan-offer-meta-item">
            <span className="screen-loan-offer-meta-label">Processing Fee</span>
            <span className="screen-loan-offer-meta-value">
              {formatRupees(data.loanOfferProcessingFee)}
            </span>
          </div>
        </div>

        <SectionCard icon={<Landmark size={16} />} title="Loan Details">
          <div className="screen-loan-offer-grid">
            <div className="screen-loan-offer-tile">
              <span className="screen-loan-offer-tile-label">Loan Amount</span>
              <span className="screen-loan-offer-tile-value">
                {formatRupees(data.loanOfferAmount)}
              </span>
            </div>
            <div className="screen-loan-offer-tile">
              <span className="screen-loan-offer-tile-label">EMI</span>
              <span className="screen-loan-offer-tile-value">{formatRupees(data.loanOfferEmi)}</span>
            </div>
            <div className="screen-loan-offer-tile">
              <span className="screen-loan-offer-tile-label">Loan Tenure</span>
              <span className="screen-loan-offer-tile-value">
                {data.loanOfferTenureMonths} months
              </span>
            </div>
            <div className="screen-loan-offer-tile">
              <span className="screen-loan-offer-tile-label">Interest Rate</span>
              <span className="screen-loan-offer-tile-value">
                {data.loanOfferInterestRatePercent}% p.a.
              </span>
            </div>
          </div>
          <p className="screen-loan-offer-disclaimer">
            *Actual EMI may differ based on the date of loan disbursement.
          </p>
        </SectionCard>

        <SectionCard icon={<FileText size={16} />} title="Key Fact Statement">
          <div className="screen-loan-offer-kfs-apr">
            <span className="screen-loan-offer-kfs-apr-label">
              Annual Percentage Rate (APR)
            </span>
            <span className="screen-loan-offer-kfs-apr-value">
              {data.loanOfferAprPercent}% p.a.
            </span>
          </div>
          <p className="screen-loan-offer-kfs-line">
            APR reflects the true annualised cost of this loan, including the
            processing fee — slightly higher than the flat interest rate
            above.
          </p>
          <p className="screen-loan-offer-kfs-line">
            You may cancel this loan within 3 days of disbursal by repaying
            only the principal amount, with no additional charges.
          </p>
          <p className="screen-loan-offer-kfs-line">
            For queries or grievances, contact{' '}
            <a href={`mailto:${LOAN_OFFER_SUPPORT_EMAIL}`}>{LOAN_OFFER_SUPPORT_EMAIL}</a>.
          </p>
        </SectionCard>

        <div className="screen-loan-offer-actions">
          <Button
            type="button"
            variant="secondary"
            className="screen-loan-offer-reject-btn"
            onClick={handleReject}
          >
            Reject Offer
          </Button>
          <Button type="button" onClick={handleAccept}>
            Accept Offer
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Screen10LoanOffer;
