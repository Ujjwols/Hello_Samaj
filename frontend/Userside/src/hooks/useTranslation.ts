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
  'login.otp': { en: 'OTP', ne: 'OTP' },
  'login.otpPlaceholder': { en: 'Enter OTP', ne: 'OTP प्रविष्ट गर्नुहोस्' },
  'login.otpDescription': { en: 'Enter the OTP sent to your email or phone', ne: 'तपाईंको इमेल वा फोनमा पठाइएको OTP प्रविष्ट गर्नुहोस्' },
  'login.otpSent': { en: 'OTP Sent', ne: 'OTP पठाइयो' },
  'login.otpSentDescription': { en: 'An OTP has been sent to your {{method}}.', ne: 'तपाईंको {{method}} मा OTP पठाइयो।' },
  'login.sendOTP': { en: 'Send OTP', ne: 'OTP पठाउनुहोस्' },
  'login.verifyOTP': { en: 'Verify OTP', ne: 'OTP प्रमाणीकरण गर्नुहोस्' },
  'login.verifyingOTP': { en: 'Verifying OTP...', ne: 'OTP प्रमाणीकरण गर्दै...' },
  'login.otpVerificationFailed': { en: 'OTP Verification Failed', ne: 'OTP प्रमाणीकरण असफल' },
  'login.enterOTP': { en: 'Please enter the OTP sent to your email or phone.', ne: 'कृपया तपाईंको इमेल वा फोनमा पठाइएको OTP प्रविष्ट गर्नुहोस्।' },
  'login.invalidOTP': { en: 'Invalid OTP. Please try again.', ne: 'अमान्य OTP। कृपया फेरि प्रयास गर्नुहोस्।' },
  
  // Register page
  'register.welcome': { en: 'Join Hello Samaj', ne: 'Hello Samaj मा सामेल हुनुहोस्' },
  'register.subtitle': { en: 'Create your account to get started', ne: 'सुरु गर्न आफ्नो खाता बनाउनुहोस्' },
  'register.title': { en: 'Register', ne: 'दर्ता' },
  'register.description': { en: 'Fill in your details to create an account', ne: 'खाता बनाउन आफ्नो विवरणहरू भर्नुहोस्' },
  'register.fullName': { en: 'Full Name *', ne: 'पूरा नाम *' },
  'register.fullNamePlaceholder': { en: 'Your full name', ne: 'तपाईंको पूरा नाम' },
  'register.emailAddress': { en: 'Email Address *', ne: 'इमेल ठेगाना *' },
  'register.emailPlaceholder': { en: 'your.email@example.com', ne: 'तपाईको.इमेल@उदाहरण.com' },
  'register.phoneNumber': { en: 'Phone Number *', ne: 'फोन नम्बर *' },
  'register.phoneNumberPlaceholder': { en: '+977-98XXXXXXXX', ne: '+977-98XXXXXXXX' },
  'register.password': { en: 'Password *', ne: 'पासवर्ड *' },
  'register.passwordPlaceholder': { en: 'Create a strong password', ne: 'बलियो पासवर्ड बनाउनुहोस्' },
  'register.confirmPassword': { en: 'Confirm Password *', ne: 'पासवर्ड पुष्टि गर्नुहोस् *' },
  'register.confirmPasswordPlaceholder': { en: 'Confirm your password', ne: 'आफ्नो पासवर्ड पुष्टि गर्नुहोस्' },
  'register.city': { en: 'City *', ne: 'शहर *' },
  'register.selectCity': { en: 'Select city', ne: 'शहर छान्नुहोस्' },
  'register.kathmandu': { en: 'Kathmandu', ne: 'काठमाडौं' },
  'register.lalitpur': { en: 'Lalitpur', ne: 'ललितपुर' },
  'register.bhaktapur': { en: 'Bhaktapur', ne: 'भक्तपुर' },
  'register.wardNumber': { en: 'Ward Number *', ne: 'वडा नम्बर *' },
  'register.selectWardNumber': { en: 'Select ward number', ne: 'वडा नम्बर छान्नुहोस्' },
  'register.ward': { en: 'Ward', ne: 'वडा' },
  'register.tole': { en: 'Tole (Optional)', ne: 'टोल (वैकल्पिक)' },
  'register.tolePlaceholder': { en: 'Your tole (e.g., Na Tole)', ne: 'तपाईंको टोल (उदाहरण, ना टोल)' },
  'register.gender': { en: 'Gender *', ne: 'लिङ्ग *' },
  'register.selectGender': { en: 'Select gender', ne: 'लिङ्ग छान्नुहोस्' },
  'register.male': { en: 'Male', ne: 'पुरुष' },
  'register.female': { en: 'Female', ne: 'महिला' },
  'register.dob': { en: 'Date of Birth *', ne: 'जन्म मिति *' },
  'register.profilePic': { en: 'Profile Picture *', ne: 'प्रोफाइल तस्वीर *' },
  'register.additionalFile': { en: 'Additional File (Optional)', ne: 'थप फाइल (वैकल्पिक)' },
  'register.agreeTo': { en: 'I agree to the', ne: 'म सहमत छु' },
  'register.and': { en: 'and', ne: 'र' },
  'register.passwordMismatch': { en: 'Password Mismatch', ne: 'पासवर्ड मेल खाएन' },
  'register.passwordsDoNotMatch': { en: 'Passwords do not match. Please try again.', ne: 'पासवर्डहरू मेल खाएनन्। कृपया फेरि प्रयास गर्नुहोस्।' },
  'register.termsRequired': { en: 'Terms Required', ne: 'सर्तहरू आवश्यक' },
  'register.agreeToTerms': { en: 'Please agree to the terms and conditions.', ne: 'कृपया सर्तहरू र नियमहरूमा सहमत हुनुहोस्।' },
  'register.invalidWardNumber': { en: 'Invalid Ward Number', ne: 'अमान्य वडा नम्बर' },
  'register.invalidWardKathmandu': { en: 'Ward number for Kathmandu must be between 1 and 32.', ne: 'काठमाडौंको लागि वडा नम्बर १ देखि ३२ सम्म हुनुपर्छ।' },
  'register.invalidWardLalitpur': { en: 'Ward number for Lalitpur must be between 1 and 29.', ne: 'ललितपुरको लागि वडा नम्बर १ देखि २९ सम्म हुनुपर्छ।' },
  'register.invalidWardBhaktapur': { en: 'Ward number for Bhaktapur must be between 1 and 10.', ne: 'भक्तपुरको लागि वडा नम्बर १ देखि १० सम्म हुनुपर्छ।' },
  'register.registrationSuccessful': { en: 'Registration Successful!', ne: 'दर्ता सफल!' },
  'register.welcomeMessage': { en: 'Welcome to Hello Samaj. Your account has been created.', ne: 'Hello Samaj मा स्वागत छ। तपाईंको खाता बनाइयो।' },
  'register.registrationFailed': { en: 'Registration Failed', ne: 'दर्ता असफल' },
  'register.errorOccurred': { en: 'An error occurred. Please try again.', ne: 'एउटा त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।' },
  'register.missingInfo': { en: 'Missing Information', ne: 'जानकारी छुटेको' },
  'register.fillAllFields': { en: 'Please fill in all required fields and upload a profile picture.', ne: 'कृपया सबै आवश्यक क्षेत्रहरू भर्नुहोस् र प्रोफाइल तस्वीर अपलोड गर्नुहोस्।' },
  'register.alreadyHaveAccount': { en: 'Already have an account?', ne: 'पहिले नै खाता छ?' },
  'register.creatingAccount': { en: 'Creating Account...', ne: 'खाता बनाउँदै...' },
  
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

  const t = (key: string, params?: { [key: string]: string }): string => {
    let translation = translations[key]?.[language] || key;
    if (params) {
      Object.keys(params).forEach((param) => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }
    return translation;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ne' : 'en'));
  };

  return {
    language,
    t,
    toggleLanguage,
  };
};