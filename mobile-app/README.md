# ReNova Mobile App

AI-powered waste intelligence mobile application built with React Native and Expo.

## Features

✅ **Camera Capture** - Take photos of waste items for classification (replaces upload)
✅ **AI Classification** - CLIP AI analyzes material and cleanliness
✅ **Voice Input** - Whisper-powered voice queries
✅ **OSM Maps** - Find nearby recyclers with React Native Maps
✅ **Impact Dashboard** - Track environmental impact
✅ **Token System** - Earn tokens for recycling
✅ **Bilingual** - English and Hindi support
✅ **Same API Endpoints** - Uses identical backend as web app

## Tech Stack

- **React Native** + Expo
- **Navigation**: React Navigation
- **State**: Zustand
- **i18n**: react-i18next
- **Camera**: expo-camera
- **Maps**: react-native-maps (OSM)
- **Voice**: expo-av
- **API**: Axios

## Color Theme (Matching frontend-v2)

```
Leaf: #2d5016
Leaf Light: #4a7c2c
Sage: #87a878
Cream: #faf8f3
Sand: #e8dfd0
Warning: #d87941
Danger: #c14543
```

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device (iOS/Android)

### Installation

```bash
cd mobile-app
npm install
```

### Configuration

Update the API base URL in `src/services/api.js`:

```javascript
const API_BASE = 'http://YOUR_COMPUTER_IP:8000/api';
```

Replace `YOUR_COMPUTER_IP` with your local IP address (find it with `ipconfig` on Windows or `ifconfig` on Mac/Linux).

### Running

```bash
npm start
```

This will open Expo Dev Tools. Scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

## Project Structure

```
mobile-app/
├── src/
│   ├── screens/           # All app screens
│   │   ├── LandingScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ScanScreen.js     # Camera capture
│   │   ├── VoiceScreen.js    # Voice recording
│   │   ├── ResultScreen.js
│   │   ├── MapScreen.js      # OSM maps
│   │   ├── ImpactScreen.js
│   │   └── ProfileScreen.js
│   ├── components/        # Reusable components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   └── Loader.js
│   ├── services/          # API integration
│   │   └── api.js
│   ├── store/             # Zustand stores
│   │   └── index.js
│   ├── theme/             # Colors & styles
│   │   └── index.js
│   ├── i18n/              # Translations
│   │   └── index.js
│   └── hooks/             # Custom hooks
│       └── useGeolocation.js
├── App.js                 # Main app with navigation
├── index.js               # Entry point
├── package.json
└── app.json               # Expo configuration
```

## API Endpoints (Same as Web)

- `POST /api/scan/scan_image` - Scan waste image
- `POST /api/scan/voice_input` - Voice query
- `GET /api/recyclers_nearby` - Find recyclers
- `GET /api/impact_stats` - Get impact stats
- `GET /api/wallet/:userId` - Get token balance
- `POST /api/schedule_pickup` - Schedule pickup

## Key Differences from Web App

1. **Camera**: Uses `expo-camera` for direct photo capture instead of file upload
2. **Maps**: Uses `react-native-maps` with OSM tiles instead of Leaflet
3. **Voice**: Uses `expo-av` for native audio recording
4. **Navigation**: React Navigation instead of React Router
5. **Storage**: AsyncStorage instead of localStorage
6. **Styling**: StyleSheet API instead of CSS/Tailwind

## Building for Production

### Android

```bash
expo build:android
```

### iOS

```bash
expo build:ios
```

## Permissions

The app requests:
- **Camera**: To scan waste items
- **Microphone**: For voice queries
- **Location**: To find nearby recyclers

## Testing

Make sure your backend is running on `http://localhost:8000` and accessible from your mobile device on the same network.

## Troubleshooting

### Can't connect to backend
- Ensure backend is running
- Update API_BASE to your computer's local IP
- Check firewall settings
- Both devices must be on same WiFi

### Camera not working
- Grant camera permissions in device settings
- Restart Expo Go app

### Maps not loading
- Check internet connection
- Ensure location permissions granted

## License

MIT
