import { useState } from 'react';
import RoleSelectScreen from './components/RoleSelectScreen';
import CustomerFlowContainer from './components/customer/CustomerFlowContainer';

interface IdbiPersonalLoanViewProps {
  /** Hands control back to the Hub, closing this journey's workspace. */
  onExit: () => void;
}

type JourneyScreen = 'role-select' | 'customer-flow';

/**
 * IDBI Bank Personal Loan Journey — root view.
 *
 * Renders the Role Select screen first (Customer / Banker / Admin), as
 * this journey's actual entry point. Only "Customer" is wired up — selecting
 * it advances into the Customer Flow (`CustomerFlowContainer`), which has
 * all 14 Customer Flow screens (Entry -> Success). "Banker" and "Admin"
 * show an inert "coming soon" notice and never navigate anywhere (out of
 * scope for this rebuild — see `docs/journey-01-idbi-personal-loan-plan.md`).
 *
 * `onExit` is threaded down to both screens so there is always a visible,
 * persistent way back to the Hub, even mid-flow.
 */
function IdbiPersonalLoanView({ onExit }: IdbiPersonalLoanViewProps) {
  const [screen, setScreen] = useState<JourneyScreen>('role-select');

  if (screen === 'customer-flow') {
    return (
      <CustomerFlowContainer
        onExit={onExit}
        onBackToRoleSelect={() => setScreen('role-select')}
      />
    );
  }

  return (
    <RoleSelectScreen
      onSelectCustomer={() => setScreen('customer-flow')}
      onExit={onExit}
    />
  );
}

export default IdbiPersonalLoanView;
