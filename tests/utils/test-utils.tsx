import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import React, { ReactElement } from "react";
import userEvent from "@testing-library/user-event";

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { userEvent };

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	route?: string;
	initialEntries?: string[];
}

/**
 * Render a component with React Router context
 * @param ui - The component to render
 * @param options - Render options including initial route
 */
export function renderWithRouter(
	ui: ReactElement,
	{ route = "/", initialEntries = [route], ...renderOptions }: CustomRenderOptions = {}
) {
	function Wrapper({ children }: { children: React.ReactNode }) {
		return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
	}

	return {
		user: userEvent.setup(),
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
	};
}

/**
 * Render a component with BrowserRouter context
 * @param ui - The component to render
 * @param options - Render options
 */
export function renderWithBrowserRouter(ui: ReactElement, renderOptions: RenderOptions = {}) {
	function Wrapper({ children }: { children: React.ReactNode }) {
		return <BrowserRouter>{children}</BrowserRouter>;
	}

	return {
		user: userEvent.setup(),
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
	};
}
