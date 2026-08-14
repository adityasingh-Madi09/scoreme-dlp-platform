import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Camera, FileCheck2, ShieldCheck } from 'lucide-react';
import { Button, Checkbox, OtpModal, SectionCard, SectionQuickNav } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import { MOCK_OTP } from '../../otp.constants';
import './Step6VerifyConsent.css';

const LIVELINESS_CHECK_DELAY_MS = 2200;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const formatRupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

type LivelinessStage = 'consent' | 'checking' | 'complete';
type CameraMode = 'live' | 'fallback' | null;

const QUICK_NAV_ITEMS = [
  { id: 'step6-liveliness', label: 'Liveliness' },
  { id: 'step6-terms', label: 'Terms' },
  { id: 'step6-confirm', label: 'Confirm' },
];

function lastFourDigits(mobileNumber: string): string {
  if (mobileNumber.length < 4) return mobileNumber;
  return mobileNumber.slice(-4);
}

/**
 * Step 6 — Verify & Consent. Merges the old Screen11Liveliness +
 * Screen12Terms + Screen13FinalOtp into one screen with three
 * progressively-revealed ribbon sections: Liveliness Check always visible;
 * Terms & Conditions reveals once the liveliness check completes; the
 * final confirmation OTP reveals once Terms is accepted. Entering the
 * correct OTP is what actually confirms/accepts the loan offer and calls
 * `goNext()` directly — this screen has no shared-footer Continue button,
 * matching the original per-screen "own inline action" convention.
 */
function Step6VerifyConsent() {
  const { data, updateData, goNext } = useCustomerFlow();
  const checkboxId = useId();

  // ---- Liveliness ----
  const [stage, setStage] = useState<LivelinessStage>(data.isLivelinessComplete ? 'complete' : 'consent');
  const [cameraMode, setCameraMode] = useState<CameraMode>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const livelinessTimeoutRef = useRef<number | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(
    () => () => {
      stopStream();
      if (livelinessTimeoutRef.current !== null) window.clearTimeout(livelinessTimeoutRef.current);
    },
    [stopStream],
  );

  useEffect(() => {
    if (cameraMode === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraMode]);

  const beginSimulatedCheck = useCallback(() => {
    livelinessTimeoutRef.current = window.setTimeout(() => {
      stopStream();
      setStage('complete');
      updateData({ isLivelinessComplete: true });
    }, LIVELINESS_CHECK_DELAY_MS);
  }, [stopStream, updateData]);

  const handleStartLiveliness = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMode('fallback');
      setStage('checking');
      beginSimulatedCheck();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraMode('live');
      setStage('checking');
      beginSimulatedCheck();
    } catch {
      setCameraMode('fallback');
      setStage('checking');
      beginSimulatedCheck();
    }
  }, [beginSimulatedCheck]);

  // ---- Final OTP ----
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resent, setResent] = useState(false);
  // Pops open automatically as soon as the Confirm & Accept section reveals
  // (terms just accepted) — see the effect below — and can be reopened via
  // the section's "Enter OTP" button if the applicant closes it early.
  const [showFinalOtpModal, setShowFinalOtpModal] = useState(false);

  useEffect(() => {
    if (data.termsAccepted) setShowFinalOtpModal(true);
  }, [data.termsAccepted]);

  useEffect(() => {
    if (!data.termsAccepted || cooldown === 0) return;
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [data.termsAccepted, cooldown]);

  const handleOtpChange = (next: string) => {
    setOtp(next);
    setOtpError('');
  };

  const handleConfirm = () => {
    if (otp.length !== OTP_LENGTH) {
      setOtpError(`Enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    if (otp === MOCK_OTP) {
      setOtpError('');
      updateData({ finalOtpVerified: true });
      goNext();
    } else {
      setOtpError('Incorrect OTP. Please try again.');
    }
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setOtp('');
    setOtpError('');
    setResent(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  // Cancel walks back to the Terms section (unchecks acceptance) rather
  // than navigating to a separate screen, since this is now one merged
  // page — the applicant can simply re-read and re-accept.
  const handleCancel = () => {
    setOtp('');
    setOtpError('');
    setResent(false);
    setShowFinalOtpModal(false);
    updateData({ termsAccepted: false });
  };

  const applicantName = data.preferredCardName.trim() || 'Applicant';

  return (
    <>
      <SectionQuickNav items={QUICK_NAV_ITEMS} />

      <SectionCard id="step6-liveliness" icon={<Camera size={16} />} title="Liveliness Check">
        <p className="step6-subtext">One quick step to confirm you&rsquo;re present for this application.</p>

        {stage === 'consent' && (
          <div className="step6-liveliness-consent">
            <p className="step6-liveliness-consent-text">
              We need one-time access to your camera to verify you&rsquo;re present for this application. Your
              video is not stored.
            </p>
            <Button type="button" onClick={handleStartLiveliness}>
              Start Liveliness Check
            </Button>
          </div>
        )}

        {stage !== 'consent' && (
          <div className="step6-liveliness-preview-wrap">
            <div className="step6-liveliness-preview">
              {cameraMode === 'live' ? (
                <video
                  ref={videoRef}
                  className="step6-liveliness-video"
                  autoPlay
                  muted
                  playsInline
                  aria-label="Live camera preview"
                />
              ) : (
                <div className="step6-liveliness-fallback" role="img" aria-label="Camera preview unavailable">
                  <Camera size={22} aria-hidden="true" />
                  <span>Camera preview unavailable — simulated check</span>
                </div>
              )}
              {stage === 'complete' && (
                <div className="step6-liveliness-complete-overlay">
                  <ShieldCheck size={28} aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="step6-liveliness-status" role="status" aria-live="polite">
              {stage === 'checking' && (
                <>
                  <span className="step6-spinner" aria-hidden="true" />
                  <span>Checking&hellip;</span>
                </>
              )}
              {stage === 'complete' && <span>Liveliness check complete</span>}
            </div>
          </div>
        )}
      </SectionCard>

      {data.isLivelinessComplete && (
        <SectionCard id="step6-terms" icon={<FileCheck2 size={16} />} title="Terms & Conditions">
          <p className="step6-subtext">Please review the summary below before confirming your loan offer.</p>

          <div className="step6-terms-panel" tabIndex={0} aria-label="Loan agreement summary">
            <p className="step6-terms-doc-title">ScoreMe DLP Platform — Loan Agreement Summary (Prototype)</p>
            <p>
              This document is a simulated, non-binding summary generated by the ScoreMe DLP Platform for
              demonstration purposes only. It is not a legal loan agreement and creates no real financial
              obligation.
            </p>

            <p className="step6-terms-doc-section-title">1. Parties &amp; Application</p>
            <p>
              This summary is issued to <strong>{applicantName}</strong> against application{' '}
              <strong>{data.applicationId || 'the loan application generated on the previous screen'}</strong>
              {data.loanOfferSanctionDate ? (
                <>
                  {' '}
                  sanctioned on <strong>{data.loanOfferSanctionDate}</strong>
                </>
              ) : null}
              .
            </p>

            <p className="step6-terms-doc-section-title">2. Loan Summary</p>
            <p>
              Sanctioned Amount: <strong>{formatRupees(data.loanOfferAmount)}</strong>
              <br />
              Tenure: <strong>{data.loanOfferTenureMonths} months</strong>
              <br />
              Interest Rate: <strong>{data.loanOfferInterestRatePercent}% p.a.</strong> (reducing balance)
              <br />
              Monthly EMI: <strong>{formatRupees(data.loanOfferEmi)}</strong>
              <br />
              One-time Processing Fee: <strong>{formatRupees(data.loanOfferProcessingFee)}</strong>
              <br />
              Annual Percentage Rate (APR): <strong>{data.loanOfferAprPercent}% p.a.</strong>
            </p>

            <p className="step6-terms-doc-section-title">3. Repayment</p>
            <p>
              The EMI stated above will be collected on the due date each month for the full tenure via the
              primary bank account verified on the Income Details screen, until the loan is fully repaid. A
              missed or delayed EMI may attract additional charges and may affect the applicant&rsquo;s credit
              history.
            </p>

            <p className="step6-terms-doc-section-title">4. Prepayment &amp; Cancellation</p>
            <p>
              The applicant may cancel this loan within 3 days of disbursal by repaying only the principal
              amount, with no additional charges, per the Key Fact Statement shown on the Loan Offer screen.
              Part or full prepayment is otherwise permitted subject to the standard foreclosure terms
              applicable at the time.
            </p>

            <p className="step6-terms-doc-section-title">5. Data &amp; Consent</p>
            <p>
              The applicant consents to the identity, address, employment, income and nominee details
              collected earlier in this application being used solely to process, sanction and service this
              loan, and to be shared with regulatory or credit-bureau bodies where legally required.
            </p>

            <p className="step6-terms-doc-section-title">6. Grievance Redressal</p>
            <p>
              For any queries or grievances relating to this application, contact the support address shown on
              the Loan Offer screen. This prototype summary does not replace the formal Key Fact Statement or
              sanction letter of any real lender.
            </p>

            <p className="step6-terms-doc-section-title">7. Acceptance</p>
            <p>
              Accepting these Terms &amp; Guidelines and completing the final OTP confirmation below constitutes
              the applicant&rsquo;s acknowledgement and acceptance of this loan offer within this prototype flow.
            </p>
          </div>

          <Checkbox
            id={checkboxId}
            label="I have read and accepted the Terms & Conditions and Guidelines"
            checked={data.termsAccepted}
            onChange={(event) => updateData({ termsAccepted: event.target.checked })}
          />
        </SectionCard>
      )}

      {data.termsAccepted && (
        <SectionCard id="step6-confirm" icon={<ShieldCheck size={16} />} title="Confirm & Accept">
          <p className="step6-subtext">
            We&rsquo;ve sent a one-time password to your registered mobile number ending{' '}
            {lastFourDigits(data.mobileNumber)}. Enter it in the pop-up to confirm and accept your loan offer.
          </p>

          {!showFinalOtpModal && (
            <div className="step6-confirm-actions">
              <Button type="button" onClick={() => setShowFinalOtpModal(true)}>
                Enter OTP to Confirm
              </Button>
            </div>
          )}

          <button type="button" className="step6-cancel-link" onClick={handleCancel}>
            Cancel
          </button>
        </SectionCard>
      )}

      {showFinalOtpModal && data.termsAccepted && (
        <OtpModal
          title="Confirm & Accept Offer"
          subtitle={`OTP sent to your registered mobile number ending ${lastFourDigits(data.mobileNumber)}`}
          length={OTP_LENGTH}
          value={otp}
          onChange={handleOtpChange}
          error={otpError}
          successNote={resent ? 'A new OTP has been sent.' : undefined}
          onVerify={handleConfirm}
          verifyLabel="Confirm & Accept Offer"
          onResend={handleResend}
          resendCooldown={cooldown}
          onClose={() => setShowFinalOtpModal(false)}
        />
      )}
    </>
  );
}

export default Step6VerifyConsent;
