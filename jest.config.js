module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lib', '<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.(ts|tsx|js)', '**/*.(test|spec).(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  collectCoverageFrom: [
    'lib/**/*.(ts|tsx|js)',
    'src/**/*.(ts|tsx|js)',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/dist/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/lib/$1',
    '^@components/(.*)$': '<rootDir>/lib/components/$1',
    '^@utils/(.*)$': '<rootDir>/lib/utils/$1',
    '^@types/(.*)$': '<rootDir>/lib/types/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 10000
}
