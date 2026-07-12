import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DEMO_STORAGE_KEY } from '../../services/demo/demoStorage';
import {
  createServicesWithDemoState,
  mockReducedMotion,
  renderAppAt,
} from '../../test/testUtils';

describe('guest routing and RSVP flows', () => {
  it('redirects an unidentified visitor to the access page', async () => {
    const { services } = await createServicesWithDemoState('unidentified');

    renderAppAt('/', services);

    expect(await screen.findByRole('heading', { name: /find your invitation/i })).toBeInTheDocument();
  });

  it('redirects an identified unanswered guest to RSVP', async () => {
    const { services } = await createServicesWithDemoState('unanswered');

    renderAppAt('/', services);

    expect(await screen.findByRole('heading', { name: /will demo guest attend/i })).toBeInTheDocument();
  });

  it('redirects a declined guest to the declined page', async () => {
    const { services } = await createServicesWithDemoState('declined');

    renderAppAt('/details', services);

    expect(await screen.findByRole('heading', { name: /thank you for letting us know/i })).toBeInTheDocument();
  });

  it('prevents a declined guest from opening the homepage directly', async () => {
    const { services } = await createServicesWithDemoState('declined');

    renderAppAt('/', services);

    expect(await screen.findByRole('heading', { name: /thank you for letting us know/i })).toBeInTheDocument();
  });

  it('redirects an accepted guest with incomplete details to the details page', async () => {
    const { services } = await createServicesWithDemoState('accepted-incomplete');

    renderAppAt('/venue', services);

    expect(await screen.findByRole('heading', { name: /a few details for demo guest/i })).toBeInTheDocument();
  });

  it('allows an accepted guest with completed details to access the homepage', async () => {
    const { services } = await createServicesWithDemoState('accepted-complete');

    renderAppAt('/', services);

    expect(await screen.findByRole('heading', { name: /welcome, demo guest/i })).toBeInTheDocument();
  });

  it('moves a guest who accepts the invitation to the questionnaire', async () => {
    const user = userEvent.setup();
    const { services } = await createServicesWithDemoState('unanswered');

    renderAppAt('/rsvp', services);
    await user.click(await screen.findByRole('button', { name: /yes, we will attend/i }));

    expect(await screen.findByRole('heading', { name: /a few details for demo guest/i })).toBeInTheDocument();
  });

  it('moves a guest who declines the invitation to the declined page', async () => {
    const user = userEvent.setup();
    const { services } = await createServicesWithDemoState('unanswered');

    renderAppAt('/rsvp', services);
    await user.click(await screen.findByRole('button', { name: /unfortunately, we cannot attend/i }));

    expect(await screen.findByRole('heading', { name: /thank you for letting us know/i })).toBeInTheDocument();
  });

  it('moves a guest who completes the questionnaire to the homepage', async () => {
    const user = userEvent.setup();
    const { services } = await createServicesWithDemoState('accepted-incomplete');

    renderAppAt('/details', services);
    await user.click(await screen.findByRole('button', { name: /save attendance details/i }));

    expect(await screen.findByRole('heading', { name: /welcome, demo guest/i })).toBeInTheDocument();
  });

  it('shows conditional questionnaire fields', async () => {
    const user = userEvent.setup();
    const { services } = await createServicesWithDemoState('accepted-incomplete', 'DEMO-COUPLE');

    renderAppAt('/details', services);
    await screen.findByRole('heading', { name: /a few details for demo couple/i });
    await user.selectOptions(screen.getByLabelText(/additional guests/i), '1');

    expect(screen.getByLabelText(/additional guest 1 name/i)).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /we may need transportation/i }));

    expect(screen.getByLabelText(/transportation seats required/i)).toBeInTheDocument();
  });

  it('prevents invalid questionnaire submission', async () => {
    const user = userEvent.setup();
    const { services } = await createServicesWithDemoState('accepted-incomplete', 'DEMO-COUPLE');

    renderAppAt('/details', services);
    await screen.findByRole('heading', { name: /a few details for demo couple/i });
    await user.selectOptions(screen.getByLabelText(/additional guests/i), '1');
    await user.click(screen.getByRole('button', { name: /save attendance details/i }));

    const summary = await screen.findByRole('alert');
    expect(within(summary).getByText(/additional guest 1 name is required/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /a few details for demo couple/i })).toBeInTheDocument();
  });

  it('handles corrupted demo-session data safely', async () => {
    const { services, storage } = await createServicesWithDemoState('unidentified');
    storage.setItem(DEMO_STORAGE_KEY, '{not-valid-json');

    renderAppAt('/', services);

    expect(await screen.findByRole('heading', { name: /find your invitation/i })).toBeInTheDocument();
    expect(screen.getByText(/browser demo session was reset/i)).toBeInTheDocument();
  });

  it('provides a usable reduced-motion homepage journey', async () => {
    mockReducedMotion(true);
    const { services } = await createServicesWithDemoState('accepted-complete');

    renderAppAt('/', services);

    const journey = await screen.findByLabelText(/celebration sections/i);
    await waitFor(() => {
      expect(journey.closest('section')).toHaveAttribute('data-motion', 'reduced');
    });
    expect(within(journey).getByRole('link', { name: /our story/i })).toBeInTheDocument();
  });
});
