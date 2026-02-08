import '@testing-library/jest-dom';

// Mock VITE_API_URL for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3001',
  },
});
