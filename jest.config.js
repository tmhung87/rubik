module.exports = {
  testEnvironment: 'node',
  // three.js hiện chỉ phát hành dạng ES Module => cần biên dịch lại khi chạy test
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1', '^three$': '<rootDir>/node_modules/three/build/three.module.js' },
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', allowJs: true, module: 'commonjs', target: 'es2019', esModuleInterop: true, skipLibCheck: true, strict: true }, diagnostics: { ignoreCodes: [151001] } }],
  },
  transformIgnorePatterns: ['/node_modules/(?!three/)'],
};
