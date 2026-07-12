/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { GuestState } from '../../models/guest';
import type { AttendanceQuestionnaireResponse } from '../../models/questionnaire';
import type { AttendanceDecision } from '../../models/rsvp';
import type { DemoAccessOption } from '../../services/contracts/GuestAccessService';
import type { GuestServices } from '../../services/contracts/GuestServices';
import type { GuestSessionWarning } from '../../services/contracts/GuestSessionService';
import { createDemoServices } from '../../services/demo/createDemoServices';

type SessionStatus = 'loading' | 'ready' | 'error';

interface GuestSessionContextValue {
  status: SessionStatus;
  guestState: GuestState;
  warning?: GuestSessionWarning;
  demoAccessOptions: DemoAccessOption[];
  services: GuestServices;
  refreshSession: () => Promise<GuestState>;
  identifyDemoGuest: (accessToken: string) => Promise<GuestState>;
  submitRsvpDecision: (decision: AttendanceDecision) => Promise<GuestState>;
  submitQuestionnaire: (response: AttendanceQuestionnaireResponse) => Promise<GuestState>;
  clearDemoSession: () => Promise<void>;
}

const unidentifiedState: GuestState = { kind: 'unidentified' };

const GuestSessionContext = createContext<GuestSessionContextValue | undefined>(undefined);

interface GuestSessionProviderProps {
  children: ReactNode;
  services?: GuestServices;
}

export function GuestSessionProvider({ children, services: providedServices }: GuestSessionProviderProps) {
  const services = useMemo(() => providedServices ?? createDemoServices(), [providedServices]);
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [guestState, setGuestState] = useState<GuestState>(unidentifiedState);
  const [warning, setWarning] = useState<GuestSessionWarning | undefined>();
  const [demoAccessOptions, setDemoAccessOptions] = useState<DemoAccessOption[]>([]);

  const refreshSession = useCallback(async () => {
    const snapshot = await services.guestSession.getCurrentGuestSession();
    setGuestState(snapshot.guestState);
    setWarning(snapshot.warning);
    setStatus('ready');
    return snapshot.guestState;
  }, [services]);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      setStatus('loading');

      try {
        const [snapshot, accessOptions] = await Promise.all([
          services.guestSession.getCurrentGuestSession(),
          services.guestAccess.listDemoAccessOptions(),
        ]);

        if (!cancelled) {
          setGuestState(snapshot.guestState);
          setWarning(snapshot.warning);
          setDemoAccessOptions(accessOptions);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setGuestState(unidentifiedState);
          setStatus('error');
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [services]);

  const identifyDemoGuest = useCallback(
    async (accessToken: string) => {
      const nextState = await services.guestAccess.identifyByAccessToken(accessToken);
      setGuestState(nextState);
      setWarning(undefined);
      setStatus('ready');
      return nextState;
    },
    [services],
  );

  const submitRsvpDecision = useCallback(
    async (decision: AttendanceDecision) => {
      if (guestState.kind === 'unidentified') {
        throw new Error('missing-guest-session');
      }

      await services.rsvpRepository.submitResponse({
        invitationGroupId: guestState.group.id,
        decision,
        submittedAt: new Date().toISOString(),
        schemaVersion: 1,
      });

      return refreshSession();
    },
    [guestState, refreshSession, services],
  );

  const submitQuestionnaire = useCallback(
    async (response: AttendanceQuestionnaireResponse) => {
      await services.questionnaireRepository.submitQuestionnaire(response);
      return refreshSession();
    },
    [refreshSession, services],
  );

  const clearDemoSession = useCallback(async () => {
    await services.guestSession.clearCurrentGuestSession();
    setGuestState(unidentifiedState);
    setWarning(undefined);
    setStatus('ready');
  }, [services]);

  const value = useMemo<GuestSessionContextValue>(
    () => ({
      status,
      guestState,
      warning,
      demoAccessOptions,
      services,
      refreshSession,
      identifyDemoGuest,
      submitRsvpDecision,
      submitQuestionnaire,
      clearDemoSession,
    }),
    [
      clearDemoSession,
      demoAccessOptions,
      guestState,
      identifyDemoGuest,
      refreshSession,
      services,
      status,
      submitQuestionnaire,
      submitRsvpDecision,
      warning,
    ],
  );

  return <GuestSessionContext.Provider value={value}>{children}</GuestSessionContext.Provider>;
}

export function useGuestSession() {
  const context = useContext(GuestSessionContext);

  if (!context) {
    throw new Error('useGuestSession must be used inside GuestSessionProvider');
  }

  return context;
}
