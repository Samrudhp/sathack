# ReNova Mobile App - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
cd mobile-app
npm install
```

### Step 2: Update Backend URL

Open `src/services/api.js` and replace the API_BASE URL:

**Find your computer's IP address:**

**Windows (PowerShell):**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

**Update api.js:**
```javascript
const API_BASE = 'http://192.168.1.100:8000/api';  // Replace with YOUR IP
```

### Step 3: Start Backend

Make sure your FastAPI backend is running:

```bash
cd ../backend
python run.py
```

Backend should be accessible at `http://localhost:8000`

### Step 4: Run Mobile App

```bash
cd ../mobile-app
npm start
```

This opens Expo Dev Tools in your browser.

### Step 5: Install Expo Go on Your Phone

- **iOS**: Download "Expo Go" from App Store
- **Android**: Download "Expo Go" from Play Store

### Step 6: Scan QR Code

**iOS**: Open Camera app → Scan QR code from Expo Dev Tools
**Android**: Open Expo Go app → Tap "Scan QR Code" → Scan from Expo Dev Tools

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Mobile device on same WiFi as computer
- [ ] API_BASE updated with your computer's IP
- [ ] Expo Go installed on mobile device
- [ ] Camera/Location permissions granted

## 📱 Key Features

| Feature | Implementation |
|---------|---------------|
| **Image Upload** → **Camera Capture** | expo-camera with direct photo capture |
| **Web Maps** → **Native Maps** | react-native-maps with OSM tiles |
| **Color Theme** | Identical to frontend-v2 (Leaf Green #2d5016) |
| **API Endpoints** | Same as web app |
| **Languages** | English & Hindi (EN/HI toggle) |

## 🎯 User Flow

1. **Landing** → Splash screen with "Get Started"
2. **Home** → Dashboard with action cards
3. **Scan** → Camera capture → AI analysis → Results
4. **Voice** → Record audio → Whisper transcription → Results
5. **Result** → Classification, disposal instructions, recyclers, impact, tokens
6. **Map** → OSM map with recycler markers
7. **Impact** → CO2/water/landfill stats
8. **Profile** → Token wallet, settings

## 🔧 Common Issues

### "Network request failed"
- Update API_BASE to your computer's IP (not localhost)
- Ensure backend is accessible: `curl http://YOUR_IP:8000/api`
- Check Windows Firewall allows port 8000

### Camera not working
- Go to Phone Settings → Apps → Expo Go → Permissions → Enable Camera

### Maps not loading
- Enable Location permissions
- Check internet connection (OSM tiles need internet)

### "Unable to resolve module"
- Run: `npm install`
- Clear cache: `expo start -c`

## 📊 Comparison: Web vs Mobile

| Aspect | Web (frontend-v2) | Mobile (mobile-app) |
|--------|------------------|---------------------|
| Framework | React + Vite | React Native + Expo |
| Styling | Tailwind CSS v4 | StyleSheet API |
| Image Input | File upload | Camera capture |
| Maps | Leaflet | react-native-maps |
| Voice | WebAudio API | expo-av |
| Storage | localStorage | AsyncStorage |
| Navigation | React Router | React Navigation |
| **Color Theme** | ✅ Same | ✅ Same |
| **API Endpoints** | ✅ Same | ✅ Same |
| **Functionality** | ✅ Same | ✅ Same |

## 🎨 Color Palette

```
Primary: #2d5016 (Leaf/Forest)
Light: #4a7c2c (Leaf Light)
Accent: #87a878 (Sage)
Background: #faf8f3 (Cream)
Warning: #d87941
Danger: #c14543
```

## 📦 Build Commands

**Development:**
```bash
npm start
```

**Android APK:**
```bash
expo build:android
```

**iOS IPA:**
```bash
expo build:ios
```

**Publish Update:**
```bash
expo publish
```

## 📝 Testing Checklist

- [ ] Take photo and scan waste
- [ ] View scan results with all details
- [ ] Navigate to map and see recyclers
- [ ] Check impact statistics
- [ ] Switch language EN ↔ HI
- [ ] Record voice query
- [ ] View token wallet
- [ ] All navigation flows work

## 🌟 Success!

Your mobile app is now running with:
✅ Same color theme as web
✅ Same API endpoints
✅ Camera capture (not upload)
✅ OSM maps
✅ All functionality matching web app

**Next Steps:**
1. Test on physical device
2. Customize splash screen/icon
3. Build production APK/IPA
4. Deploy to App Store/Play Store
