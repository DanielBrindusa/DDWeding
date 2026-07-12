import { render, type RenderResult } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AppShell } from '../components/layout/AppShell';
import { GuestSessionProvider } from '../app/providers/GuestSessionProvider';
import { AppRoutes } from '../app/router/routes';
import type { GuestServices } from '../services/contracts/GuestServices';
import { createDemoServices } from '../services/demo/createDemoServices';
import { MemoryStorage } from './memoryStorage';
import type { AttendanceQuestionnaireResponse } from '../models/questionnaire';

export function renderAppAt(path: string, services: GuestServices): RenderResult {
  return render(
    <MemoryRouter initialEntries={[path]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <GuestSessionProvider services={services}>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </GuestSessionProvider>
    </MemoryRouter>,
  );
}

export function renderWithProviders(ui: ReactNode, services: GuestServices): RenderResult {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <GuestSessionProvider services={services}>{ui}</GuestSessionProvider>
    </MemoryRouter>,
  );
}

export async function createServicesWithDemoState(
  state: 'unidentified' | 'unanswered' | 'accepted-incomplete' | 'accepted-complete' | 'declined',
  token = 'DEMO-GUEST',
) {
  const storage = new MemoryStorage();
  const services = createDemoServices(storage);

  if (state === 'unidentified') {
    return { services, storage };
  }

  const guestState = await services.guestAccess.identifyByAccessToken(token);

  if (state === 'unanswered') {
    return { services, storage };
  }

  if (guestState.kind === 'unidentified') {
    throw new Error('Expected demo guest state');
  }

  if (state === 'declined') {
    await services.rsvpRepository.submitResponse({
      invitationGroupId: guestState.group.id,
      decision: 'decline',
      submittedAt: new Date().toISOString(),
      schemaVersion: 1,
    });

    return { services, storage };
  }

  await services.rsvpRepository.submitResponse({
    invitationGroupId: guestState.group.id,
    decision: 'accept',
    submittedAt: new Date().toISOString(),
    schemaVersion: 1,
  });

  if (state === 'accepted-incomplete') {
    return { services, storage };
  }

  await services.questionnaireRepository.submitQuestionnaire(createValidQuestionnaire(guestState.group.id));

  return { services, storage };
}

export function createValidQuestionnaire(invitationGroupId = 'demo-guest'): AttendanceQuestionnaireResponse {
  return {
    invitationGroupId,
    attendingInvitedPersonIds: ['demo-guest-adult'],
    additionalGuests: [],
    attendeeDetails: [
      {
        attendeeId: 'demo-guest-adult',
        attendeeSource: 'invited',
        displayName: 'Demo Guest',
        ageGroup: 'adult',
        mealPreference: 'standard',
      },
    ],
    adultCount: 1,
    childCount: 0,
    vegetarianCount: 0,
    veganCount: 0,
    transportation: {
      required: false,
      seatsRequired: 0,
    },
    babyChairs: {
      required: false,
      count: 0,
    },
    completedAt: new Date().toISOString(),
    schemaVersion: 1,
  };
}

export function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
