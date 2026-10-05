// Extends app.json with values that should not be committed.
// Android renders react-native-maps with Google Maps, which needs an API key:
//   GOOGLE_MAPS_API_KEY=... bun example android
// iOS uses Apple Maps and needs no key.
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      'react-native-maps',
      { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY },
    ],
  ],
});
