
import { useState, useEffect } from 'react';

interface Translations {
  [key: string]: {
    en: string;
    ne: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', ne: 'गृहपृष्ठ' },
  'nav.submit': { en: 'Submit Complaint', ne: 'गुनासो पेश गर्नुहोस्' },
  'nav.track': { en: 'Track Complaint', ne: 'गुनासो ट्र्याक गर्नुहोस्' },
  'nav.public': { en: 'Public Complaints', ne: 'सार्वजनिक गुनासोहरू' },
  'nav.profile': { en: 'Profile', ne: 'प्रोफाइल' },
  'nav.login': { en: 'Login', ne: 'लगइन' },
  'nav.help': { en: 'Help', ne: 'सहायता' },
  'nav.feedback': { en: 'Feedback', ne: 'प्रतिक्रिया' },
  
  // Footer
  'footer.description': { en: 'Empowering communities through digital governance and transparent complaint management.', ne: 'डिजिटल गभर्नेन्स र पारदर्शी गुनासो व्यवस्थापन मार्फत समुदायहरूलाई सशक्त बनाउने।' },
  'footer.quickLinks': { en: 'Quick Links', ne: 'छिटो लिंकहरू' },
  'footer.support': { en: 'Support', ne: 'सहायता' },
  'footer.contact': { en: 'Contact Us', ne: 'सम्पर्क गर्नुहोस्' },
  'footer.privacy': { en: 'Privacy Policy', ne: 'गोपनीयता नीति' },
  'footer.terms': { en: 'Terms of Service', ne: 'सेवाका सर्तहरू' },
  'footer.rights': { en: 'All rights reserved.', ne: 'सबै अधिकार सुरक्षित।' },
  
  // Home page
  'home.welcome': { en: 'Welcome to Hello Samaj', ne: 'Hello Samaj मा स्वागत छ' },
  'home.subtitle': { en: 'Your voice matters. Report local issues, track progress, and help build a better community together.', ne: 'तपाईंको आवाज महत्त्वपूर्ण छ। स्थानीय समस्याहरू रिपोर्ट गर्नुहोस्, प्रगति ट्र्याक गर्नुहोस्, र राम्रो समुदाय निर्माणमा सहयोग गर्नुहोस्।' },
  'home.submitComplaint': { en: 'Submit a Complaint', ne: 'गुनासो पेश गर्नुहोस्' },
  'home.trackComplaint': { en: 'Track Your Complaint', ne: 'तपाईंको गुनासो ट्र्याक गर्नुहोस्' },
  'home.viewPublic': { en: 'View Public Complaints', ne: 'सार्वजनिक गुनासोहरू हेर्नुहोस्' },
  'home.submitComplaintDesc': { en: 'Report issues in your community', ne: 'तपाईंको समुदायका समस्याहरू रिपोर्ट गर्नुहोस्' },
  'home.trackComplaintDesc': { en: 'Check the status of your complaint', ne: 'तपाईंको गुनासोको स्थिति जाँच गर्नुहोस्' },
  'home.viewPublicDesc': { en: 'View community issues', ne: 'समुदायिक समस्याहरू हेर्नुहोस्' },
  'home.quickActions': { en: 'Quick Actions', ne: 'छिटो कार्यहरू' },
  'home.quickActionsDesc': { en: 'Get started with these simple steps', ne: 'यी सरल चरणहरूसँग सुरु गर्नुहोस्' },
  'home.communityImpact': { en: 'Community Impact', ne: 'सामुदायिक प्रभाव' },
  'home.communityImpactDesc': { en: 'Together, we\'re making a difference', ne: 'सँगै, हामी फरक पार्दै छौं' },
  'home.totalComplaints': { en: 'Total Complaints', ne: 'कुल गुनासोहरू' },
  'home.resolvedIssues': { en: 'Resolved Issues', ne: 'समाधान भएका समस्याहरू' },
  'home.inProgress': { en: 'In Progress', ne: 'प्रगतिमा' },
  'home.activeUsers': { en: 'Active Users', ne: 'सक्रिय प्रयोगकर्ताहरू' },
  'home.howItWorks': { en: 'How It Works', ne: 'यो कसरी काम गर्छ' },
  'home.howItWorksDesc': { en: 'Simple steps to make your voice heard', ne: 'तपाईंको आवाज सुनाउन सरल चरणहरू' },
  'home.step1Title': { en: 'Report the Issue', ne: 'समस्या रिपोर्ट गर्नुहोस्' },
  'home.step1Desc': { en: 'Describe the problem with photos and location details', ne: 'फोटो र स्थान विवरणसहित समस्या वर्णन गर्नुहोस्' },
  'home.step2Title': { en: 'Track Progress', ne: 'प्रगति ट्र्याक गर्नुहोस्' },
  'home.step2Desc': { en: 'Monitor the status and get updates on your complaint', ne: 'स्थिति निगरानी गर्नुहोस् र आफ्नो गुनासोमा अपडेट पाउनुहोस्' },
  'home.step3Title': { en: 'See Results', ne: 'परिणाम हेर्नुहोस्' },
  'home.step3Desc': { en: 'Watch as your community improves through collective action', ne: 'सामूहिक कार्यबाट तपाईंको समुदाय सुधार हुँदै गरेको हेर्नुहोस्' },
  
  // Submit complaint
  'submit.selectLocation': { en: 'Select Location on Map', ne: 'नक्सामा स्थान छान्नुहोस्' },
  'submit.mapHelp': { en: 'Click on the map to select the exact location of the issue', ne: 'समस्याको सही स्थान छान्न नक्सामा क्लिक गर्नुहोस्' },
  'submit.selectedLocation': { en: 'Selected Location', ne: 'छानिएको स्थान' },
  
  // Login page
  'login.welcomeBack': { en: 'Welcome Back', ne: 'फिर्ता स्वागत छ' },
  'login.signInMessage': { en: 'Sign in to your Hello Samaj account', ne: 'आफ्नो Hello Samaj खातामा साइन इन गर्नुहोस्' },
  'login.enterCredentials': { en: 'Enter your credentials to access your account', ne: 'आफ्नो खाता पहुँच गर्न आफ्ना प्रमाणहरू प्रविष्ट गर्नुहोस्' },
  'login.emailAddress': { en: 'Email Address', ne: 'इमेल ठेगाना' },
  'login.emailPlaceholder': { en: 'your.email@example.com', ne: 'तपाईको.इमेल@उदाहरण.com' },
  'login.password': { en: 'Password', ne: 'पासवर्ड' },
  'login.passwordPlaceholder': { en: 'Enter your password', ne: 'आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्' },
  'login.rememberMe': { en: 'Remember me', ne: 'मलाई सम्झनुहोस्' },
  'login.forgotPassword': { en: 'Forgot password?', ne: 'पासवर्ड बिर्सनुभयो?' },
  'login.signIn': { en: 'Sign In', ne: 'साइन इन' },
  'login.signingIn': { en: 'Signing in...', ne: 'साइन इन गर्दै...' },
  'login.noAccount': { en: 'Don\'t have an account?', ne: 'खाता छैन?' },
  'login.signUpHere': { en: 'Sign up here', ne: 'यहाँ साइन अप गर्नुहोस्' },
  'login.continueAs': { en: 'Continue as a', ne: 'यसरी जारी राख्नुहोस्' },
  'login.guestUser': { en: 'guest user', ne: 'अतिथि प्रयोगकर्ता' },
  'login.missingInfo': { en: 'Missing Information', ne: 'जानकारी छुटेको' },
  'login.fillAllFields': { en: 'Please fill in all required fields.', ne: 'कृपया सबै आवश्यक क्षेत्रहरू भर्नुहोस्।' },
  'login.success': { en: 'Login Successful!', ne: 'लगइन सफल!' },
  
  // Status
  'status.pending': { en: 'Pending', ne: 'बाँकी' },
  'status.inProgress': { en: 'In Progress', ne: 'प्रगतिमा' },
  'status.resolved': { en: 'Resolved', ne: 'समाधान भयो' },
  
  // Priority
  'priority.low': { en: 'Low', ne: 'कम' },
  'priority.medium': { en: 'Medium', ne: 'मध्यम' },
  'priority.high': { en: 'High', ne: 'उच्च' },
  
  // Common
  'common.search': { en: 'Search', ne: 'खोज्नुहोस्' },
  'common.filter': { en: 'Filter', ne: 'फिल्टर' },
  'common.submit': { en: 'Submit', ne: 'पेश गर्नुहोस्' },
  'common.cancel': { en: 'Cancel', ne: 'रद्द गर्नुहोस्' },
  'common.save': { en: 'Save', ne: 'सेभ गर्नुहोस्' },
  'common.edit': { en: 'Edit', ne: 'सम्पादन गर्नुहोस्' },
  'common.delete': { en: 'Delete', ne: 'मेटाउनुहोस्' },
  'common.getStarted': { en: 'Get Started', ne: 'सुरु गर्नुहोस्' },
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<'en' | 'ne'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'en' | 'ne') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ne' : 'en');
  };

  return {
    language,
    t,
    toggleLanguage
  };
};
