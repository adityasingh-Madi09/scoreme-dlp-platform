import { useId } from 'react';
import type { FormEvent } from 'react';
import { ShieldAlert, UserPlus } from 'lucide-react';
import { Button, SectionCard, Select, TextField } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import type { CustomerFlowData } from '../../context/useCustomerFlow';
import './Screen09Nominee.css';

const PINCODE_PATTERN = /^\d{6}$/;

const RELATIONSHIP_OPTIONS = [
  'Spouse',
  'Son',
  'Daughter',
  'Father',
  'Mother',
  'Sibling',
  'Other',
].map((label) => ({ value: label, label }));

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

const DIRECTOR_RELATIONSHIP_OPTIONS = [
  'Spouse',
  'Sibling',
  'Parent',
  'Aunt',
  'Uncle',
  'Other',
].map((label) => ({ value: label, label }));

const YES_NO_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
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
const EMPTY_DIRECTOR_FIELDS: Pick<
  CustomerFlowData,
  'directorRelationship' | 'directorName'
> = {
  directorRelationship: '',
  directorName: '',
};

/**
 * Customer Flow — Screen 9 (Nominee Details). Two independent sections:
 *
 * 1. "Do you want to add a nominee?" — Yes/No toggle. Choosing 'No' hides
 *    (and clears) the nominee detail fields entirely, per spec; choosing
 *    'Yes' reveals them. Mirrors the same conditional-clear pattern
 *    Screen05BasicInfo uses for its spouse-name field.
 * 2. "Relationship Disclosure" — a genuine bank KYC/compliance question
 *    ("are you related to a director/senior officer of the bank?"), kept
 *    independent of the nominee toggle above. Choosing 'Yes' reveals (and
 *    'No' hides + clears) the two follow-up fields.
 *
 * "Save & Continue" requires both toggles to have been explicitly answered,
 * plus whichever conditional fields that unlocks.
 */
function Screen09Nominee() {
  const { data, updateData, goNext } = useCustomerFlow();

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

  const hasNominee = data.hasNominee === 'Yes';
  const isRelatedToDirector = data.isRelatedToDirector === 'Yes';

  const isPincodeValid =
    data.nomineePincode.length === 0 || PINCODE_PATTERN.test(data.nomineePincode);

  const handleHasNomineeChange = (next: 'Yes' | 'No') => {
    updateData({
      hasNominee: next,
      ...(next === 'Yes' ? {} : EMPTY_NOMINEE_FIELDS),
    });
  };

  const handleIsRelatedToDirectorChange = (next: 'Yes' | 'No' | '') => {
    updateData({
      isRelatedToDirector: next,
      ...(next === 'Yes' ? {} : EMPTY_DIRECTOR_FIELDS),
    });
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
    (isRelatedToDirector &&
      data.directorRelationship.length > 0 &&
      data.directorName.trim().length > 0);

  const isSaveEnabled =
    data.hasNominee.length > 0 &&
    data.isRelatedToDirector.length > 0 &&
    isNomineeSectionValid &&
    isDisclosureSectionValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaveEnabled) {
      goNext();
    }
  };

  return (
    <section className="screen-nominee">
      <div className="screen-nominee-card">
        <p className="screen-nominee-subtext">
          Let us know who should be contacted regarding your loan account, and
          confirm a couple of standard bank compliance questions.
        </p>

        <form className="screen-nominee-form" onSubmit={handleSubmit} noValidate>
          <SectionCard icon={<UserPlus size={16} />} title="Do you want to add a nominee?">
            <div className="screen-nominee-radio-row" role="radiogroup" aria-label="Do you want to add a nominee?">
              <label className="screen-nominee-radio-option">
                <input
                  type="radio"
                  name="hasNominee"
                  value="Yes"
                  checked={data.hasNominee === 'Yes'}
                  onChange={() => handleHasNomineeChange('Yes')}
                />
                Yes
              </label>
              <label className="screen-nominee-radio-option">
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
              <div className="screen-nominee-grid">
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
                  onChange={(event) =>
                    updateData({ nomineeRelationship: event.target.value })
                  }
                  required
                />
                <TextField
                  id={nomineeDobId}
                  label="Date of Birth"
                  type="date"
                  value={data.nomineeDateOfBirth}
                  onChange={(event) =>
                    updateData({ nomineeDateOfBirth: event.target.value })
                  }
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
                    updateData({
                      nomineePincode: event.target.value.replace(/\D/g, '').slice(0, 6),
                    })
                  }
                  maxLength={6}
                  error={!isPincodeValid ? 'Enter a valid 6-digit pincode.' : undefined}
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

          <SectionCard icon={<ShieldAlert size={16} />} title="Relationship Disclosure">
            <div className="screen-nominee-grid">
              <Select
                id={isRelatedToDirectorId}
                label="Are you related to any director or senior officer of the bank?"
                placeholder="Select an option"
                options={YES_NO_OPTIONS}
                value={data.isRelatedToDirector}
                onChange={(event) =>
                  handleIsRelatedToDirectorChange(
                    event.target.value as 'Yes' | 'No' | '',
                  )
                }
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
                    onChange={(event) =>
                      updateData({ directorRelationship: event.target.value })
                    }
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

          <div className="screen-nominee-actions">
            <Button type="submit" disabled={!isSaveEnabled}>
              Save &amp; Continue
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Screen09Nominee;
