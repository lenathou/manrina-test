module.exports = {
  displayName: 'Integration Tests',
  testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/integration/jest.setup.js'],
  collectCoverageFrom: [
    'src/server/services/**/*.{js,ts}',
    'src/config/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,ts}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**'
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 30000, // 30 secondes pour les tests d'intégration
  maxWorkers: 1, // Exécution séquentielle pour éviter les conflits de base de données
  forceExit: true,
  detectOpenHandles: true,
  
  // Variables d'environnement pour les tests
  setupFiles: ['<rootDir>/tests/integration/env.setup.js'],
  
  // Transformation des modules
  transform: {},
  
  // Extensions de fichiers
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Résolution des modules
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@prisma/client$': '<rootDir>/node_modules/@prisma/client'
  },
  
  // Ignorer certains modules
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/.next/'
  ],
  
  // Configuration des reporters
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage/integration/html-report',
      filename: 'integration-test-report.html',
      expand: true
    }]
  ]
};