import { useEffect, useId, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Button, TextField } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import { MOCK_KYC_RECORD } from '../../mockKyc.constants';
import { MOCK_OTP } from '../../otp.constants';
import OtpInput from '../OtpInput';
import './Screen04AadhaarPan.css';

const AADHAAR_PATTERN = /^\d{12}$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

type Stage = 'form' | 'otp';

/** Masks a 12-digit Aadhaar number as "XXXX XXXX 4536"-style, keeping only
 *  the last 4 digits visible. Falls back to the raw value if it isn't
 *  exactly 12 digits. */
function maskAadhaar(aadhaar: string): string {
  if (aadhaar.length !== 12) return aadhaar;
  return `XXXX XXXX ${aadhaar.slice(-4)}`;
}

/**
 * Customer Flow — Screen 4 (Aadhaar + PAN entry, mock Aadhaar-linked OTP).
 * Two stages on one screen: enter Aadhaar + PAN ("form"), then verify a
 * mock OTP sent to the Aadhaar-linked mobile number ("otp") using the same
 * reusable `OtpInput` and `MOCK_OTP` pattern as Screen 3. Verifying the OTP
 * marks `isAuthComplete` and populates a mock "auto-fetched KYC record" on
 * the shared Customer Flow context, then advances to Screen 5.
 */
function Screen04AadhaarPan() {
  const { data, updateData, goNext, goBack } = useCustomerFlow();
  const [stage, setStage] = useState<Stage>('form');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resent, setResent] = useState(false);

  const aadhaarInputId = useId();
  const panInputId = useId();

  const isAadhaarValid = AADHAAR_PATTERN.test(data.aadhaarNumber);
  const isPanValid = PAN_PATTERN.test(data.panNumber);
  const isFormValid = isAadhaarValid && isPanValid;

  useEffect(() => {
    if (stage !== 'otp' || cooldown === 0) return;
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [stage, cooldown]);

  const handleAadhaarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 12);
    updateData({ aadhaarNumber: digitsOnly });
  };

  const handlePanChange = (event: ChangeEvent<HTMLInputElement>) => {
    const upper = event.target.value.toUpperCase().slice(0, 10);
    updateData({ panNumber: upper });
  };

  const handleSendOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid) return;
    setOtp('');
    setOtpError('');
    setResent(false);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setStage('otp');
  };

  const handleOtpChange = (next: string) => {
    setOtp(next);
    setOtpError('');
  };

  const handleVerify = () => {
    if (otp.length !== OTP_LENGTH) {
      setOtpError(`Enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    if (otp === MOCK_OTP) {
      setOtpError('');
      updateData({
        isAuthComplete: true,
        kycFirstName: MOCK_KYC_RECORD.firstName,
        kycMiddleName: MOCK_KYC_RECORD.middleName,
        kycLastName: MOCK_KYC_RECORD.lastName,
        kycGender: MOCK_KYC_RECORD.gender,
        kycDateOfBirth: MOCK_KYC_RECORD.dateOfBirth,
        kycMotherMaidenName: MOCK_KYC_RECORD.motherMaidenName,
        kycFatherName: MOCK_KYC_RECORD.fatherName,
      });
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

  if (stage === 'otp') {
    return (
      <section className="screen-aadhaar-pan">
        <div className="screen-aadhaar-pan-card">
          <p className="screen-aadhaar-pan-confirmation">
            OTP sent to your Aadhaar-linked mobile number {maskAadhaar(data.aadhaarNumber)}
          </p>

          <OtpInput
            length={OTP_LENGTH}
            value={otp}
            onChange={handleOtpChange}
            error={Boolean(otpError)}
            ariaLabel="Enter the 6-digit OTP sent to your Aadhaar-linked mobile number"
          />

          {otpError && (
            <p className="screen-aadhaar-pan-error" role="alert">
              {otpError}
            </p>
          )}
          {resent && !otpError && (
            <p className="screen-aadhaar-pan-resent-note" role="status">
              A new OTP has been sent.
            </p>
          )}

          <div className="screen-aadhaar-pan-actions">
            <Button type="button" onClick={handleVerify}>
              Verify
            </Button>
            <button
              type="button"
              className="screen-aadhaar-pan-resend"
              onClick={handleResend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>

          <button
            type="button"
            className="screen-aadhaar-pan-back"
            onClick={() => setStage('form')}
          >
            Change Aadhaar / PAN details
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="screen-aadhaar-pan">
      <div className="screen-aadhaar-pan-card">
        <p className="screen-aadhaar-pan-subtext">
          Verify your identity with the Aadhaar number and PAN associated with your
          IDBI Bank account.
        </p>

        <form className="screen-aadhaar-pan-form" onSubmit={handleSendOtp} noValidate>
          <div>
            <TextField
              id={aadhaarInputId}
              label="Aadhaar Number"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Enter 12-digit Aadhaar number"
              value={data.aadhaarNumber}
              onChange={handleAadhaarChange}
              maxLength={12}
              required
            />
            <p className="screen-aadhaar-pan-helper">
              You will receive an OTP on your Aadhaar-linked mobile number
            </p>
          </div>

          <TextField
            id={panInputId}
            label="PAN Number"
            autoComplete="off"
            placeholder="AAAAA9999A"
            value={data.panNumber}
            onChange={handlePanChange}
            maxLength={10}
            required
          />

          <div className="screen-aadhaar-pan-actions">
            <Button type="submit" disabled={!isFormValid}>
              Send OTP
            </Button>
            <Button type="button" variant="secondary" onClick={goBack}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Screen04AadhaarPan;
