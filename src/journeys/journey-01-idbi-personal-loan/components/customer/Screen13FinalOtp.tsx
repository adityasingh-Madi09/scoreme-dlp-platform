import { useEffect, useState } from 'react';
import { Button } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import { MOCK_OTP } from '../../otp.constants';
import OtpInput from '../OtpInput';
import './Screen13FinalOtp.css';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

/** Returns just the last 4 digits of a mobile number, for the "ending
 *  XXXX" copy on this screen — falls back to the raw value if it isn't at
 *  least 4 digits long. */
function lastFourDigits(mobileNumber: string): string {
  if (mobileNumber.length < 4) return mobileNumber;
  return mobileNumber.slice(-4);
}

/**
 * Customer Flow — Screen 13 (Final OTP Confirmation). Reference:
 * design_assets/journey-idbi-personal-loan/customer/IDBI_PLJ_S_10.png for
 * content/structure only — restyled entirely in this platform's own design
 * language, using only the shared tokens from src/index.css.
 *
 * Reuses the same `OtpInput` + `MOCK_OTP` pattern already used on Screens 3,
 * 4 and 5. This is the step that actually confirms/accepts the loan offer —
 * Screen 12's "Continue" only gets the applicant here; entering the correct
 * OTP is what unlocks Screen 14 (Success). "Cancel" returns to Screen 12
 * without confirming anything (no OTP or T&C state is changed).
 */
function Screen13FinalOtp() {
  const { data, updateData, goNext, goBack } = useCustomerFlow();
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

  const handleConfirm = () => {
    if (otp.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    if (otp === MOCK_OTP) {
      setError('');
      updateData({ finalOtpVerified: true });
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

  const handleCancel = () => {
    goBack();
  };

  return (
    <section className="screen-final-otp">
      <div className="screen-final-otp-card">
        <p className="screen-final-otp-confirmation">
          We&rsquo;ve sent a one-time password to your registered mobile number
          ending {lastFourDigits(data.mobileNumber)}. Enter it below to confirm
          and accept your loan offer.
        </p>

        <OtpInput
          length={OTP_LENGTH}
          value={otp}
          onChange={handleOtpChange}
          error={Boolean(error)}
          ariaLabel="Enter the 6-digit OTP sent to your registered mobile number to confirm your loan offer"
        />

        {error && (
          <p className="screen-final-otp-error" role="alert">
            {error}
          </p>
        )}
        {resent && !error && (
          <p className="screen-final-otp-resent-note" role="status">
            A new OTP has been sent.
          </p>
        )}

        <div className="screen-final-otp-actions">
          <Button type="button" onClick={handleConfirm}>
            Confirm &amp; Accept Offer
          </Button>
          <button
            type="button"
            className="screen-final-otp-resend"
            onClick={handleResend}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
          </button>
        </div>

        <button type="button" className="screen-final-otp-cancel" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </section>
  );
}

export default Screen13FinalOtp;
