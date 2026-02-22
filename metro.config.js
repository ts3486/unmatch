const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Block Metro/Watchman from crawling heavy native directories.
// Without this, Watchman indexes ios/Pods (900+ MB) on every start, causing stalls.
config.resolver.blockList = [
  /ios\/Pods\/.*/,
  /ios\/build\/.*/,
  /ios\/DerivedData\/.*/,
  /android\/build\/.*/,
  /android\/\.gradle\/.*/,
];

module.exports = config;
