import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    brand_title: 'RailSathi',
    nav_search: 'Search Trains',
    nav_bookings: 'My Bookings',
    nav_pnr: 'PNR Enquiry',
    nav_companion: 'Smart Companion',
    nav_admin: 'Admin Console',
    search_heading: 'Find Trains, Real-Time Availability & Fare Estimate',
    from_station: 'From Station',
    to_station: 'To Station',
    travel_date: 'Journey Date',
    class_label: 'Class',
    search_button: 'Search Trains',
    departure: 'Departure',
    arrival: 'Arrival',
    duration: 'Duration',
    book_now: 'Book Ticket',
    view_stops: 'Schedule & Halts',
    alternative_title: 'Smart Alternative Journey Explorer',
    status_confirmed: 'CONFIRMED',
    status_rac: 'RAC',
    status_wl: 'WAITLISTED',
    status_cancelled: 'CANCELLED',
    pnr_input_placeholder: 'Enter 10-digit PNR (e.g. 482-910-3847)',
    check_pnr: 'Get Status',
    upcoming_journey: 'Upcoming Journey',
    departure_checklist: 'Pre-Journey Packing Checklist',
    live_running_status: 'Simulated Live Status',
    refund_estimate: 'Refund Calculation',
    cancel_ticket: 'Cancel Booking',
    download_ticket: 'Print / Save E-Ticket',
    ask_ai: 'Ask Rail Assistant',
  },
  ta: {
    brand_title: 'ரயில்சாதி (RailSathi)',
    nav_search: 'ரயில் தேடல்',
    nav_bookings: 'எனது டிக்கெட்டுகள்',
    nav_pnr: 'PNR நிலை',
    nav_companion: 'ஸ்மார்ட் பயண தோழன்',
    nav_admin: 'நிர்வாக மையம்',
    search_heading: 'ரயில் அட்டவணை, இருக்கை இருப்பு & கட்டண விவரங்கள்',
    from_station: 'புறப்படும் நிலையம்',
    to_station: 'சேரும் நிலையம்',
    travel_date: 'பயணத் தேதி',
    class_label: 'பயண வகுப்பு',
    search_button: 'ரயில்களைத் தேடு',
    departure: 'புறப்பாடு',
    arrival: 'வருகை',
    duration: 'பயண நேரம்',
    book_now: 'முன்பதிவு செய்',
    view_stops: 'நிலைய அட்டவணை',
    alternative_title: 'ஸ்மார்ட் மாற்றுப் பயண வழிகாட்டி',
    status_confirmed: 'உறுதி செய்யப்பட்டது',
    status_rac: 'RAC (பகிர்வு)',
    status_wl: 'காத்திருப்புப் பட்டியல்',
    status_cancelled: 'ரத்து செய்யப்பட்டது',
    pnr_input_placeholder: '10 இலக்க PNR எண்ணை உள்ளிடவும்',
    check_pnr: 'நிலையை அறி',
    upcoming_journey: 'வரவிருக்கும் பயணம்',
    departure_checklist: 'பயணத் தயாரிப்பு சரிபார்ப்புப் பட்டியல்',
    live_running_status: 'நேரலை ரயில் நிலை',
    refund_estimate: 'திருப்பிச் செலுத்தும் தொகை',
    cancel_ticket: 'டிக்கெட் ரத்து செய்',
    download_ticket: 'மின்-டிக்கெட் பதிவிறக்கு',
    ask_ai: 'AI ரயில் உதவியாளர்',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('railsathi_lang') as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('railsathi_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
