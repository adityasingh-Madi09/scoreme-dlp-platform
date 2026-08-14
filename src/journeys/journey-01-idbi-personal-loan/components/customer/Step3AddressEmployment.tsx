import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Briefcase, Building2, FileUp, Home, MapPin } from 'lucide-react';
import {
  Button,
  Checkbox,
  SectionCard,
  SectionQuickNav,
  Select,
  TextField,
} from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import './Step3AddressEmployment.css';

const PINCODE_PATTERN = /^\d{6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^\d{10}$/;

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

const OCCUPATION_OPTIONS = ['Salaried', 'Self Employed', 'Retired', 'Housemaker', 'Student', 'Others'];

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

const QUICK_NAV_ITEMS = [
  { id: 'step3-current-address', label: 'Current Address' },
  { id: 'step3-permanent-address', label: 'Permanent Address' },
  { id: 'step3-employment', label: 'Employment' },
  { id: 'step3-office', label: 'Office Address' },
];

/**
 * Step 3 — Address & Employment. Merges the old Screen06Address (current +
 * permanent address, address proof upload) with Screen07Professional
 * (employment details, office address/contact) into one long-form screen
 * with 4 ribbon sections. Uses `SectionQuickNav` to jump between sections,
 * since this is the longest of the 7 consolidated screens.
 */
function Step3AddressEmployment() {
  const { data, updateData, goNext } = useCustomerFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState('');

  const currentLine1Id = useId();
  const currentLine2Id = useId();
  const currentPincodeId = useId();
  const currentCityId = useId();
  const currentStateId = useId();
  const sameAsCurrentId = useId();
  const permanentLine1Id = useId();
  const permanentLine2Id = useId();
  const permanentPincodeId = useId();
  const permanentCityId = useId();
  const permanentStateId = useId();
  const fileInputId = useId();
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

  const isCurrentPincodeValid = data.currentPincode.length === 0 || PINCODE_PATTERN.test(data.currentPincode);
  const isPermanentPincodeValid =
    data.permanentPincode.length === 0 || PINCODE_PATTERN.test(data.permanentPincode);
  const isOfficePincodeValid = data.officePincode.length === 0 || PINCODE_PATTERN.test(data.officePincode);
  const isOfficeMobileValid = data.officeMobile.length === 0 || MOBILE_PATTERN.test(data.officeMobile);
  const isOfficeEmailValid = data.officeEmail.length === 0 || EMAIL_PATTERN.test(data.officeEmail);

  // While "Same as current address" is checked, keep the permanent address
  // fields mirrored to the current address fields. Unchecking leaves the
  // permanent fields exactly as they last were (no force-clear).
  useEffect(() => {
    if (!data.permanentSameAsCurrent) return;
    updateData({
      permanentAddressLine1: data.currentAddressLine1,
      permanentAddressLine2: data.currentAddressLine2,
      permanentPincode: data.currentPincode,
      permanentCity: data.currentCity,
      permanentState: data.currentState,
    });
  }, [
    data.permanentSameAsCurrent,
    data.currentAddressLine1,
    data.currentAddressLine2,
    data.currentPincode,
    data.currentCity,
    data.currentState,
    updateData,
  ]);

  const handleSameAsCurrentToggle = (event: ChangeEvent<HTMLInputElement>) => {
    updateData({ permanentSameAsCurrent: event.target.checked });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileError('');
    updateData({ addressProofFileName: file.name });
  };

  const handleRemoveFile = () => {
    updateData({ addressProofFileName: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNumberFieldChange =
    (field: 'yearsInCurrentOrg' | 'noOfDependents') => (event: ChangeEvent<HTMLInputElement>) => {
      updateData({ [field]: event.target.value.replace(/\D/g, '') });
    };

  const isCurrentAddressValid =
    data.currentAddressLine1.trim().length > 0 &&
    PINCODE_PATTERN.test(data.currentPincode) &&
    data.currentCity.trim().length > 0 &&
    data.currentState.length > 0;

  const isPermanentAddressValid =
    data.permanentAddressLine1.trim().length > 0 &&
    PINCODE_PATTERN.test(data.permanentPincode) &&
    data.permanentCity.trim().length > 0 &&
    data.permanentState.length > 0;

  const isEmploymentValid =
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

  const isSaveEnabled =
    isCurrentAddressValid &&
    isPermanentAddressValid &&
    data.addressProofFileName.length > 0 &&
    isEmploymentValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSaveEnabled) {
      if (!data.addressProofFileName) {
        setFileError('Please upload your address proof to continue.');
      }
      return;
    }
    goNext();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionQuickNav items={QUICK_NAV_ITEMS} />

      <SectionCard id="step3-current-address" icon={<MapPin size={16} />} title="Current Address">
        <div className="step3-grid">
          <TextField
            id={currentLine1Id}
            label="Address Line 1"
            placeholder="House/flat no., building, street"
            value={data.currentAddressLine1}
            onChange={(event) => updateData({ currentAddressLine1: event.target.value })}
            required
          />
          <TextField
            id={currentLine2Id}
            label="Address Line 2"
            placeholder="Area, landmark (optional)"
            value={data.currentAddressLine2}
            onChange={(event) => updateData({ currentAddressLine2: event.target.value })}
          />
          <TextField
            id={currentPincodeId}
            label="Pincode"
            inputMode="numeric"
            placeholder="Enter 6-digit pincode"
            value={data.currentPincode}
            onChange={(event) =>
              updateData({ currentPincode: event.target.value.replace(/\D/g, '').slice(0, 6) })
            }
            maxLength={6}
            error={!isCurrentPincodeValid ? 'Enter a valid 6-digit pincode.' : undefined}
            required
          />
          <TextField
            id={currentCityId}
            label="City"
            placeholder="Enter city"
            value={data.currentCity}
            onChange={(event) => updateData({ currentCity: event.target.value })}
            required
          />
          <Select
            id={currentStateId}
            label="State"
            placeholder="Select state"
            options={STATE_OPTIONS}
            value={data.currentState}
            onChange={(event) => updateData({ currentState: event.target.value })}
            required
          />
        </div>
      </SectionCard>

      <SectionCard id="step3-permanent-address" icon={<Home size={16} />} title="Permanent Address & Proof">
        <Checkbox
          id={sameAsCurrentId}
          label="Same as current address"
          checked={data.permanentSameAsCurrent}
          onChange={handleSameAsCurrentToggle}
        />

        <div className="step3-grid">
          <TextField
            id={permanentLine1Id}
            label="Address Line 1"
            placeholder="House/flat no., building, street"
            value={data.permanentAddressLine1}
            onChange={(event) => updateData({ permanentAddressLine1: event.target.value })}
            disabled={data.permanentSameAsCurrent}
            required
          />
          <TextField
            id={permanentLine2Id}
            label="Address Line 2"
            placeholder="Area, landmark (optional)"
            value={data.permanentAddressLine2}
            onChange={(event) => updateData({ permanentAddressLine2: event.target.value })}
            disabled={data.permanentSameAsCurrent}
          />
          <TextField
            id={permanentPincodeId}
            label="Pincode"
            inputMode="numeric"
            placeholder="Enter 6-digit pincode"
            value={data.permanentPincode}
            onChange={(event) =>
              updateData({ permanentPincode: event.target.value.replace(/\D/g, '').slice(0, 6) })
            }
            maxLength={6}
            disabled={data.permanentSameAsCurrent}
            error={!isPermanentPincodeValid ? 'Enter a valid 6-digit pincode.' : undefined}
            required
          />
          <TextField
            id={permanentCityId}
            label="City"
            placeholder="Enter city"
            value={data.permanentCity}
            onChange={(event) => updateData({ permanentCity: event.target.value })}
            disabled={data.permanentSameAsCurrent}
            required
          />
          <Select
            id={permanentStateId}
            label="State"
            placeholder="Select state"
            options={STATE_OPTIONS}
            value={data.permanentState}
            onChange={(event) => updateData({ permanentState: event.target.value })}
            disabled={data.permanentSameAsCurrent}
            required
          />
        </div>

        <p className="step3-upload-hint">
          <FileUp size={14} /> Upload a scanned copy of your address proof (PDF or image).
        </p>
        <div className="step3-file-row">
          {data.addressProofFileName ? (
            <>
              <span className="step3-file-name">{data.addressProofFileName}</span>
              <Button
                type="button"
                variant="secondary"
                className="step3-file-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Change file
              </Button>
              <button type="button" className="step3-file-remove" onClick={handleRemoveFile}>
                Remove
              </button>
            </>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="step3-file-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose file
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          accept="application/pdf,image/*"
          className="step3-file-input"
          onChange={handleFileChange}
          aria-label="Address proof file"
          tabIndex={-1}
        />
        {fileError && (
          <p className="core-field-error" role="alert">
            {fileError}
          </p>
        )}
      </SectionCard>

      <SectionCard id="step3-employment" icon={<Briefcase size={16} />} title="Employment Details">
        <div className="step3-occupation-block">
          <span className="core-label">
            Occupation Type
            <span className="core-label-required" aria-hidden="true">
              *
            </span>
          </span>
          <div className="step3-chip-row" role="group" aria-label="Occupation Type">
            {OCCUPATION_OPTIONS.map((option) => {
              const isSelected = data.occupationType === option;
              return (
                <Button
                  key={option}
                  type="button"
                  variant={isSelected ? 'primary' : 'secondary'}
                  className="step3-chip"
                  aria-pressed={isSelected}
                  onClick={() => updateData({ occupationType: option })}
                >
                  {option}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="step3-grid">
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

      <SectionCard id="step3-office" icon={<Building2 size={16} />} title="Office Address & Contact">
        <div className="step3-grid">
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
            error={!isOfficePincodeValid ? 'Enter a valid 6-digit pincode.' : undefined}
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
            error={!isOfficeMobileValid ? 'Enter a valid 10-digit mobile number.' : undefined}
            required
          />
          <TextField
            id={officeEmailId}
            label="Office Email ID"
            type="email"
            placeholder="Enter your email here"
            value={data.officeEmail}
            onChange={(event) => updateData({ officeEmail: event.target.value })}
            error={!isOfficeEmailValid ? 'Enter a valid email address.' : undefined}
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

      <div className="step3-actions">
        <Button type="submit" disabled={!isSaveEnabled}>
          Save &amp; Continue
        </Button>
      </div>
    </form>
  );
}

export default Step3AddressEmployment;
