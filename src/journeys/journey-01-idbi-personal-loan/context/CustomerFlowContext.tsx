import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  CustomerFlowContext,
  TOTAL_CUSTOMER_FLOW_STEPS,
  initialCustomerFlowData,
} from './useCustomerFlow';
import type {
  CustomerFlowContextValue,
  CustomerFlowData,
  CustomerFlowStepActions,
} from './useCustomerFlow';

interface CustomerFlowProviderProps {
  children: ReactNode;
}

/**
 * Provider for the Customer Flow context. Owns the actual `step` and
 * `data` state and wires up the navigation/update helpers exposed by
 * `useCustomerFlow` (see `useCustomerFlow.ts`, which owns the `Context`
 * object itself, the shared types, and the hook — kept out of this file so
 * this stays a component-only `.tsx` file per the project's react-refresh
 * lint rule).
 */
function CustomerFlowProvider({ children }: CustomerFlowProviderProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CustomerFlowData>(initialCustomerFlowData);
  const [stepActions, setStepActions] = useState<CustomerFlowStepActions | null>(null);

  const goNext = useCallback(() => {
    setStep((current) => Math.min(current + 1, TOTAL_CUSTOMER_FLOW_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setStep((current) => Math.max(current - 1, 1));
  }, []);

  const goToStep = useCallback((next: number) => {
    setStep(Math.min(Math.max(next, 1), TOTAL_CUSTOMER_FLOW_STEPS));
  }, []);

  const updateData = useCallback((patch: Partial<CustomerFlowData>) => {
    setData((current) => ({ ...current, ...patch }));
  }, []);

  const value = useMemo<CustomerFlowContextValue>(
    () => ({ step, goNext, goBack, goToStep, data, updateData, stepActions, setStepActions }),
    [step, goNext, goBack, goToStep, data, updateData, stepActions],
  );

  return (
    <CustomerFlowContext.Provider value={value}>{children}</CustomerFlowContext.Provider>
  );
}

export default CustomerFlowProvider;
