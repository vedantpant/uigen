import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

afterEach(() => {
  cleanup();
});

test("EmptyState renders the prompt text", () => {
  render(<EmptyState />);

  expect(
    screen.getByText("Start a conversation to generate React components")
  ).toBeDefined();
  expect(
    screen.getByText("I can help you create buttons, forms, cards, and more")
  ).toBeDefined();
});

test("EmptyState renders a bot icon", () => {
  const { container } = render(<EmptyState />);

  const svg = container.querySelector("svg");
  expect(svg).not.toBeNull();
});

test("EmptyState has centered layout classes", () => {
  const { container } = render(<EmptyState />);

  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper.className).toContain("items-center");
  expect(wrapper.className).toContain("text-center");
});

test("EmptyState heading is visually prominent", () => {
  render(<EmptyState />);

  const heading = screen.getByText("Start a conversation to generate React components");
  expect(heading.className).toContain("font-semibold");
});

test("EmptyState subtitle constrains its width", () => {
  render(<EmptyState />);

  const subtitle = screen.getByText("I can help you create buttons, forms, cards, and more");
  expect(subtitle.className).toContain("max-w-sm");
});
