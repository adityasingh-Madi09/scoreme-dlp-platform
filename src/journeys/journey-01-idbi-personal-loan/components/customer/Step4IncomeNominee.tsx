import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Building2, FileText, Landmark, ShieldAlert, UserPlus } from 'lucide-react';
import {
  Badge,
  Button,
  SectionCard,
  SectionQuickNav,
  Select,
  TextField,
} from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import type { CustomerFlowData } from '../../context/useCustomerFlow';
import { MOCK_BANK_NAME, MOCK_ITR_SUMMARY } from '../../mockIncome.constants';
import './Step4IncomeNominee.css';

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
const PINCODE_PATTERN = /^\d{6}$/;
const BANK_VERIFY_DELAY_MS = 800;
const URN_VERIFY_DELAY_MS = 800;
const ITR_ANALYSE_DELAY_MS = 2500;

type ItrStage = 'idle' | 'loading' | 'done';

const RELATIONSHIP_OPTIONS = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Sibling', 'Other'].map(
  (label) => ({ value: label, label }),
);

const STATE_OPTIONS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi (NCT)',
  'Jammu & Kashmir',
  'Ladakh',
  'Chandigarh',
  'Puducherry',
].map((state) => ({ value: state, label: state }));

const DIRECTOR_RELATIONSHIP_OPTIONS = ['Spouse', 'Sibling', 'Parent', 'Aunt', 'Uncle', 'Other'].map(
  (label) => ({ value: label, label }),
);

const YES_NO_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

const QUICK_NAV_ITEMS = [
  { id: 'step4-bank', label: 'Primary Bank' },
  { id: 'step4-income', label: 'Income Details' },
  { id: 'step4-udyam', label: 'Udyam' },
  { id: 'step4-nominee', label: 'Nominee' },
  { id: 'step4-disclosure', label: 'Disclosure' },
];

/** Fields cleared whenever the nominee toggle switches away from 'Yes'. */
const EMPTY_NOMINEE_FIELDS: Pick<
  CustomerFlowData,
  | 'nomineeName'
  | 'nomineeRelationship'
  | 'nomineeDateOfBirth'
  | 'nomineeAddress'
  | 'nomineePincode'
  | 'nomineeCity'
  | 'nomineeState'
> = {
  nomineeName: '',
  nomineeRelationship: '',
  nomineeDateOfBirth: '',
  nomineeAddress: '',
  nomineePincode: '',
  nomineeCity: '',
  nomineeState: '',
};

/** Fields cleared whenever the director-relationship disclosure switches
 *  away from 'Yes'. */
const EMPTY_DIRECTOR_FIELDS: Pick<CustomerFlowData, 'directorRelationship' | 'directorName'> = {
  directorRelationship: '',
  directorName: '',
};

/**
 * Step 4 — Income & Nominee. Merges the old Screen08Income (bank details +
 * optional ITR fetch + optional Udyam) with Screen09Nominee (nominee
 * toggle + bank compliance disclosure) into one long-form screen with 5
 * ribbon sections, navigable via `SectionQuickNav`.
 *
 * "Save & Continue" gating: valid-format IFSC + a bank-verified account
 * number, plus both the nominee and disclosure toggles explicitly
 * answered (and whichever conditional fields those unlock). ITR fetch and
 * Udyam stay purely optional/informational, matching the original screens.
 */
function Step4IncomeNominee() {
  const { data, updateData, goNext } = useCustomerFlow();

  const ifscInputId = useId();
  const accountNumberInputId = useId();
  const bankNameInputId = useId();
  const itrUsernameInputId = useId();
  const itrPasswordInputId = useId();
  const urnInputId = useId();
  const nomineeNameId = useId();
  const nomineeRelationshipId = useId();
  const nomineeDobId = useId();
  const nomineeAddressId = useId();
  const nomineePincodeId = useId();
  const nomineeCityId = useId();
  const nomineeStateId = useId();
  const isRelatedToDirectorId = useId();
  const directorRelationshipId = useId();
  const directorNameId = useId();

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
    data.ifscCode.length > 0 && !isIfscFormatValid ? 'Enter a valid IFSC code (e.g. ABCD0123456).' : undefined;

  const canVerifyBank = isIfscFormatValid && data.accountNumber.trim().length > 0 && !isVerifyingBank;
  const isBankSectionValid = isIfscFormatValid && data.accountNumber.trim().length > 0 && data.isBankVerified;
  const canVerifyUrn = data.urnNumber.trim().length > 0 && !isVerifyingUrn;
  const canFetchItr =
    data.itrUsername.trim().length > 0 && data.itrPassword.trim().length > 0 && itrStage !== 'loading';

  const hasNominee = data.hasNominee === 'Yes';
  const isRelatedToDirector = data.isRelatedToDirector === 'Yes';
  const isNomineePincodeValid = data.nomineePincode.length === 0 || PINCODE_PATTERN.test(data.nomineePincode);

  const handleIfscChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateData({ ifscCode: event.target.value.toUpperCase().slice(0, 11), isBankVerified: false, bankName: '' });
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

  const handleHasNomineeChange = (next: 'Yes' | 'No') => {
    updateData({ hasNominee: next, ...(next === 'Yes' ? {} : EMPTY_NOMINEE_FIELDS) });
  };

  const handleIsRelatedToDirectorChange = (next: 'Yes' | 'No' | '') => {
    updateData({ isRelatedToDirector: next, ...(next === 'Yes' ? {} : EMPTY_DIRECTOR_FIELDS) });
  };

  const isNomineeSectionValid =
    data.hasNominee === 'No' ||
    (hasNominee &&
      data.nomineeName.trim().length > 0 &&
      data.nomineeRelationship.length > 0 &&
      data.nomineeDateOfBirth.length > 0 &&
      data.nomineeAddress.trim().length > 0 &&
      PINCODE_PATTERN.test(data.nomineePincode) &&
      data.nomineeCity.trim().length > 0 &&
      data.nomineeState.length > 0);

  const isDisclosureSectionValid =
    data.isRelatedToDirector === 'No' ||
    (isRelatedToDirector && data.directorRelationship.length > 0 && data.directorName.trim().length > 0);

  const isSaveEnabled =
    isBankSectionValid &&
    data.hasNominee.length > 0 &&
    data.isRelatedToDirector.length > 0 &&
    isNomineeSectionValid &&
    isDisclosureSectionValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaveEnabled) goNext();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionQuickNav items={QUICK_NAV_ITEMS} />

      <SectionCard id="step4-bank" icon={<Landmark size={16} />} title="Primary Bank Details">
        <div className="step4-grid">
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

          <div className="step4-verify-field">
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
                  <Button type="button" onClick={handleVerifyBank} disabled={!canVerifyBank}>
                    {isVerifyingBank ? 'Verifying…' : 'Verify Bank Details'}
                  </Button>
                )
              }
            />
            {data.isBankVerified && (
              <button type="button" className="step4-change-link" onClick={handleChangeBankDetails}>
                Change bank details
              </button>
            )}
          </div>

          {data.isBankVerified && (
            <TextField id={bankNameInputId} label="Bank Name" value={data.bankName} disabled readOnly />
          )}
        </div>
      </SectionCard>

      <SectionCard
        id="step4-income"
        icon={<FileText size={16} />}
        title="Income Details"
        action={<Badge variant="neutral">Optional</Badge>}
      >
        <p className="step4-hint">Please enter your ITR login credentials to fetch your income statement.</p>

        <div className="step4-grid">
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

        <div className="step4-itr-actions">
          <Button type="button" variant="secondary" onClick={handleFetchItr} disabled={!canFetchItr}>
            {itrStage === 'loading' ? 'Analysing…' : 'Fetch ITR'}
          </Button>
          {itrStage === 'done' && (
            <button type="button" className="step4-change-link" onClick={handleChangeItrCredentials}>
              Change credentials
            </button>
          )}
        </div>

        {itrStage === 'loading' && (
          <div className="step4-itr-panel step4-itr-panel--loading" role="status" aria-live="polite">
            <span className="step4-spinner" aria-hidden="true" />
            <p>Please wait while we analyse your details. This usually takes a moment.</p>
          </div>
        )}

        {itrStage === 'done' && (
          <div className="step4-itr-panel step4-itr-panel--done" role="status">
            <p className="step4-itr-result-title">Statement fetched successfully</p>
            <dl className="step4-itr-result-list">
              {MOCK_ITR_SUMMARY.map((item) => (
                <div key={item.label} className="step4-itr-result-item">
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="step4-itr-result-note">Illustrative data for this prototype only.</p>
          </div>
        )}
      </SectionCard>

      <SectionCard
        id="step4-udyam"
        icon={<Building2 size={16} />}
        title="Udyam Registration Details"
        action={<Badge variant="neutral">Optional</Badge>}
      >
        <div className="step4-verify-field">
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
                <Button type="button" onClick={handleVerifyUrn} disabled={!canVerifyUrn}>
                  {isVerifyingUrn ? 'Verifying…' : 'Verify URN'}
                </Button>
              )
            }
          />
          {data.isUrnVerified && (
            <button type="button" className="step4-change-link" onClick={handleChangeUrn}>
              Change URN
            </button>
          )}
        </div>
      </SectionCard>

      <SectionCard id="step4-nominee" icon={<UserPlus size={16} />} title="Do you want to add a nominee?">
        <div className="step4-radio-row" role="radiogroup" aria-label="Do you want to add a nominee?">
          <label className="step4-radio-option">
            <input
              type="radio"
              name="hasNominee"
              value="Yes"
              checked={data.hasNominee === 'Yes'}
              onChange={() => handleHasNomineeChange('Yes')}
            />
            Yes
          </label>
          <label className="step4-radio-option">
            <input
              type="radio"
              name="hasNominee"
              value="No"
              checked={data.hasNominee === 'No'}
              onChange={() => handleHasNomineeChange('No')}
            />
            No
          </label>
        </div>

        {hasNominee && (
          <div className="step4-grid">
            <TextField
              id={nomineeNameId}
              label="Nominee Name"
              placeholder="Enter nominee's full name"
              value={data.nomineeName}
              onChange={(event) => updateData({ nomineeName: event.target.value })}
              required
            />
            <Select
              id={nomineeRelationshipId}
              label="Relationship"
              placeholder="Select relationship"
              options={RELATIONSHIP_OPTIONS}
              value={data.nomineeRelationship}
              onChange={(event) => updateData({ nomineeRelationship: event.target.value })}
              required
            />
            <TextField
              id={nomineeDobId}
              label="Date of Birth"
              type="date"
              value={data.nomineeDateOfBirth}
              onChange={(event) => updateData({ nomineeDateOfBirth: event.target.value })}
              required
            />
            <TextField
              id={nomineeAddressId}
              label="Address"
              placeholder="Enter nominee's address"
              value={data.nomineeAddress}
              onChange={(event) => updateData({ nomineeAddress: event.target.value })}
              required
            />
            <TextField
              id={nomineePincodeId}
              label="Pincode"
              inputMode="numeric"
              placeholder="Enter 6-digit pincode"
              value={data.nomineePincode}
              onChange={(event) =>
                updateData({ nomineePincode: event.target.value.replace(/\D/g, '').slice(0, 6) })
              }
              maxLength={6}
              error={!isNomineePincodeValid ? 'Enter a valid 6-digit pincode.' : undefined}
              required
            />
            <TextField
              id={nomineeCityId}
              label="City"
              placeholder="Enter city"
              value={data.nomineeCity}
              onChange={(event) => updateData({ nomineeCity: event.target.value })}
              required
            />
            <Select
              id={nomineeStateId}
              label="State"
              placeholder="Select state"
              options={STATE_OPTIONS}
              value={data.nomineeState}
              onChange={(event) => updateData({ nomineeState: event.target.value })}
              required
            />
          </div>
        )}
      </SectionCard>

      <SectionCard id="step4-disclosure" icon={<ShieldAlert size={16} />} title="Relationship Disclosure">
        <div className="step4-grid">
          <Select
            id={isRelatedToDirectorId}
            label="Are you related to any director or senior officer of the bank?"
            placeholder="Select an option"
            options={YES_NO_OPTIONS}
            value={data.isRelatedToDirector}
            onChange={(event) => handleIsRelatedToDirectorChange(event.target.value as 'Yes' | 'No' | '')}
            required
          />

          {isRelatedToDirector && (
            <>
              <Select
                id={directorRelationshipId}
                label="Relationship with Director/Senior Officer"
                placeholder="Select relationship"
                options={DIRECTOR_RELATIONSHIP_OPTIONS}
                value={data.directorRelationship}
                onChange={(event) => updateData({ directorRelationship: event.target.value })}
                required
              />
              <TextField
                id={directorNameId}
                label="Name of Director/Senior Officer"
                placeholder="Enter their name"
                value={data.directorName}
                onChange={(event) => updateData({ directorName: event.target.value })}
                required
              />
            </>
          )}
        </div>
      </SectionCard>

      <div className="step4-actions">
        <Button type="submit" disabled={!isSaveEnabled}>
          Save &amp; Continue
        </Button>
      </div>
    </form>
  );
}

export default Step4IncomeNominee;
