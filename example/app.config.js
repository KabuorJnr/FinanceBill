// Extends app.json with values that should not be committed. They come from
// example/.env (gitignored; see .env.example), which Expo loads automatically.
//
// - Android renders react-native-maps with Google Maps, which needs
//   GOOGLE_MAPS_API_KEY. iOS uses Apple Maps and needs no key.
// - Google Sign-In on iOS needs the reversed iOS client ID as a URL scheme,
//   derived here from EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const googleIosUrlScheme = googleIosClientId
  ? `com.googleusercontent.apps.${googleIosClientId.replace(
      '.apps.googleusercontent.com',
      ''
    )}`
  : null;

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      'react-native-maps',
      { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY },
    ],
    'expo-web-browser',
    // The plugin requires the iOS scheme; Android needs no plugin options.
    googleIosUrlScheme
      ? [
          '@react-native-google-signin/google-signin',
          { iosUrlScheme: googleIosUrlScheme },
        ]
      : null,
  ].filter(Boolean),
});
