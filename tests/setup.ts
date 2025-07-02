// Jest setup file for better-keypress tests
import 'jest-environment-jsdom';

// Mock window.queueMicrotask for tests
Object.defineProperty(window, 'queueMicrotask', {
  value: (callback: () => void) => {
    Promise.resolve().then(callback);
  },
  writable: true,
});

// Setup selection API mock
Object.defineProperty(window, 'getSelection', {
  value: jest.fn(() => ({
    rangeCount: 0,
    getRangeAt: jest.fn(),
  })),
  writable: true,
});

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Add global test utilities
declare global {
  var createKeyboardEvent: (type: string, options?: KeyboardEventInit) => KeyboardEvent;
  var createMockElement: (tagName: string, attributes?: Record<string, string>) => HTMLElement;
}

global.createKeyboardEvent = (type: string, options: KeyboardEventInit = {}) => {
  return new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
};

global.createMockElement = (tagName: string, attributes: Record<string, string> = {}) => {
  const element = document.createElement(tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}; 