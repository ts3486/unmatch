// Jest configuration for the dating-quitter project.
// Uses ts-jest to run TypeScript tests without a separate compile step.
// Mirrors the @/ path alias defined in tsconfig.json.

import type { Config } from 'jest';
import * as path from 'path';

const config: Config = {
  preset: 'ts-jest',

  // Run in a Node environment — no DOM or React Native renderer needed for
  // pure unit tests targeting domain logic and utilities.
  testEnvironment: 'node',

  // Resolve TypeScript and TSX files so ts-jest handles compilation.
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
        // Disable type-checking during tests for speed; tsc --noEmit covers it.
        diagnostics: false,
      },
    ],
  },

  // Map @/ to the repo root, matching the tsconfig paths alias.
  moduleNameMapper: {
    '^@/(.*)$': path.resolve(__dirname, '$1'),
  },

  // Only run files that match the project's test naming convention.
  testMatch: ['**/__tests__/**/*.test.ts'],

  // Explicit extensions so Jest doesn't need to guess.
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

export default config;
