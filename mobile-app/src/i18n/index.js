import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      scan: 'Scan',
      voice: 'Voice',
      map: 'Map',
      impact: 'Impact',
      profile: 'Profile',
      back: 'Back',
      
      // Landing
      welcome: 'Welcome to ReNova',
      tagline: 'AI-Powered Waste Intelligence',
      getStarted: 'Get Started',
      
      // Home
      greeting: 'Hey {{name}}!',
      tagline2: 'Ready to make a difference today?',
      scanWaste: 'Scan Your Waste',
      scanDesc: 'Snap a photo and get instant AI-powered disposal guidance',
      voiceQuery: 'Voice Query',
      voiceDesc: 'Ask questions',
      findRecyclers: 'Find Recyclers',
      findDesc: 'Nearby centers',
      yourImpact: 'Your Impact',
      impactDesc: 'See your stats',
      howItWorks: 'How It Works',
      step1: 'Capture waste photo',
      step2: 'AI analyzes material',
      step3: 'Get instructions',
      step4: 'Find recycler',
      step5: 'Earn tokens!',
      
      // Scan
      scanWasteTitle: 'Scan Waste',
      capturePhoto: 'Capture Waste Photo',
      captureDesc: 'Take a photo to classify',
      processing: 'Processing...',
      processingDesc: 'AI analyzing image, searching knowledge base, finding recyclers...',
      whatHappens: 'What happens next?',
      clipAnalysis: 'CLIP AI analyzes material & cleanliness',
      ragSearch: 'RAG searches global + personal knowledge',
      osmFind: 'OpenStreetMap finds nearest recyclers',
      llmGenerate: 'LLM generates disposal instructions',
      translated: 'Translated to your language',
      
      // Result
      results: 'Scan Results',
      confidence: 'Confidence:',
      cleanliness: 'Cleanliness:',
      hazard: 'Hazard:',
      none: 'None',
      hazardWarning: 'Hazard Warning',
      disposalInstructions: 'Disposal Instructions',
      envImpact: 'Environmental Impact',
      co2Saved: 'CO₂ Saved',
      waterSaved: 'Water Saved',
      landfillSaved: 'Landfill Saved',
      estimatedCredits: 'Estimated Credits',
      tokensAdded: 'Tokens will be added after verification',
      knowledgeSources: 'Knowledge Sources',
      globalKnowledge: 'Global Knowledge',
      personalInsights: 'Personal Insights',
      nearbyRecyclers: 'Nearby Recyclers',
      nearest: 'NEAREST',
      distance: 'Distance:',
      time: 'Time:',
      rating: 'Rating:',
      phone: 'Phone:',
      hours: 'Hours:',
      accepts: 'Accepts:',
      showOnMap: 'Show All on Map',
      exploreMap: 'Explore Map & Find Recyclers',
      scanAgain: 'Scan Again',
      
      // Voice
      voiceInput: 'Voice Input',
      tapToRecord: 'Tap to Record',
      recording: 'Recording...',
      stopRecording: 'Stop Recording',
      
      // Map
      nearbyRecyclersTitle: 'Nearby Recyclers',
      yourLocation: 'Your Location',
      recyclerList: 'Recycler List',
      noRecyclers: 'No recyclers found nearby',
      score: 'Score',
      
      // Impact
      yourImpactTitle: 'Your Impact',
      totalScans: 'Total Scans',
      tokensEarned: 'Tokens Earned',
      co2Reduction: 'CO₂ Reduction',
      waterConservation: 'Water Conservation',
      landfillDiverted: 'Landfill Diverted',
      impactStats: 'Impact Statistics',
      thisMonth: 'This Month',
      allTime: 'All Time',
      
      // Profile
      profileTitle: 'Profile',
      tokenWallet: 'Token Wallet',
      availableTokens: 'Available Tokens',
      redeemTokens: 'Redeem Tokens',
      scanHistory: 'Scan History',
      settings: 'Settings',
      language: 'Language',
      logout: 'Logout',
      
      // Common
      loading: 'Loading...',
      error: 'Error',
      tryAgain: 'Try Again',
      cancel: 'Cancel',
      confirm: 'Confirm',
    },
  },
  hi: {
    translation: {
      // Navigation
      home: 'होम',
      scan: 'स्कैन',
      voice: 'आवाज़',
      map: 'मानचित्र',
      impact: 'प्रभाव',
      profile: 'प्रोफ़ाइल',
      back: 'वापस',
      
      // Landing
      welcome: 'ReNova में आपका स्वागत है',
      tagline: 'AI-संचालित अपशिष्ट बुद्धिमत्ता',
      getStarted: 'शुरू करें',
      
      // Home
      greeting: 'नमस्ते {{name}}!',
      tagline2: 'आज बदलाव लाने के लिए तैयार हैं?',
      scanWaste: 'अपशिष्ट स्कैन करें',
      scanDesc: 'फ़ोटो लें और तुरंत AI-संचालित निपटान मार्गदर्शन प्राप्त करें',
      voiceQuery: 'आवाज़ प्रश्न',
      voiceDesc: 'प्रश्न पूछें',
      findRecyclers: 'रीसाइकलर खोजें',
      findDesc: 'निकट केंद्र',
      yourImpact: 'आपका प्रभाव',
      impactDesc: 'आंकड़े देखें',
      howItWorks: 'यह कैसे काम करता है',
      step1: 'फोटो लें',
      step2: 'AI विश्लेषण',
      step3: 'निर्देश पाएं',
      step4: 'रीसाइकलर ढूंढें',
      step5: 'टोकन पाएं!',
      
      // Scan
      scanWasteTitle: 'अपशिष्ट स्कैन करें',
      capturePhoto: 'अपशिष्ट फ़ोटो कैप्चर करें',
      captureDesc: 'वर्गीकृत करने के लिए फ़ोटो लें',
      processing: 'प्रसंस्करण...',
      processingDesc: 'AI छवि का विश्लेषण कर रहा है, ज्ञान आधार खोज रहा है, रीसाइकलर ढूंढ रहा है...',
      whatHappens: 'आगे क्या होता है?',
      clipAnalysis: 'CLIP AI सामग्री और स्वच्छता का विश्लेषण करता है',
      ragSearch: 'RAG वैश्विक + व्यक्तिगत ज्ञान खोजता है',
      osmFind: 'OpenStreetMap निकटतम रीसाइकलर ढूंढता है',
      llmGenerate: 'LLM निपटान निर्देश उत्पन्न करता है',
      translated: 'आपकी भाषा में अनुवादित',
      
      // Result
      results: 'स्कैन परिणाम',
      confidence: 'विश्वास:',
      cleanliness: 'स्वच्छता:',
      hazard: 'खतरा:',
      none: 'कोई नहीं',
      hazardWarning: 'खतरे की चेतावनी',
      disposalInstructions: 'निपटान निर्देश',
      envImpact: 'पर्यावरणीय प्रभाव',
      co2Saved: 'CO₂ बचत',
      waterSaved: 'जल बचत',
      landfillSaved: 'लैंडफिल बचत',
      estimatedCredits: 'अनुमानित क्रेडिट',
      tokensAdded: 'सत्यापन के बाद टोकन जोड़े जाएंगे',
      knowledgeSources: 'ज्ञान स्रोत',
      globalKnowledge: 'वैश्विक ज्ञान',
      personalInsights: 'व्यक्तिगत अंतर्दृष्टि',
      nearbyRecyclers: 'निकटतम रीसाइकलर',
      nearest: 'निकटतम',
      distance: 'दूरी:',
      time: 'समय:',
      rating: 'रेटिंग:',
      phone: 'फोन:',
      hours: 'घंटे:',
      accepts: 'स्वीकार:',
      showOnMap: 'मानचित्र पर सभी दिखाएं',
      exploreMap: 'मानचित्र देखें और रीसाइकलर खोजें',
      scanAgain: 'फिर से स्कैन करें',
      
      // Voice
      voiceInput: 'आवाज़ इनपुट',
      tapToRecord: 'रिकॉर्ड करने के लिए टैप करें',
      recording: 'रिकॉर्डिंग...',
      stopRecording: 'रिकॉर्डिंग बंद करें',
      
      // Map
      nearbyRecyclersTitle: 'निकटतम रीसाइकलर',
      yourLocation: 'आपका स्थान',
      recyclerList: 'रीसाइकलर सूची',
      noRecyclers: 'पास में कोई रीसाइकलर नहीं मिला',
      score: 'स्कोर',
      
      // Impact
      yourImpactTitle: 'आपका प्रभाव',
      totalScans: 'कुल स्कैन',
      tokensEarned: 'टोकन अर्जित',
      co2Reduction: 'CO₂ कमी',
      waterConservation: 'जल संरक्षण',
      landfillDiverted: 'लैंडफिल टाला गया',
      impactStats: 'प्रभाव आंकड़े',
      thisMonth: 'इस महीने',
      allTime: 'सभी समय',
      
      // Profile
      profileTitle: 'प्रोफ़ाइल',
      tokenWallet: 'टोकन वॉलेट',
      availableTokens: 'उपलब्ध टोकन',
      redeemTokens: 'टोकन रिडीम करें',
      scanHistory: 'स्कैन इतिहास',
      settings: 'सेटिंग्स',
      language: 'भाषा',
      logout: 'लॉगआउट',
      
      // Common
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      tryAgain: 'पुनः प्रयास करें',
      cancel: 'रद्द करें',
      confirm: 'पुष्टि करें',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
