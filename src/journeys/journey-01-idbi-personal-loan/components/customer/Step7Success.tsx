import { Button } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import type { CustomerFlowData } from '../../context/useCustomerFlow';
import './Step7Success.css';

const formatRupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

/** Builds the plain-text "Application Form" summary offered for download —
 *  a simple recap of the key data collected across the flow, not a real
 *  legal document. */
function buildApplicationSummaryText(data: CustomerFlowData): string {
  const fullName = [data.kycFirstName, data.kycMiddleName, data.kycLastName].filter(Boolean).join(' ').trim();
  const applicantName = data.preferredCardName.trim() || fullName || 'Applicant';

  const lines = [
    'ScoreMe DLP Platform — Personal Loan Application Summary',
    '(Prototype document — for demonstration purposes only, not a legal record.)',
    '',
    `Application ID: ${data.applicationId}`,
    `Sanction Date: ${data.loanOfferSanctionDate}`,
    '',
    'Applicant Details',
    '------------------',
    `Name: ${applicantName}`,
    `Mobile Number: ${data.mobileNumber ? `+91 ${data.mobileNumber}` : '—'}`,
    `Email: ${data.personalEmail || '—'}`,
    `PAN: ${data.panNumber || '—'}`,
    '',
    'Loan Terms',
    '----------',
    `Loan Amount: ${formatRupees(data.loanOfferAmount)}`,
    `Tenure: ${data.loanOfferTenureMonths} months`,
    `Interest Rate: ${data.loanOfferInterestRatePercent}% p.a.`,
    `Monthly EMI: ${formatRupees(data.loanOfferEmi)}`,
    `Processing Fee: ${formatRupees(data.loanOfferProcessingFee)}`,
    `Annual Percentage Rate (APR): ${data.loanOfferAprPercent}% p.a.`,
    '',
    'Status: Submitted — pending bank verification.',
  ];

  return lines.join('\n');
}

/** Triggers a real client-side download of `text` as a plain-text file, via
 *  a `Blob` + object URL + a temporary, invisible `<a download>` click — no
 *  PDF library or server round-trip involved. */
function downloadTextFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface Step7SuccessProps {
  /** Dedicated "Return to Hub" action, alongside the persistent header
   *  Exit button. */
  onExit: () => void;
}

/**
 * Step 7 — Success, the final screen of the flow. Restyled version of the
 * old Screen14Success — same content/behavior, adapted to sit directly
 * inside `JourneyLayout`'s long-form card (centered, no own card shell)
 * rather than a separate floating card. The celebratory badge/confetti
 * visual is plain inline SVG + CSS, using the platform's brand accent
 * colors decoratively (not on any interactive control).
 */
function Step7Success({ onExit }: Step7SuccessProps) {
  const { data } = useCustomerFlow();

  const handleDownload = () => {
    const filename = `${data.applicationId || 'loan-application'}-summary.txt`;
    downloadTextFile(filename, buildApplicationSummaryText(data));
  };

  return (
    <div className="step7-success">
      <div className="step7-badge-wrap" aria-hidden="true">
        <svg className="step7-badge-svg" viewBox="0 0 200 140" role="presentation">
          <circle className="step7-confetti step7-confetti-1" cx="24" cy="24" r="5" />
          <circle className="step7-confetti step7-confetti-2" cx="176" cy="20" r="4" />
          <circle className="step7-confetti step7-confetti-3" cx="150" cy="100" r="6" />
          <circle className="step7-confetti step7-confetti-4" cx="40" cy="108" r="4" />
          <circle className="step7-confetti step7-confetti-5" cx="14" cy="70" r="3" />
          <circle className="step7-confetti step7-confetti-6" cx="186" cy="66" r="3" />
          <rect
            className="step7-confetti step7-confetti-7"
            x="60"
            y="10"
            width="8"
            height="8"
            transform="rotate(20 64 14)"
          />
          <rect
            className="step7-confetti step7-confetti-8"
            x="132"
            y="118"
            width="7"
            height="7"
            transform="rotate(-15 135 121)"
          />
          <circle className="step7-badge-ring" cx="100" cy="70" r="38" />
          <circle className="step7-badge-fill" cx="100" cy="70" r="32" />
          <path
            className="step7-badge-check"
            d="M85 70 L96 82 L118 56"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="step7-heading">Congratulations!</h2>
      <p className="step7-body">
        Your personal loan application has been submitted successfully. Our team will follow up once your
        details have been verified — you can track this application using the ID below.
      </p>

      <div className="step7-application-id">
        <span className="step7-application-id-label">Application ID</span>
        <span className="step7-application-id-value">{data.applicationId}</span>
      </div>

      <div className="step7-actions">
        <Button type="button" onClick={handleDownload}>
          Download Application Form
        </Button>
        <Button type="button" variant="secondary" onClick={onExit}>
          Return to Hub
        </Button>
      </div>
    </div>
  );
}

export default Step7Success;
