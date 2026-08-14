import { useState } from 'react';
import GateView from './core/gate/GateView';
import HubView from './core/hub/HubView';
import AuthModal from './core/auth/AuthModal';
import { getJourneys } from './core/registry/registry';

type Screen = 'gate' | 'hub' | 'journey';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('gate');
  const [userId, setUserId] = useState('');
  // Set when a Hub card is clicked, before auth succeeds; drives the Auth
  // Modal overlay on top of the Hub. Cleared on both success and cancel.
  const [pendingAuthJourneyId, setPendingAuthJourneyId] = useState<string | null>(
    null,
  );
  // Set once AuthModal's onSuccess fires; identifies which journey's
  // component to render full-screen while currentScreen === 'journey'.
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);

  const activeJourney = activeJourneyId
    ? getJourneys().find((journey) => journey.meta.id === activeJourneyId)
    : undefined;

  // Defensive fallback: if activeJourneyId points at a journey the registry
  // no longer has (should not happen in practice), treat this render as the
  // Hub instead of rendering nothing.
  if (currentScreen === 'journey' && activeJourney) {
    const ActiveJourneyComponent = activeJourney.component;
    return (
      <ActiveJourneyComponent
        onExit={() => {
          setActiveJourneyId(null);
          setCurrentScreen('hub');
        }}
      />
    );
  }

  if (currentScreen === 'hub' || (currentScreen === 'journey' && !activeJourney)) {
    const pendingJourney = pendingAuthJourneyId
      ? getJourneys().find((journey) => journey.meta.id === pendingAuthJourneyId)
      : undefined;

    return (
      <>
        <HubView
          userId={userId}
          onLogout={() => {
            setCurrentScreen('gate');
            setUserId('');
          }}
          onSelectJourney={(journeyId) => setPendingAuthJourneyId(journeyId)}
        />
        {pendingJourney && (
          <AuthModal
            journeyTitle={pendingJourney.meta.title}
            validate={pendingJourney.auth.validate}
            onSuccess={() => {
              setPendingAuthJourneyId(null);
              setActiveJourneyId(pendingJourney.meta.id);
              setCurrentScreen('journey');
            }}
            onCancel={() => setPendingAuthJourneyId(null)}
          />
        )}
      </>
    );
  }

  return (
    <GateView
      onSuccess={(authenticatedUserId) => {
        setUserId(authenticatedUserId);
        setCurrentScreen('hub');
      }}
    />
  );
}

export default App;
