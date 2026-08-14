import { useEffect, useId, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Badge, Button, Select, TextField } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import { MOCK_OTP } from '../../otp.constants';
import OtpInput from '../OtpInput';
import './Screen05BasicInfo.css';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TITLE_OPTIONS = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Dr', label: 'Dr' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
];

const EDUCATION_OPTIONS = [
  { value: 'High School', label: 'High School' },
  { value: 'Graduate', label: 'Graduate' },
  { value: 'Post Graduate', label: 'Post Graduate' },
  { value: 'Doctorate', label: 'Doctorate' },
  { value: 'Other', label: 'Other' },
];

/** Groups a 12-digit Aadhaar number into "XXXX XXXX XXXX"-style chunks for
 *  display. Falls back to the raw value otherwise. */
function formatAadhaarForDisplay(aadhaar: string): string {
  if (aadhaar.length !== 12) return aadhaar || '—';
  return aadhaar.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Customer Flow — Screen 5 (Basic Information). Opens with a read-only
 * "auto-fetched" info panel (the mock KYC record from Screen 4, plus the
 * Aadhaar/PAN entered on Screen 4 and the mobile number entered on Screen
 * 2 — all read from the shared Customer Flow context, proving state
 * threads correctly end to end), then collects the remaining editable
 * profile fields. "Save & Continue" stays disabled until every required
 * field is filled in and the personal email has been OTP-verified (same
 * mock `OtpInput`/`MOCK_OTP` pattern as Screens 3 and 4).
 */
function Screen05BasicInfo() {
  const { data, updateData, goNext } = useCustomerFlow();

  const titleInputId = useId();
  const preferredNameInputId = useId();
  const maritalStatusInputId = useId();
  const spouseNameInputId = useId();
  const educationInputId = useId();
  const emailInputId = useId();

  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpError, setEmailOtpError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resent, setResent] = useState(false);

  const isEmailFormatValid = EMAIL_PATTERN.test(data.personalEmail);
  const isMarried = data.maritalStatus === 'Married';
  const emailFormatError =
    data.personalEmail.length > 0 && !isEmailFormatValid
      ? 'Enter a valid email address.'
      : undefined;

  useEffect(() => {
    if (!showEmailOtp || cooldown === 0) return;
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [showEmailOtp, cooldown]);

  const isSaveEnabled = useMemo(() => {
    if (!data.title) return false;
    if (!data.preferredCardName.trim()) return false;
    if (!data.maritalStatus) return false;
    if (isMarried && !data.spouseName.trim()) return false;
    if (!data.educationalQualification) return false;
    if (!data.isEmailVerified) return false;
    return true;
  }, [data, isMarried]);

  const handleMaritalStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = event.target.value;
    updateData({
      maritalStatus: nextStatus,
      // Clear a previously-entered spouse name once it no longer applies,
      // so a stale value can't be submitted for a non-married status.
      spouseName: nextStatus === 'Married' ? data.spouseName : '',
    });
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateData({ personalEmail: event.target.value, isEmailVerified: false });
    setShowEmailOtp(false);
  };

  const handleStartEmailVerify = () => {
    if (!isEmailFormatValid) return;
    setEmailOtp('');
    setEmailOtpError('');
    setResent(false);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setShowEmailOtp(true);
  };

  const handleEmailOtpChange = (next: string) => {
    setEmailOtp(next);
    setEmailOtpError('');
  };

  const handleVerifyEmailOtp = () => {
    if (emailOtp.length !== OTP_LENGTH) {
      setEmailOtpError(`Enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    if (emailOtp === MOCK_OTP) {
      setEmailOtpError('');
      setShowEmailOtp(false);
      updateData({ isEmailVerified: true });
    } else {
      setEmailOtpError('Incorrect OTP. Please try again.');
    }
  };

  const handleResendEmailOtp = () => {
    if (cooldown > 0) return;
    setEmailOtp('');
    setEmailOtpError('');
    setResent(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleChangeEmail = () => {
    updateData({ isEmailVerified: false });
    setShowEmailOtp(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaveEnabled) {
      goNext();
    }
  };

  return (
    <section className="screen-basic-info">
      <div className="screen-basic-info-card">
        <div className="screen-basic-info-fetched-row">
          <p className="screen-basic-info-fetched-note">
            Some of your information has been auto-fetched from your existing account.
          </p>
          <Badge variant="info">Auto-fetched</Badge>
        </div>

        <dl className="screen-basic-info-panel">
          <div className="screen-basic-info-panel-item">
            <dt>First Name</dt>
            <dd>{data.kycFirstName || '—'}</dd>
          </div>
          <div className="screen-basic-info-panel-item">
            <dt>Middle Name</dt>
            <dd>{data.kycMiddleName || '—'}</dd>
          </div>
          <div className="screen-basic-info-panel-item">
            <dt>Last Name</dt>
            <dd>{data.kycLastName || '—'}</dd>
          </div>
          <div className="screen-basic-info-panel-item">
            <dt>Gender</dt>
            <dd>{data.kycGender || '—'}</dd>
          </div>
          <div className="screen-basic-info-panel-item">
            <dt>Date of Birth</dt>
            <dd>{data.kycDateOfBirth || '—'}</dd>
          </div>
          <div className="screen-basic-info-panel-item">
            <dt>Aadhaar No.</dt>
            <dd>{formatAadhaarForDisplay(data.aadhaarNumber)}</dd>
          </div>
          <div className="screen-basic-info-panel-item">
            <dt>Mother&rsquo;s Maiden Name</dt>
            <dd>{data.kycMotherMaidenName || '—'}</dd>
          </div>
          <div className="screen-basic-info-panel-item">
            <dt>Father&rsquo;s Name</dt>
            <dd>{data.kycFatherName || '—'}</dd>
          </div>
          <div className="screen-basic-info-panel-item">
            <dt>PAN No.</dt>
            <dd>{data.panNumber || '—'}</dd>
          </div>
          <div className="screen-basic-info-panel-item">
            <dt>Mobile No.</dt>
            <dd>{data.mobileNumber ? `+91 ${data.mobileNumber}` : '—'}</dd>
          </div>
        </dl>

        <form className="screen-basic-info-form" onSubmit={handleSubmit} noValidate>
          <div className="screen-basic-info-grid">
            <Select
              id={titleInputId}
              label="Title"
              placeholder="Select title"
              options={TITLE_OPTIONS}
              value={data.title}
              onChange={(event) => updateData({ title: event.target.value })}
              required
            />

            <TextField
              id={preferredNameInputId}
              label="Name as you would prefer on the card"
              placeholder="Enter your preferred name"
              value={data.preferredCardName}
              onChange={(event) => updateData({ preferredCardName: event.target.value })}
              required
            />

            <Select
              id={maritalStatusInputId}
              label="Marital Status"
              placeholder="Select marital status"
              options={MARITAL_STATUS_OPTIONS}
              value={data.maritalStatus}
              onChange={handleMaritalStatusChange}
              required
            />

            {isMarried && (
              <TextField
                id={spouseNameInputId}
                label="Spouse Name"
                placeholder="Enter your spouse name"
                value={data.spouseName}
                onChange={(event) => updateData({ spouseName: event.target.value })}
                required
              />
            )}

            <Select
              id={educationInputId}
              label="Educational Qualification"
              placeholder="Select qualification"
              options={EDUCATION_OPTIONS}
              value={data.educationalQualification}
              onChange={(event) =>
                updateData({ educationalQualification: event.target.value })
              }
              required
            />

            <div className="screen-basic-info-email-field">
              <TextField
                id={emailInputId}
                label="Personal Email ID"
                type="email"
                placeholder="Enter your email id"
                value={data.personalEmail}
                onChange={handleEmailChange}
                disabled={data.isEmailVerified}
                autoComplete="email"
                required
                error={emailFormatError}
                action={
                  data.isEmailVerified ? (
                    <span className="screen-basic-info-verified-badge">Verified</span>
                  ) : (
                    <Button
                      type="button"
                      className="screen-basic-info-verify-btn"
                      onClick={handleStartEmailVerify}
                      disabled={!isEmailFormatValid}
                    >
                      Verify
                    </Button>
                  )
                }
              />
              {data.isEmailVerified && (
                <button
                  type="button"
                  className="screen-basic-info-change-email"
                  onClick={handleChangeEmail}
                >
                  Change email
                </button>
              )}
            </div>
          </div>

          {showEmailOtp && !data.isEmailVerified && (
            <div className="screen-basic-info-otp-panel">
              <p className="screen-basic-info-otp-confirmation">
                OTP sent to {data.personalEmail}
              </p>

              <OtpInput
                length={OTP_LENGTH}
                value={emailOtp}
                onChange={handleEmailOtpChange}
                error={Boolean(emailOtpError)}
                ariaLabel="Enter the 6-digit OTP sent to your email address"
              />

              {emailOtpError && (
                <p className="screen-basic-info-otp-error" role="alert">
                  {emailOtpError}
                </p>
              )}
              {resent && !emailOtpError && (
                <p className="screen-basic-info-otp-resent-note" role="status">
                  A new OTP has been sent.
                </p>
              )}

              <div className="screen-basic-info-otp-actions">
                <Button type="button" onClick={handleVerifyEmailOtp}>
                  Verify OTP
                </Button>
                <button
                  type="button"
                  className="screen-basic-info-otp-resend"
                  onClick={handleResendEmailOtp}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}

          <div className="screen-basic-info-actions">
            <Button type="submit" disabled={!isSaveEnabled}>
              Save &amp; Continue
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Screen05BasicInfo;
