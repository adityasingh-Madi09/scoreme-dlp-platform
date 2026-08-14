import { Button } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import type { CustomerFlowData } from '../../context/useCustomerFlow';
import './Screen14Success.css';

const formatRupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

/** Builds the plain-text "Application Form" summary offered for download —
 *  a simple recap of the key data collected across the flow, not a real
 *  legal document. Kept as a small pure function (rather than inline in the
 *  click handler) so it stays easy to read/extend. */
function buildApplicationSummaryText(data: CustomerFlowData): string {
  const fullName = [data.kycFirstName, data.kycMiddleName, data.kycLastName]
    .filter(Boolean)
    .join(' ')
    .trim();
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

/** Triggers a real client-side download of `text` as a plain-text file,
 *  via a `Blob` + object URL + a temporary, invisible `<a download>` click
 *  — no PDF library or server round-trip involved. The object URL is
 *  revoked right after the click so it doesn't leak. */
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

interface Screen14SuccessProps {
  /** Dedicated "Return to Hub" action, alongside the persistent header Exit
   *  button — same `onExit` already threaded through by
   *  `CustomerFlowContainer` (see Screen10LoanOffer's identical prop). */
  onExit: () => void;
}

/**
 * Customer Flow — Screen 14 (Success), the final screen of the flow.
 * Reference: design_assets/journey-idbi-personal-loan/customer/IDBI_PLJ_S_11.png
 * for content/structure only — restyled entirely in this platform's own
 * design language. The celebratory badge/confetti visual below is plain
 * inline SVG + CSS (no image asset, no illustration library).
 */
function Screen14Success({ onExit }: Screen14SuccessProps) {
  const { data } = useCustomerFlow();

  const handleDownload = () => {
    const filename = `${data.applicationId || 'loan-application'}-summary.txt`;
    downloadTextFile(filename, buildApplicationSummaryText(data));
  };

  return (
    <section className="screen-success">
      <div className="screen-success-card">
        <div className="screen-success-badge-wrap" aria-hidden="true">
          <svg
            className="screen-success-badge-svg"
            viewBox="0 0 200 140"
            role="presentation"
          >
            {/* Decorative confetti dots */}
            <circle className="screen-success-confetti screen-success-confetti-1" cx="24" cy="24" r="5" />
            <circle className="screen-success-confetti screen-success-confetti-2" cx="176" cy="20" r="4" />
            <circle className="screen-success-confetti screen-success-confetti-3" cx="150" cy="100" r="6" />
            <circle className="screen-success-confetti screen-success-confetti-4" cx="40" cy="108" r="4" />
            <circle className="screen-success-confetti screen-success-confetti-5" cx="14" cy="70" r="3" />
            <circle className="screen-success-confetti screen-success-confetti-6" cx="186" cy="66" r="3" />
            <rect
              className="screen-success-confetti screen-success-confetti-7"
              x="60"
              y="10"
              width="8"
              height="8"
              transform="rotate(20 64 14)"
            />
            <rect
              className="screen-success-confetti screen-success-confetti-8"
              x="132"
              y="118"
              width="7"
              height="7"
              transform="rotate(-15 135 121)"
            />

            {/* Checkmark badge */}
            <circle className="screen-success-badge-ring" cx="100" cy="70" r="38" />
            <circle className="screen-success-badge-fill" cx="100" cy="70" r="32" />
            <path
              className="screen-success-badge-check"
              d="M85 70 L96 82 L118 56"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="screen-success-heading">Congratulations!</h1>
        <p className="screen-success-body">
          Your personal loan application has been submitted successfully. Our
          team will follow up once your details have been verified — you can
          track this application using the ID below.
        </p>

        <div className="screen-success-application-id">
          <span className="screen-success-application-id-label">Application ID</span>
          <span className="screen-success-application-id-value">{data.applicationId}</span>
        </div>

        <div className="screen-success-actions">
          <Button type="button" onClick={handleDownload}>
            Download Application Form
          </Button>
          <Button type="button" variant="secondary" onClick={onExit}>
            Return to Hub
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Screen14Success;
