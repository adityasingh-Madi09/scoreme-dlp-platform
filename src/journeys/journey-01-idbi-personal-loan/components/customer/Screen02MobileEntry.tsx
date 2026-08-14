import { useId } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Button, TextField } from '../../../../core/components';
import { useCustomerFlow } from '../../context/useCustomerFlow';
import './Screen02MobileEntry.css';

const MOBILE_NUMBER_PATTERN = /^\d{10}$/;

/**
 * Customer Flow — Screen 2 (Mobile Entry). Collects the mobile number to
 * send the OTP to. The number is stored on the shared Customer Flow
 * context (`mobileNumber`) so Screen 3 (and later Screen 5) can reuse it.
 * "Send OTP" stays disabled until exactly 10 digits are entered; "Cancel"
 * returns to Screen 1.
 */
function Screen02MobileEntry() {
  const { data, updateData, goNext, goToStep } = useCustomerFlow();
  const mobileNumberInputId = useId();
  const isValid = MOBILE_NUMBER_PATTERN.test(data.mobileNumber);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10);
    updateData({ mobileNumber: digitsOnly });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isValid) {
      goNext();
    }
  };

  return (
    <section className="screen-mobile-entry">
      <div className="screen-mobile-entry-card">
        <p className="screen-mobile-entry-subtext">
          Enter the mobile number registered with your account to apply for a
          personal loan.
        </p>

        <form className="screen-mobile-entry-form" onSubmit={handleSubmit} noValidate>
          <div>
            <TextField
              id={mobileNumberInputId}
              label="Mobile Number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="Enter 10-digit mobile number"
              value={data.mobileNumber}
              onChange={handleChange}
              maxLength={10}
              required
            />
            <p className="screen-mobile-entry-helper">
              You will receive an OTP on this number
            </p>
          </div>

          <div className="screen-mobile-entry-actions">
            <Button type="submit" disabled={!isValid}>
              Send OTP
            </Button>
            <Button type="button" variant="secondary" onClick={() => goToStep(1)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Screen02MobileEntry;
