import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { IdCard, User } from 'lucide-react';
import { Badge, Button, OtpModal, SectionCard, Select, TextField } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import { MOCK_KYC_RECORD } from '../../mockKyc.constants';
import { MOCK_OTP } from '../../otp.constants';
import './Step2IdentityBasicInfo.css';

const AADHAAR_PATTERN = /^\d{12}$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

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

function maskAadhaar(aadhaar: string): string {
  if (aadhaar.length !== 12) return aadhaar;
  return `XXXX XXXX ${aadhaar.slice(8)}`;
}

/**
 * Step 2 — Identity & Basic Info. Merges the old Screen04AadhaarPan
 * (Aadhaar + PAN + mock e-KYC OTP) with Screen05BasicInfo (auto-fetched
 * KYC display + editable profile fields + personal email verify).
 *
 * The Basic Information section only reveals once identity verification
 * succeeds — a progressive single-page flow, same idea as Step 1's inline
 * mobile OTP, rather than two separate screens.
 */
function Step2IdentityBasicInfo() {
  const { data, updateData, goNext } = useCustomerFlow();

  // ---- Identity Verification ----
  const [showIdentityOtp, setShowIdentityOtp] = useState(false);
  const [identityOtp, setIdentityOtp] = useState('');
  const [identityOtpError, setIdentityOtpError] = useState('');
  const [identityCooldown, setIdentityCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const identityCooldownRef = useRef<number | null>(null);

  const isAadhaarValid = AADHAAR_PATTERN.test(data.aadhaarNumber);
  const isPanValid = PAN_PATTERN.test(data.panNumber);

  useEffect(() => {
    if (!showIdentityOtp || data.isAuthComplete) return;
    identityCooldownRef.current = window.setInterval(() => {
      setIdentityCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => {
      if (identityCooldownRef.current) window.clearInterval(identityCooldownRef.current);
    };
  }, [showIdentityOtp, data.isAuthComplete]);

  const handleSendIdentityOtp = () => {
    setIdentityOtp('');
    setIdentityOtpError('');
    setIdentityCooldown(RESEND_COOLDOWN_SECONDS);
    setShowIdentityOtp(true);
  };

  const handleVerifyIdentityOtp = () => {
    if (identityOtp.length !== OTP_LENGTH) {
      setIdentityOtpError(`Enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    if (identityOtp !== MOCK_OTP) {
      setIdentityOtpError('Incorrect OTP. Please try again.');
      return;
    }
    setIdentityOtpError('');
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
    setShowIdentityOtp(false);
  };

  const handleChangeIdentity = () => {
    updateData({
      isAuthComplete: false,
      kycFirstName: '',
      kycMiddleName: '',
      kycLastName: '',
      kycGender: '',
      kycDateOfBirth: '',
      kycMotherMaidenName: '',
      kycFatherName: '',
    });
    setShowIdentityOtp(false);
  };

  // ---- Basic Information (only meaningful once isAuthComplete) ----
  const titleId = useId();
  const preferredNameId = useId();
  const maritalStatusId = useId();
  const spouseNameId = useId();
  const educationId = useId();
  const emailId = useId();

  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailCooldown, setEmailCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const emailCooldownRef = useRef<number | null>(null);

  const isEmailFormatValid = EMAIL_PATTERN.test(data.personalEmail);

  useEffect(() => {
    if (!showEmailOtp || data.isEmailVerified) return;
    emailCooldownRef.current = window.setInterval(() => {
      setEmailCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => {
      if (emailCooldownRef.current) window.clearInterval(emailCooldownRef.current);
    };
  }, [showEmailOtp, data.isEmailVerified]);

  const handleMaritalStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    updateData({ maritalStatus: value, ...(value !== 'Married' ? { spouseName: '' } : {}) });
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateData({ personalEmail: event.target.value, isEmailVerified: false });
    setShowEmailOtp(false);
  };

  const handleStartEmailVerify = () => {
    setEmailOtp('');
    setEmailOtpError('');
    setEmailCooldown(RESEND_COOLDOWN_SECONDS);
    setShowEmailOtp(true);
  };

  const handleVerifyEmailOtp = () => {
    if (emailOtp.length !== OTP_LENGTH) {
      setEmailOtpError(`Enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    if (emailOtp !== MOCK_OTP) {
      setEmailOtpError('Incorrect OTP. Please try again.');
      return;
    }
    setEmailOtpError('');
    updateData({ isEmailVerified: true });
    setShowEmailOtp(false);
  };

  const handleChangeEmail = () => {
    updateData({ isEmailVerified: false });
    setShowEmailOtp(false);
  };

  const isBasicInfoValid =
    data.title.length > 0 &&
    data.preferredCardName.trim().length > 0 &&
    data.maritalStatus.length > 0 &&
    (data.maritalStatus !== 'Married' || data.spouseName.trim().length > 0) &&
    data.educationalQualification.length > 0 &&
    data.isEmailVerified;

  const isSaveEnabled = data.isAuthComplete && isBasicInfoValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaveEnabled) goNext();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionCard icon={<IdCard size={16} />} title="Identity Verification">
        <div className="step2-grid">
          <TextField
            id="aadhaar-number"
            label="Aadhaar Number"
            inputMode="numeric"
            placeholder="Enter 12-digit Aadhaar number"
            value={data.isAuthComplete ? maskAadhaar(data.aadhaarNumber) : data.aadhaarNumber}
            onChange={(e) => updateData({ aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })}
            maxLength={12}
            disabled={data.isAuthComplete}
            required
          />
          <TextField
            id="pan-number"
            label="PAN Number"
            placeholder="Enter PAN (e.g. AAAAA1111A)"
            value={data.panNumber}
            onChange={(e) => updateData({ panNumber: e.target.value.toUpperCase().slice(0, 10) })}
            maxLength={10}
            disabled={data.isAuthComplete}
            required
          />
        </div>

        {data.isAuthComplete ? (
          <div className="step2-verified-row">
            <Badge variant="success">Verified</Badge>
            <button type="button" className="step2-change-link" onClick={handleChangeIdentity}>
              Change Aadhaar / PAN details
            </button>
          </div>
        ) : (
          <div className="step2-send-otp-row">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSendIdentityOtp}
              disabled={!isAadhaarValid || !isPanValid || showIdentityOtp}
            >
              Send OTP
            </Button>
          </div>
        )}
      </SectionCard>

      {showIdentityOtp && !data.isAuthComplete && (
        <OtpModal
          title="Verify Identity"
          subtitle="OTP sent to your Aadhaar-linked mobile number"
          length={OTP_LENGTH}
          value={identityOtp}
          onChange={setIdentityOtp}
          error={identityOtpError}
          onVerify={handleVerifyIdentityOtp}
          onResend={() => {
            setIdentityOtp('');
            setIdentityOtpError('');
            setIdentityCooldown(RESEND_COOLDOWN_SECONDS);
          }}
          resendCooldown={identityCooldown}
          onClose={() => setShowIdentityOtp(false)}
        />
      )}

      {data.isAuthComplete && (
        <SectionCard
          icon={<User size={16} />}
          title="Basic Information"
          action={<Badge variant="info">Auto-fetched</Badge>}
        >
          <div className="step2-kyc-grid">
            <div className="step2-kyc-item">
              <span className="step2-kyc-label">First Name</span>
              <span className="step2-kyc-value">{data.kycFirstName}</span>
            </div>
            <div className="step2-kyc-item">
              <span className="step2-kyc-label">Middle Name</span>
              <span className="step2-kyc-value">{data.kycMiddleName}</span>
            </div>
            <div className="step2-kyc-item">
              <span className="step2-kyc-label">Last Name</span>
              <span className="step2-kyc-value">{data.kycLastName}</span>
            </div>
            <div className="step2-kyc-item">
              <span className="step2-kyc-label">Gender</span>
              <span className="step2-kyc-value">{data.kycGender}</span>
            </div>
            <div className="step2-kyc-item">
              <span className="step2-kyc-label">Date of Birth</span>
              <span className="step2-kyc-value">{data.kycDateOfBirth}</span>
            </div>
            <div className="step2-kyc-item">
              <span className="step2-kyc-label">Mother's Maiden Name</span>
              <span className="step2-kyc-value">{data.kycMotherMaidenName}</span>
            </div>
          </div>

          <div className="step2-grid">
            <Select
              id={titleId}
              label="Title"
              placeholder="Select title"
              options={TITLE_OPTIONS}
              value={data.title}
              onChange={(e) => updateData({ title: e.target.value })}
              required
            />
            <TextField
              id={preferredNameId}
              label="Name as you would prefer on the card"
              placeholder="Enter your preferred name"
              value={data.preferredCardName}
              onChange={(e) => updateData({ preferredCardName: e.target.value })}
              required
            />
            <Select
              id={maritalStatusId}
              label="Marital Status"
              placeholder="Select marital status"
              options={MARITAL_STATUS_OPTIONS}
              value={data.maritalStatus}
              onChange={handleMaritalStatusChange}
              required
            />
            {data.maritalStatus === 'Married' && (
              <TextField
                id={spouseNameId}
                label="Spouse Name"
                placeholder="Enter spouse's name"
                value={data.spouseName}
                onChange={(e) => updateData({ spouseName: e.target.value })}
                required
              />
            )}
            <Select
              id={educationId}
              label="Educational Qualification"
              placeholder="Select qualification"
              options={EDUCATION_OPTIONS}
              value={data.educationalQualification}
              onChange={(e) => updateData({ educationalQualification: e.target.value })}
              required
            />
            <TextField
              id={emailId}
              label="Personal Email ID"
              type="email"
              placeholder="Enter your email here"
              value={data.personalEmail}
              onChange={handleEmailChange}
              disabled={data.isEmailVerified}
              required
              action={
                data.isEmailVerified ? (
                  <Badge variant="success">Verified</Badge>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleStartEmailVerify}
                    disabled={!isEmailFormatValid || showEmailOtp}
                  >
                    Verify
                  </Button>
                )
              }
            />
          </div>

          {data.isEmailVerified && (
            <button type="button" className="step2-change-link" onClick={handleChangeEmail}>
              Change email
            </button>
          )}
        </SectionCard>
      )}

      {data.isAuthComplete && showEmailOtp && !data.isEmailVerified && (
        <OtpModal
          title="Verify Email"
          subtitle={`OTP sent to ${data.personalEmail}`}
          length={OTP_LENGTH}
          value={emailOtp}
          onChange={setEmailOtp}
          error={emailOtpError}
          onVerify={handleVerifyEmailOtp}
          onResend={() => {
            setEmailOtp('');
            setEmailOtpError('');
            setEmailCooldown(RESEND_COOLDOWN_SECONDS);
          }}
          resendCooldown={emailCooldown}
          onClose={() => setShowEmailOtp(false)}
        />
      )}

      {data.isAuthComplete && (
        <div className="step2-actions">
          <Button type="submit" disabled={!isSaveEnabled}>
            Save &amp; Continue
          </Button>
        </div>
      )}
    </form>
  );
}

export default Step2IdentityBasicInfo;
