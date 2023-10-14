module.exports = {
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@tests/(.*)': '<rootDir>/tests/$1',
    '^@source/(.*)': '<rootDir>/$1',
  }
};
