import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { FileUp, Home, MapPin } from 'lucide-react';
import { Button, Checkbox, SectionCard, Select, TextField } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import './Screen06Address.css';

const PINCODE_PATTERN = /^\d{6}$/;

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

/**
 * Customer Flow — Screen 6 (Address + address proof upload). No Figma
 * reference exists for this screen (per the task brief); fields/layout are
 * a standard KYC address-collection pattern designed to match this
 * platform's existing screens (same card shell, `core/components`
 * primitives, spacing).
 *
 * Two address sections (Current, Permanent) plus a native file input for
 * the address proof document. The Permanent section's "Same as current
 * address" checkbox mirrors `currentAddress*` into `permanentAddress*` and
 * locks those fields read-only for as long as it stays checked; unchecking
 * simply stops the sync and re-enables editing, leaving whatever values
 * were last there in place (not force-cleared) — see the effect below.
 */
function Screen06Address() {
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

  const isCurrentPincodeValid = data.currentPincode.length === 0 || PINCODE_PATTERN.test(data.currentPincode);
  const isPermanentPincodeValid =
    data.permanentPincode.length === 0 || PINCODE_PATTERN.test(data.permanentPincode);

  // While "Same as current address" is checked, keep the permanent address
  // fields mirrored to the current address fields. Only re-runs when the
  // checkbox or one of the *current* address fields changes, so unchecking
  // leaves the permanent fields exactly as they last were (no force-clear).
  useEffect(() => {
    if (!data.permanentSameAsCurrent) return;
    updateData({
      permanentAddressLine1: data.currentAddressLine1,
      permanentAddressLine2: data.currentAddressLine2,
      permanentPincode: data.currentPincode,
      permanentCity: data.currentCity,
      permanentState: data.currentState,
    });
    // `updateData` is stable (memoized with useCallback in
    // CustomerFlowContext.tsx), so including it here doesn't cause extra
    // effect runs — deliberately excludes the permanent* fields, since
    // syncing should only be triggered by the checkbox or the
    // current-address values changing, not by the sync's own writes.
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const isSaveEnabled =
    isCurrentAddressValid && isPermanentAddressValid && data.addressProofFileName.length > 0;

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
    <section className="screen-address">
      <div className="screen-address-card">
        <p className="screen-address-subtext">
          Tell us where you currently live and your permanent address.
        </p>

        <form className="screen-address-form" onSubmit={handleSubmit} noValidate>
          <SectionCard icon={<MapPin size={16} />} title="Current Address">
            <div className="screen-address-grid">
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

          <SectionCard icon={<Home size={16} />} title="Permanent Address">
            <Checkbox
              id={sameAsCurrentId}
              label="Same as current address"
              checked={data.permanentSameAsCurrent}
              onChange={handleSameAsCurrentToggle}
              className="screen-address-same-checkbox"
            />

            <div className="screen-address-grid">
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
                  updateData({
                    permanentPincode: event.target.value.replace(/\D/g, '').slice(0, 6),
                  })
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
          </SectionCard>

          <SectionCard icon={<FileUp size={16} />} title="Address Proof">
            <p className="screen-address-upload-hint">
              Upload a scanned copy of your address proof (PDF or image).
            </p>

            <div className="screen-address-file-row">
              {data.addressProofFileName ? (
                <>
                  <span className="screen-address-file-name">{data.addressProofFileName}</span>
                  <Button
                    type="button"
                    variant="secondary"
                    className="screen-address-file-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change file
                  </Button>
                  <button
                    type="button"
                    className="screen-address-file-remove"
                    onClick={handleRemoveFile}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="screen-address-file-btn"
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
              className="screen-address-file-input"
              onChange={handleFileChange}
              aria-label="Address proof file"
              tabIndex={-1}
            />
            {fileError && (
              <p className="screen-address-file-error" role="alert">
                {fileError}
              </p>
            )}
          </SectionCard>

          <div className="screen-address-actions">
            <Button type="submit" disabled={!isSaveEnabled}>
              Save &amp; Continue
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Screen06Address;
