module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // When Tier 2 vision packages land, add: 'react-native-worklets-core/plugin'
  };
};
