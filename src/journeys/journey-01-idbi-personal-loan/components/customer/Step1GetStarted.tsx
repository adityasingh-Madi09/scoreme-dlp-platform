import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { CheckCircle2, Smartphone } from 'lucide-react';
import { Badge, Button, OtpModal, SectionCard, TextField } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import InlineNotice from '../InlineNotice';
import { MOCK_OTP } from '../../otp.constants';
import './Step1GetStarted.css';

const MOBILE_NUMBER_PATTERN = /^\d{10}$/;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const FEATURES = [
  'Instant loan up to ₹10 lakhs',
  'Cash-flow based assessment',
  'Fully digital verification',
  'Flexible tenure up to 60 months',
];

/**
 * Step 1 — Get Started. Merges the old Screen01Entry (intro/features) +
 * Screen02MobileEntry (mobile number) + Screen03OtpVerify (OTP) into one
 * screen: OTP now reveals inline in the same "Mobile Verification" section
 * instead of navigating to a separate screen, the same pattern already
 * used for email verification in Step 2. Continue is wired via the shared
 * footer's `stepActions` mechanism (only this screen and Step 6 use it —
 * every other step gates its own inline "Save & Continue" form submit).
 */
function Step1GetStarted() {
  const { data, updateData, goNext, setStepActions } = useCustomerFlow();

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resent, setResent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const cooldownTimerRef = useRef<number | null>(null);

  const isMobileValid = MOBILE_NUMBER_PATTERN.test(data.mobileNumber);

  useEffect(() => {
    setStepActions({ canContinue: data.isMobileVerified, onContinue: goNext });
    return () => setStepActions(null);
  }, [data.isMobileVerified, goNext, setStepActions]);

  useEffect(() => {
    if (!showOtp || data.isMobileVerified) return;
    cooldownTimerRef.current = window.setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => {
      if (cooldownTimerRef.current) window.clearInterval(cooldownTimerRef.current);
    };
  }, [showOtp, data.isMobileVerified]);

  const handleMobileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10);
    updateData({ mobileNumber: digitsOnly, isMobileVerified: false });
    setShowOtp(false);
  };

  const handleSendOtp = () => {
    setOtp('');
    setOtpError('');
    setResent(false);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setShowOtp(true);
  };

  const handleResendOtp = () => {
    setOtp('');
    setOtpError('');
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setResent(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== OTP_LENGTH) {
      setOtpError(`Enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    if (otp !== MOCK_OTP) {
      setOtpError('Incorrect OTP. Please try again.');
      return;
    }
    setOtpError('');
    updateData({ isMobileVerified: true });
    setShowOtp(false);
  };

  const handleChangeNumber = () => {
    updateData({ isMobileVerified: false });
    setShowOtp(false);
  };

  return (
    <>
      <SectionCard icon={<Smartphone size={16} />} title="Mobile Verification">
        <TextField
          id="mobile-number"
          label="Mobile Number"
          type="tel"
          inputMode="numeric"
          placeholder="Enter 10-digit mobile number"
          value={data.mobileNumber}
          onChange={handleMobileChange}
          maxLength={10}
          disabled={data.isMobileVerified}
          required
          action={
            data.isMobileVerified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSendOtp}
                disabled={!isMobileValid || showOtp}
              >
                Send OTP
              </Button>
            )
          }
        />

        {data.isMobileVerified && (
          <button type="button" className="step1-change-link" onClick={handleChangeNumber}>
            Change mobile number
          </button>
        )}
      </SectionCard>

      {showOtp && !data.isMobileVerified && (
        <OtpModal
          title="Verify Mobile Number"
          subtitle={`OTP sent to +91 ${data.mobileNumber}`}
          length={OTP_LENGTH}
          value={otp}
          onChange={setOtp}
          error={otpError}
          successNote={resent ? 'A new OTP has been sent.' : undefined}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
          resendCooldown={cooldown}
          onClose={() => setShowOtp(false)}
        />
      )}

      <SectionCard icon={<CheckCircle2 size={16} />} title="Why Apply With Us">
        <ul className="step1-features-list">
          {FEATURES.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </SectionCard>

      <div className="step1-secondary-actions">
        <button type="button" className="step1-secondary-link" onClick={() => setNotice('Resume Saved Application is coming soon.')}>
          Resume Saved Application
        </button>
        <button type="button" className="step1-secondary-link" onClick={() => setNotice('Track Application Status is coming soon.')}>
          Track Application Status
        </button>
      </div>
      {notice && (
        <div className="step1-notice-wrap">
          <InlineNotice message={notice} />
        </div>
      )}
    </>
  );
}

export default Step1GetStarted;
