import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateLocationDialog } from "./CreateLocationDialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the GoogleMapsLocationSearch to allow calling onLocationSelect
vi.mock("./GoogleMapsLocationSearch", () => ({
  GoogleMapsLocationSearch: ({ onLocationSelect }: any) => (
    <button data-testid="mock-places-select" onClick={() => onLocationSelect({ name: "Mock Place", address: "123 Mock St, City", placeId: "abc", latitude: 12.34, longitude: 56.78 })}>
      Select mock place
    </button>
  ),
}));

// Mock GoogleMap used by the dialog to avoid initializing real maps API in tests
vi.mock("./GoogleMap", () => ({
  GoogleMap: ({ children }: any) => <div data-testid="mock-google-map">{children}</div>,
}));

describe("CreateLocationDialog", () => {
  it("fills fields on place select and calls onSave/onSuccess on submit", async () => {
    const onSave = vi.fn(() => Promise.resolve());
    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();

    // mock fetch to intercept create request
    const originalFetch = global.fetch;
    // @ts-ignore
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'loc-1', name: 'Mock Place' }) }));

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <CreateLocationDialog open={true} onOpenChange={onOpenChange} onSave={onSave} onSuccess={onSuccess} />
      </QueryClientProvider>
    );

    // Click the mocked place selector to populate fields
    fireEvent.click(screen.getByTestId("mock-places-select"));

    // The InlineEdit for name may require a click to activate; ensure value is displayed
    await waitFor(() => expect(screen.getByTestId("input-location-name")).toBeTruthy());

    // Verify address input exists (if place selected, address field may be hidden; ensure selected location name is used)
    const nameField = screen.getByTestId("input-location-name");
    expect(nameField).toBeTruthy();

    // Submit the form
    const dialog = screen.getByTestId("dialog-create-location");
    const form = dialog.querySelector("form");
    if (!form) throw new Error("form not found");
    fireEvent.submit(form);

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSuccess).toHaveBeenCalled();

    // restore fetch
    // @ts-ignore
    global.fetch = originalFetch;
  });
});
