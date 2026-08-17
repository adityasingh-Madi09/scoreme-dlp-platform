import { useState } from 'react';
import RoleSelectScreen from './components/RoleSelectScreen';
import CustomerFlowContainer from './components/customer/CustomerFlowContainer';
import BankerFlowContainer from './components/banker/BankerFlowContainer';

interface IdbiPersonalLoanViewProps {
  /** Hands control back to the Hub, closing this journey's workspace. */
  onExit: () => void;
}

type JourneyScreen = 'role-select' | 'customer-flow' | 'banker-flow';

/**
 * IDBI Bank Personal Loan Journey — root view.
 *
 * Renders the Role Select screen first (Customer / Banker / Admin), as
 * this journey's actual entry point. "Customer" advances into the Customer
 * Flow (`CustomerFlowContainer`, all 7 steps, Get Started -> Success).
 * "Banker" advances into the Banker workspace (`BankerFlowContainer`,
 * Dashboard / All Applications / Application Detail) — a completely
 * separate component tree under `components/banker/`, sharing no files
 * with the Customer Flow, so a change on either side can never affect the
 * other. "Admin" still shows an inert "coming soon" notice and never
 * navigates anywhere (out of scope for now).
 *
 * `onExit` is threaded down to every screen so there is always a visible,
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

  if (screen === 'banker-flow') {
    return <BankerFlowContainer onExit={onExit} />;
  }

  return (
    <RoleSelectScreen
      onSelectCustomer={() => setScreen('customer-flow')}
      onSelectBanker={() => setScreen('banker-flow')}
      onExit={onExit}
    />
  );
}

export default IdbiPersonalLoanView;
