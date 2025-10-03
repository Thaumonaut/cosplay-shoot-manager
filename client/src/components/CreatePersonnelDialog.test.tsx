import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatePersonnelDialog } from './CreatePersonnelDialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('CreatePersonnelDialog', () => {
  it('calls onSave when provided after creating a personnel', async () => {
    const onSave = vi.fn(() => Promise.resolve());
    const onOpenChange = vi.fn();

    // Mock fetch used by the mutation to avoid network calls
    const originalFetch = global.fetch;
    // @ts-ignore
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'new-id', name: 'Test Person' }) }));

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <CreatePersonnelDialog open={true} onOpenChange={onOpenChange} onSave={onSave} />
      </QueryClientProvider>
    );

  // Fill name (required) - InlineEdit renders a div until clicked, so click to activate input
  let nameInput = screen.getByTestId('input-personnel-name');
  fireEvent.click(nameInput);
  // re-query to get the actual input element
  nameInput = screen.getByTestId('input-personnel-name');
  fireEvent.change(nameInput, { target: { value: 'Test Person' } });
  // Blur to trigger InlineEdit onBlur save (which is scheduled).
  fireEvent.blur(nameInput);

  // Wait for the InlineEdit to commit the value and render the non-edit view
  await waitFor(() => {
    const displayed = screen.getByTestId('input-personnel-name');
    expect(displayed).toBeTruthy();
    // either the input or div should contain the name now
    expect(displayed.textContent || (displayed as HTMLInputElement).value).toContain('Test Person');
  });

  // Submit the form programmatically now that the name has been committed
  const dialog = screen.getByTestId('dialog-create-personnel');
  const form = dialog.querySelector('form');
  if (!form) throw new Error('form not found in dialog');
  fireEvent.submit(form);

    // onSave should be eventually called (mutation mocks network; dialog triggers onSave)
    await waitFor(() => expect(onSave).toHaveBeenCalled());

    // restore fetch
    // @ts-ignore
    global.fetch = originalFetch;
  });
});
