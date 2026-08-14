import { useEffect, useState } from 'react';
import { Button } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import { MOCK_OTP } from '../../otp.constants';
import OtpInput from '../OtpInput';
import './Screen03OtpVerify.css';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

/** Masks all but the first two and last two digits, e.g. "9812345670" ->
 *  "98XXXXXX70". Falls back to the raw value if it isn't 10 digits. */
function maskMobileNumber(mobileNumber: string): string {
  if (mobileNumber.length !== 10) return mobileNumber;
  return `${mobileNumber.slice(0, 2)}XXXXXX${mobileNumber.slice(-2)}`;
}

/**
 * Customer Flow — Screen 3 (OTP Verify). Uses the shared, reusable
 * `OtpInput` (also reused by Screens 4, 5 and 13). Only `MOCK_OTP`
 * ('123456', from `otp.constants.ts`) succeeds — anything else shows an
 * inline error and lets the user retry. "Resend OTP" is mocked: it just
 * clears the boxes and re-arms after a short cooldown, no real OTP is
 * sent anywhere.
 */
function Screen03OtpVerify() {
  const { data, updateData, goNext, goToStep } = useCustomerFlow();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleOtpChange = (next: string) => {
    setOtp(next);
    setError('');
  };

  const handleVerify = () => {
    if (otp.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    if (otp === MOCK_OTP) {
      setError('');
      updateData({ isMobileVerified: true });
      goNext();
    } else {
      setError('Incorrect OTP. Please try again.');
    }
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setOtp('');
    setError('');
    setResent(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <section className="screen-otp-verify">
      <div className="screen-otp-verify-card">
        <p className="screen-otp-verify-confirmation">
          OTP sent to +91 {maskMobileNumber(data.mobileNumber)}
        </p>

        <OtpInput
          length={OTP_LENGTH}
          value={otp}
          onChange={handleOtpChange}
          error={Boolean(error)}
          ariaLabel="Enter the 6-digit OTP sent to your mobile number"
        />

        {error && (
          <p className="screen-otp-verify-error" role="alert">
            {error}
          </p>
        )}
        {resent && !error && (
          <p className="screen-otp-verify-resent-note" role="status">
            A new OTP has been sent.
          </p>
        )}

        <div className="screen-otp-verify-actions">
          <Button type="button" onClick={handleVerify}>
            Verify
          </Button>
          <button
            type="button"
            className="screen-otp-verify-resend"
            onClick={handleResend}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
          </button>
        </div>

        <button
          type="button"
          className="screen-otp-verify-back"
          onClick={() => goToStep(2)}
        >
          Change mobile number
        </button>
      </div>
    </section>
  );
}

export default Screen03OtpVerify;
