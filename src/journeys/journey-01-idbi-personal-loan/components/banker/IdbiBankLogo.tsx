/**
 * Stylized IDBI Bank lockup for the Banker workspace header.
 *
 * This is a hand-built recreation (simple inline SVG + text), not an image
 * sourced from anywhere — deliberately, since this journey is bespoke
 * software built specifically for IDBI Bank (the Banker screens are their
 * own staff's internal tool), so reflecting their own identity back to
 * them here is the point, not a third-party brand borrowed for an
 * unrelated product. See the accompanying summary for the one open
 * question this raises against this project's general asset-caution rule.
 */
function IdbiBankLogo() {
  return (
    <div className="idbi-bank-logo" aria-label="IDBI Bank">
      <svg
        className="idbi-bank-logo-mark"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="19" fill="#F0672A" />
        <path
          d="M20 8c3 3.2 3 7.4 0 10.5-3 3.1-3 7.3 0 10.5"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M9 15c4.3-1.6 8.5-0.4 10.9 3 2.4 3.4 6.6 4.6 10.9 3"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M9 25c4.3 1.6 8.5 0.4 10.9-3 2.4-3.4 6.6-4.6 10.9-3"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </svg>
      <span className="idbi-bank-logo-text">
        <span className="idbi-bank-logo-idbi">IDBI</span>
        <span className="idbi-bank-logo-bank">BANK</span>
      </span>
    </div>
  );
}

export default IdbiBankLogo;
