import { useId } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Briefcase, Building2 } from 'lucide-react';
import { Button, SectionCard, Select, TextField } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import './Screen07Professional.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PINCODE_PATTERN = /^\d{6}$/;
const MOBILE_PATTERN = /^\d{10}$/;

const OCCUPATION_OPTIONS = [
  'Salaried',
  'Self Employed',
  'Retired',
  'Housemaker',
  'Student',
  'Others',
];

const EMPLOYER_TYPE_OPTIONS = [
  { value: 'Government', label: 'Government' },
  { value: 'Private', label: 'Private' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'Permanent', label: 'Permanent' },
  { value: 'Apprenticeship', label: 'Apprenticeship' },
  { value: 'Contract', label: 'Contract' },
];

const DESIGNATION_OPTIONS = [
  { value: 'Executive', label: 'Executive' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Senior Manager', label: 'Senior Manager' },
  { value: 'Director', label: 'Director' },
  { value: 'Other', label: 'Other' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'Sales', label: 'Sales' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Operations', label: 'Operations' },
  { value: 'IT', label: 'IT' },
  { value: 'HR', label: 'HR' },
  { value: 'Other', label: 'Other' },
];

/**
 * Customer Flow — Screen 7 (Professional/Employment details). Reference:
 * `design_assets/journey-idbi-personal-loan/customer/IDBI_PLJ_S_4-7.png`
 * (already reviewed). Deliberately trimmed from that reference per the
 * task brief — Employee Code, Office Landline, Extn and Fax No are omitted
 * (low realism value for a prototype, adds clutter).
 *
 * Occupation Type is rendered as a row of selectable chips built from the
 * shared `Button` primitive (toggling `variant` between 'primary'/
 * 'secondary' for the selected look, with only sizing/layout overridden in
 * this journey's CSS — same override convention already used by
 * Screen05BasicInfo's inline "Verify" button) rather than a native select,
 * since the reference shows a chip row, not a dropdown.
 */
function Screen07Professional() {
  const { data, updateData, goNext } = useCustomerFlow();

  const employerTypeId = useId();
  const employmentTypeId = useId();
  const officeCompanyNameId = useId();
  const designationId = useId();
  const departmentId = useId();
  const officeFlatBuildingId = useId();
  const officeRoadNameId = useId();
  const officePincodeId = useId();
  const presentCityId = useId();
  const presentLandmarkId = useId();
  const officeMobileId = useId();
  const officeEmailId = useId();
  const yearsInCurrentOrgId = useId();
  const noOfDependentsId = useId();

  const isPincodeValid = data.officePincode.length === 0 || PINCODE_PATTERN.test(data.officePincode);
  const isMobileValid = data.officeMobile.length === 0 || MOBILE_PATTERN.test(data.officeMobile);
  const isEmailValid = data.officeEmail.length === 0 || EMAIL_PATTERN.test(data.officeEmail);

  const isSaveEnabled =
    data.occupationType.length > 0 &&
    data.employerType.length > 0 &&
    data.employmentType.length > 0 &&
    data.officeCompanyName.trim().length > 0 &&
    data.designation.length > 0 &&
    data.department.length > 0 &&
    data.officeFlatBuilding.trim().length > 0 &&
    data.officeRoadName.trim().length > 0 &&
    PINCODE_PATTERN.test(data.officePincode) &&
    data.presentCity.trim().length > 0 &&
    MOBILE_PATTERN.test(data.officeMobile) &&
    EMAIL_PATTERN.test(data.officeEmail) &&
    data.yearsInCurrentOrg.trim().length > 0 &&
    data.noOfDependents.trim().length > 0;

  const handleNumberFieldChange =
    (field: 'yearsInCurrentOrg' | 'noOfDependents') => (event: ChangeEvent<HTMLInputElement>) => {
      updateData({ [field]: event.target.value.replace(/\D/g, '') });
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaveEnabled) {
      goNext();
    }
  };

  return (
    <section className="screen-professional">
      <div className="screen-professional-card">
        <p className="screen-professional-subtext">
          Tell us about your current employment and organisation.
        </p>

        <form className="screen-professional-form" onSubmit={handleSubmit} noValidate>
          <SectionCard icon={<Briefcase size={16} />} title="Employment Details">
            <div className="screen-professional-occupation-block">
              <span className="core-label">
                Occupation Type<span className="core-label-required" aria-hidden="true">*</span>
              </span>
              <div className="screen-professional-chip-row" role="group" aria-label="Occupation Type">
                {OCCUPATION_OPTIONS.map((option) => {
                  const isSelected = data.occupationType === option;
                  return (
                    <Button
                      key={option}
                      type="button"
                      variant={isSelected ? 'primary' : 'secondary'}
                      className="screen-professional-chip"
                      aria-pressed={isSelected}
                      onClick={() => updateData({ occupationType: option })}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="screen-professional-grid">
              <Select
                id={employerTypeId}
                label="Employer Type"
                placeholder="Select employer type"
                options={EMPLOYER_TYPE_OPTIONS}
                value={data.employerType}
                onChange={(event) => updateData({ employerType: event.target.value })}
                required
              />
              <Select
                id={employmentTypeId}
                label="Employment Type"
                placeholder="Select employment type"
                options={EMPLOYMENT_TYPE_OPTIONS}
                value={data.employmentType}
                onChange={(event) => updateData({ employmentType: event.target.value })}
                required
              />
              <TextField
                id={officeCompanyNameId}
                label="Office/Company Name"
                placeholder="Enter your office/company name"
                value={data.officeCompanyName}
                onChange={(event) => updateData({ officeCompanyName: event.target.value })}
                required
              />
              <Select
                id={designationId}
                label="Designation"
                placeholder="Select designation"
                options={DESIGNATION_OPTIONS}
                value={data.designation}
                onChange={(event) => updateData({ designation: event.target.value })}
                required
              />
              <Select
                id={departmentId}
                label="Department"
                placeholder="Select department"
                options={DEPARTMENT_OPTIONS}
                value={data.department}
                onChange={(event) => updateData({ department: event.target.value })}
                required
              />
            </div>
          </SectionCard>

          <SectionCard icon={<Building2 size={16} />} title="Office Address & Contact">
            <div className="screen-professional-grid">
              <TextField
                id={officeFlatBuildingId}
                label="Office Flat No & Building Name"
                placeholder="Enter your office flat no. here"
                value={data.officeFlatBuilding}
                onChange={(event) => updateData({ officeFlatBuilding: event.target.value })}
                required
              />
              <TextField
                id={officeRoadNameId}
                label="Road No/Road Name"
                placeholder="Enter your road no/road name"
                value={data.officeRoadName}
                onChange={(event) => updateData({ officeRoadName: event.target.value })}
                required
              />
              <TextField
                id={officePincodeId}
                label="Office Pincode"
                inputMode="numeric"
                placeholder="Enter 6-digit pincode"
                value={data.officePincode}
                onChange={(event) =>
                  updateData({ officePincode: event.target.value.replace(/\D/g, '').slice(0, 6) })
                }
                maxLength={6}
                error={!isPincodeValid ? 'Enter a valid 6-digit pincode.' : undefined}
                required
              />
              <TextField
                id={presentCityId}
                label="Present City"
                placeholder="Enter present city"
                value={data.presentCity}
                onChange={(event) => updateData({ presentCity: event.target.value })}
                required
              />
              <TextField
                id={presentLandmarkId}
                label="Present Landmark"
                placeholder="Enter your landmark here"
                value={data.presentLandmark}
                onChange={(event) => updateData({ presentLandmark: event.target.value })}
              />
              <TextField
                id={officeMobileId}
                label="Office Mobile"
                type="tel"
                inputMode="numeric"
                placeholder="Enter 10-digit mobile number"
                value={data.officeMobile}
                onChange={(event) =>
                  updateData({ officeMobile: event.target.value.replace(/\D/g, '').slice(0, 10) })
                }
                maxLength={10}
                error={!isMobileValid ? 'Enter a valid 10-digit mobile number.' : undefined}
                required
              />
              <TextField
                id={officeEmailId}
                label="Office Email ID"
                type="email"
                placeholder="Enter your email here"
                value={data.officeEmail}
                onChange={(event) => updateData({ officeEmail: event.target.value })}
                error={!isEmailValid ? 'Enter a valid email address.' : undefined}
                required
              />
              <TextField
                id={yearsInCurrentOrgId}
                label="No of Years in Current Organisation"
                inputMode="numeric"
                placeholder="Enter number of years"
                value={data.yearsInCurrentOrg}
                onChange={handleNumberFieldChange('yearsInCurrentOrg')}
                required
              />
              <TextField
                id={noOfDependentsId}
                label="No of Dependents"
                inputMode="numeric"
                placeholder="Enter number of dependents"
                value={data.noOfDependents}
                onChange={handleNumberFieldChange('noOfDependents')}
                required
              />
            </div>
          </SectionCard>

          <div className="screen-professional-actions">
            <Button type="submit" disabled={!isSaveEnabled}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Screen07Professional;
