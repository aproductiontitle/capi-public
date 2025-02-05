import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';

// Extend Vitest's expect with Testing Library's matchers
expect.extend(matchers);

// Make vi available globally
global.vi = vi;

// Clean up after each test
afterEach(() => {
  cleanup();
});