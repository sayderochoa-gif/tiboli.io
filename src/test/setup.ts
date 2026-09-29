import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Limpieza de sessionStorage entre tests
beforeEach(() => {
  sessionStorage.clear();
});
