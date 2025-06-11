
import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { testHelper } from '../utils/testHelpers';

// Setup for all tests
beforeAll(() => {
  // Mock environment variables
  process.env.VITE_SUPABASE_URL = 'http://localhost:54321';
  process.env.VITE_SUPABASE_ANON_KEY = 'test-key';
});

// Cleanup after each test
afterEach(async () => {
  cleanup();
  await testHelper.cleanup();
});

// Global cleanup
afterAll(async () => {
  await testHelper.cleanup();
});
