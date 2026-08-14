import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Building2, FileText, Landmark } from 'lucide-react';
import { Badge, Button, SectionCard, TextField } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import { MOCK_BANK_NAME, MOCK_ITR_SUMMARY } from '../../mockIncome.constants';
import './Screen08Income.css';

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
const BANK_VERIFY_DELAY_MS = 800;
const URN_VERIFY_DELAY_MS = 800;
const ITR_ANALYSE_DELAY_MS = 2500;

type ItrStage = 'idle' | 'loading' | 'done';

/**
 * Customer Flow — Screen 8 (Income Details). Three sections:
 *
 * 1. Primary Bank Details — IFSC + Account Number, gated behind a mock
 *    "Verify Bank Details" lookup (same inline verify/Verified-badge
 *    pattern Screen05BasicInfo uses for email) that auto-fills a read-only
 *    Bank Name field once verified.
 * 2. Income Details — a mock ITR-fetch flow (username/password + "Fetch
 *    ITR"), which shows a brief "analysing" state before returning a canned,
 *    clearly-placeholder summary. Deliberately **not** required to gate
 *    "Save & Continue" — this section is presented as an optional
 *    convenience lookup (mirrors the Udyam section's optionality), not a
 *    hard KYC requirement, so a customer who can't complete an ITR login
 *    right now isn't blocked from continuing the application.
 * 3. Udyam Registration Details (Optional) — same inline verify pattern as
 *    the bank section, entirely optional.
 *
 * "Save & Continue" gating: valid-format IFSC + a non-empty Account Number
 * that has been bank-verified. Udyam and the ITR fetch are both
 * informational/optional and never block continuing.
 */
function Screen08Income() {
  const { data, updateData, goNext } = useCustomerFlow();

  const ifscInputId = useId();
  const accountNumberInputId = useId();
  const bankNameInputId = useId();
  const itrUsernameInputId = useId();
  const itrPasswordInputId = useId();
  const urnInputId = useId();

  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [isVerifyingUrn, setIsVerifyingUrn] = useState(false);
  const [itrStage, setItrStage] = useState<ItrStage>('idle');

  const bankTimeoutRef = useRef<number | null>(null);
  const urnTimeoutRef = useRef<number | null>(null);
  const itrTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (bankTimeoutRef.current) window.clearTimeout(bankTimeoutRef.current);
      if (urnTimeoutRef.current) window.clearTimeout(urnTimeoutRef.current);
      if (itrTimeoutRef.current) window.clearTimeout(itrTimeoutRef.current);
    },
    [],
  );

  const isIfscFormatValid = IFSC_PATTERN.test(data.ifscCode);
  const ifscError =
    data.ifscCode.length > 0 && !isIfscFormatValid
      ? 'Enter a valid IFSC code (e.g. ABCD0123456).'
      : undefined;

  const canVerifyBank =
    isIfscFormatValid && data.accountNumber.trim().length > 0 && !isVerifyingBank;

  const isBankSectionValid =
    isIfscFormatValid && data.accountNumber.trim().length > 0 && data.isBankVerified;

  const canVerifyUrn = data.urnNumber.trim().length > 0 && !isVerifyingUrn;

  const canFetchItr =
    data.itrUsername.trim().length > 0 &&
    data.itrPassword.trim().length > 0 &&
    itrStage !== 'loading';

  // Udyam is entirely optional and never gates Save & Continue; the ITR
  // fetch is informational-only for the same reason (see the doc comment
  // above), so only the bank section is checked here.
  const isSaveEnabled = isBankSectionValid;

  const handleIfscChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateData({
      ifscCode: event.target.value.toUpperCase().slice(0, 11),
      isBankVerified: false,
      bankName: '',
    });
  };

  const handleAccountNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateData({
      accountNumber: event.target.value.replace(/\D/g, '').slice(0, 20),
      isBankVerified: false,
      bankName: '',
    });
  };

  const handleVerifyBank = () => {
    if (!canVerifyBank) return;
    setIsVerifyingBank(true);
    bankTimeoutRef.current = window.setTimeout(() => {
      setIsVerifyingBank(false);
      updateData({ isBankVerified: true, bankName: MOCK_BANK_NAME });
    }, BANK_VERIFY_DELAY_MS);
  };

  const handleChangeBankDetails = () => {
    updateData({ isBankVerified: false, bankName: '' });
  };

  const handleUrnChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateData({ urnNumber: event.target.value, isUrnVerified: false });
  };

  const handleVerifyUrn = () => {
    if (!canVerifyUrn) return;
    setIsVerifyingUrn(true);
    urnTimeoutRef.current = window.setTimeout(() => {
      setIsVerifyingUrn(false);
      updateData({ isUrnVerified: true });
    }, URN_VERIFY_DELAY_MS);
  };

  const handleChangeUrn = () => {
    updateData({ isUrnVerified: false });
  };

  const handleFetchItr = () => {
    if (!canFetchItr) return;
    setItrStage('loading');
    itrTimeoutRef.current = window.setTimeout(() => {
      setItrStage('done');
      updateData({ isItrFetched: true });
    }, ITR_ANALYSE_DELAY_MS);
  };

  const handleChangeItrCredentials = () => {
    setItrStage('idle');
    updateData({ isItrFetched: false });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaveEnabled) {
      goNext();
    }
  };

  return (
    <section className="screen-income">
      <div className="screen-income-card">
        <p className="screen-income-subtext">
          Tell us about your primary bank account and (optionally) your income
          proofs.
        </p>

        <form className="screen-income-form" onSubmit={handleSubmit} noValidate>
          <SectionCard icon={<Landmark size={16} />} title="Primary Bank Details">
            <div className="screen-income-grid">
              <TextField
                id={ifscInputId}
                label="IFSC Code"
                placeholder="Enter IFSC code"
                autoComplete="off"
                value={data.ifscCode}
                onChange={handleIfscChange}
                disabled={data.isBankVerified}
                maxLength={11}
                error={ifscError}
                required
              />

              <div className="screen-income-verify-field">
                <TextField
                  id={accountNumberInputId}
                  label="Account Number"
                  inputMode="numeric"
                  placeholder="Enter your account number"
                  autoComplete="off"
                  value={data.accountNumber}
                  onChange={handleAccountNumberChange}
                  disabled={data.isBankVerified}
                  required
                  action={
                    data.isBankVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Button
                        type="button"
                        className="screen-income-verify-btn"
                        onClick={handleVerifyBank}
                        disabled={!canVerifyBank}
                      >
                        {isVerifyingBank ? 'Verifying…' : 'Verify Bank Details'}
                      </Button>
                    )
                  }
                />
                {data.isBankVerified && (
                  <button
                    type="button"
                    className="screen-income-change-link"
                    onClick={handleChangeBankDetails}
                  >
                    Change bank details
                  </button>
                )}
              </div>

              {data.isBankVerified && (
                <TextField
                  id={bankNameInputId}
                  label="Bank Name"
                  value={data.bankName}
                  disabled
                  readOnly
                />
              )}
            </div>
          </SectionCard>

          <SectionCard
            icon={<FileText size={16} />}
            title="Income Details"
            action={<Badge variant="neutral">Optional</Badge>}
          >
            <p className="screen-income-itr-hint">
              Please enter your ITR login credentials to fetch your income
              statement.
            </p>

            <div className="screen-income-grid">
              <TextField
                id={itrUsernameInputId}
                label="Username"
                autoComplete="off"
                placeholder="Enter ITR portal username"
                value={data.itrUsername}
                onChange={(event) => updateData({ itrUsername: event.target.value })}
              />
              <TextField
                id={itrPasswordInputId}
                label="Password"
                type="password"
                autoComplete="off"
                placeholder="Enter ITR portal password"
                value={data.itrPassword}
                onChange={(event) => updateData({ itrPassword: event.target.value })}
              />
            </div>

            <div className="screen-income-itr-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={handleFetchItr}
                disabled={!canFetchItr}
              >
                {itrStage === 'loading' ? 'Analysing…' : 'Fetch ITR'}
              </Button>
              {itrStage === 'done' && (
                <button
                  type="button"
                  className="screen-income-change-link"
                  onClick={handleChangeItrCredentials}
                >
                  Change credentials
                </button>
              )}
            </div>

            {itrStage === 'loading' && (
              <div className="screen-income-itr-panel screen-income-itr-panel--loading" role="status" aria-live="polite">
                <span className="screen-income-spinner" aria-hidden="true" />
                <p>
                  Please wait while we analyse your details. This usually takes a
                  moment.
                </p>
              </div>
            )}

            {itrStage === 'done' && (
              <div className="screen-income-itr-panel screen-income-itr-panel--done" role="status">
                <p className="screen-income-itr-result-title">
                  Statement fetched successfully
                </p>
                <dl className="screen-income-itr-result-list">
                  {MOCK_ITR_SUMMARY.map((item) => (
                    <div key={item.label} className="screen-income-itr-result-item">
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="screen-income-itr-result-note">
                  Illustrative data for this prototype only.
                </p>
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={<Building2 size={16} />}
            title="Udyam Registration Details"
            action={<Badge variant="neutral">Optional</Badge>}
          >
            <div className="screen-income-verify-field screen-income-urn-field">
              <TextField
                id={urnInputId}
                label="URN Number"
                placeholder="Enter your Udyam Registration Number (optional)"
                autoComplete="off"
                value={data.urnNumber}
                onChange={handleUrnChange}
                disabled={data.isUrnVerified}
                action={
                  data.isUrnVerified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    <Button
                      type="button"
                      className="screen-income-verify-btn"
                      onClick={handleVerifyUrn}
                      disabled={!canVerifyUrn}
                    >
                      {isVerifyingUrn ? 'Verifying…' : 'Verify URN'}
                    </Button>
                  )
                }
              />
              {data.isUrnVerified && (
                <button
                  type="button"
                  className="screen-income-change-link"
                  onClick={handleChangeUrn}
                >
                  Change URN
                </button>
              )}
            </div>
          </SectionCard>

          <div className="screen-income-actions">
            <Button type="submit" disabled={!isSaveEnabled}>
              Save &amp; Continue
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Screen08Income;
