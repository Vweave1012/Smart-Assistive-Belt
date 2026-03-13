import React, { useState, useEffect } from 'react';
/* Added Utensils, Droplets, Baby for TSL metrics */
import { Bell, LogOut, Plus, Trash2, Phone, MessageSquare, Activity, Eye, EyeOff, Mail, Lock, Clock, User, CheckCircle, Utensils, Droplets, Baby } from 'lucide-react';

import { loginUser, registerUser, predictState, getState, updateEvent } from "./api";

const translations = {
  // --- International ---
  en: { title: "CarePulse", systemStatus: "Patient Monitoring System", connected: "BELT CONNECTED", disconnected: "BELT DISCONNECTED", sinceMeal: "Since Last Meal", sinceUrine: "Since Last Urine", sinceBowel: "Since Last Bowel", alerts: "Alerts", medications: "Medications", notes: "Clinical Notes", logout: "Logout" },
  es: { title: "CarePulse", systemStatus: "Sistema de Monitoreo", connected: "CINTURÓN CONECTADO", disconnected: "CINTURÓN DESCONECTADO", sinceMeal: "Desde la última comida", sinceUrine: "Desde la última orina", sinceBowel: "Desde la última deposición", alerts: "Alertas", medications: "Medicamentos", notes: "Notas Clínicas", logout: "Cerrar Sesión" },
  fr: { title: "CarePulse", systemStatus: "Système de Surveillance", connected: "CEINTURE CONNECTÉE", disconnected: "CEINTURE DÉCONNECTÉE", sinceMeal: "Depuis le dernier repas", sinceUrine: "Depuis la dernière urine", sinceBowel: "Depuis la dernière selle", alerts: "Alertes", medications: "Médicaments", notes: "Notes Cliniques", logout: "Déconnexion" },
  de: { title: "CarePulse", systemStatus: "Patientenüberwachung", connected: "GÜRTEL VERBUNDEN", disconnected: "GÜRTEL TRENNUNG", sinceMeal: "Seit der letzten Mahlzeit", sinceUrine: "Seit dem letzten Urin", sinceBowel: "Seit dem letzten Stuhlgang", alerts: "Warnungen", medications: "Medikamente", notes: "Klinische Notizen", logout: "Abmelden" },
  zh: { title: "CarePulse", systemStatus: "患者监测系统", connected: "腰带已连接", disconnected: "腰带已断开", sinceMeal: "自上次进食以来", sinceUrine: "自上次排尿以来", sinceBowel: "自上次排便以来", alerts: "警报", medications: "药物", notes: "临床笔记", logout: "登出" },
  ar: { title: "CarePulse", systemStatus: "نظام مراقبة المريض", connected: "الحزام متصل", disconnected: "الحزام مقطوع", sinceMeal: "منذ آخر وجبة", sinceUrine: "منذ آخر تبول", sinceBowel: "منذ آخر تبرز", alerts: "تنبيهات", medications: "أدوية", notes: "ملاحظات سريرية", logout: "تسجيل الخروج" },
  ja: { title: "CarePulse", systemStatus: "患者モニタリングシステム", connected: "ベルト接続中", disconnected: "ベルト切断", sinceMeal: "前回の食事から", sinceUrine: "前回の排尿から", sinceBowel: "前回の排便から", alerts: "アラート", medications: "服薬", notes: "臨床メモ", logout: "ログアウト" },
  ru: { title: "CarePulse", systemStatus: "Система мониторинга пациента", connected: "РЕМЕНЬ ПОДКЛЮЧЕН", disconnected: "РЕМЕНЬ ОТКЛЮЧЕН", sinceMeal: "С последнего приема пищи", sinceUrine: "С последнего мочеиспускания", sinceBowel: "С последней дефекации", alerts: "Оповещения", medications: "Лекарства", notes: "Клинические заметки", logout: "Выйти" },
  pt: { title: "CarePulse", systemStatus: "Sistema de Monitoramento", connected: "CINTO CONECTADO", disconnected: "CINTO DESCONECTADO", sinceMeal: "Desde a última refeição", sinceUrine: "Desde a última urina", sinceBowel: "Desde a última evacuação", alerts: "Alertas", medications: "Medicamentos", notes: "Notas Clínicas", logout: "Sair" },
  ne: { title: "केयरपल्स", systemStatus: "बिरामी निगरानी प्रणाली", connected: "बेल्ट जडान भयो", disconnected: "बेल्ट विच्छेद भयो", sinceMeal: "अन्तिम खाना पछि", sinceUrine: "अन्तिम पिसाब पछि", sinceBowel: "अन्तिम शौच पछि", alerts: "अलर्ट", medications: "औषधिहरू", notes: "क्लिनिकल नोटहरू", logout: "लग आउट" },

  // --- Indian (Keep your existing Indian languages here) ---
  hi: { title: "केयरपल्स", systemStatus: "मरीज निगरानी प्रणाली", connected: "बेल्ट जुड़ा हुआ है", disconnected: "बेल्ट डिस्कनेक्ट हो गया", sinceMeal: "पिछले भोजन के बाद से", sinceUrine: "पिछले पेशाब के बाद से", sinceBowel: "पिछली शौच के बाद से", alerts: "अलर्ट", medications: "दवाइयाँ", notes: "क्लिनिकल नोट्स", logout: "लॉग आउट" },
  mr: { title: "केअरपल्स", systemStatus: "रुग्ण देखरेख प्रणाली", connected: "बेल्ट जोडला गेला आहे", disconnected: "बेल्ट डिस्कनेक्ट झाला", sinceMeal: "शेवटच्या जेवणापासून", sinceUrine: "शेवटच्या लघवीपासून", sinceBowel: "शेवटच्या शौचापासून", alerts: "अलर्ट", medications: "औषधे", notes: "क्लिनिकल नोट्स", logout: "लॉग आउट" },
  ta: { title: "கேர் பல்ஸ்", systemStatus: "நோயாளி கண்காணிப்பு அமைப்பு", connected: "பெல்ட் இணைக்கப்பட்டுள்ளது", disconnected: "பெல்ட் துண்டிக்கப்பட்டது", sinceMeal: "கடைசி உணவிற்கு பிறகு", sinceUrine: "கடைசி சிறுநீருக்கு பிறகு", sinceBowel: "கடைசி மலம் கழித்த பிறகு", alerts: "எச்சரிக்கைகள்", medications: "மருந்துகள்", notes: "மருத்துவ குறிப்புகள்", logout: "வெளியேறு" },
  te: { title: "కేర్ పల్స్", systemStatus: "రోగి పర్యవేక్షణ వ్యవస్థ", connected: "బెల్ట్ కనెక్ట్ చేయబడింది", disconnected: "బెల్ట్ డిస్కనెక్ట్ చేయబడింది", sinceMeal: "చివరి భోజనం నుండి", sinceUrine: "చివరి మూత్ర విసర్జన నుండి", sinceBowel: "చివరి మల విసర్జన నుండి", alerts: "అలర్ట్లు", medications: "మందులు", notes: "క్లినికల్ నోટ્સ", logout: "లాగ్ అవుట్" },
  as: { title: "কেয়াৰ পাল্‌চ", systemStatus: "ৰোগী নিৰীক্ষণ প্ৰণালী", connected: "বেল্ট সংলগ্ন হৈ আছে", disconnected: "বেল্ট বিছিন্ন হৈছে", sinceMeal: "শেষ আহাৰৰ পৰা", sinceUrine: "শেষ প্ৰস্ৰাৱৰ পৰা", sinceBowel: "শেষ শৌচৰ পৰা", alerts: "সতৰ্কবাণী", medications: "ঔষধ", notes: "ক্লিনিকাল টোকা", logout: "লগ আউট" },
  mni: { title: "কেয়র পルス", systemStatus: "অনায়েক য়েংশিনবগী লম্বী", connected: "বেল্ট শমজিনখ্রে", disconnected: "বেল্ট থাদোকখ্রে", sinceMeal: "অকোনবা চাক চবগী মতুংদগী", sinceUrine: "অকোনবা অমতিং চৎপগী মতুংদগী", sinceBowel: "অকোনবা খোং হাম্বগী মতুংদগী", alerts: "চেকশিনৱা", medications: "হিদাক-ল্যাংথক", notes: "ক্লিনিকাল নোট", logout: "লগ আউত" },
  gu: { title: "કેર પલ્સ", systemStatus: "દર્દી નિરીક્ષણ સિસ્ટમ", connected: "બેલ્ટ જોડાયેલ છે", disconnected: "બેલ્ટ ડિસ્કનેક્ટ થયો", sinceMeal: "છેલ્લા ભોજન પછીથી", sinceUrine: "છેલ્લા પેશાબ પછીથી", sinceBowel: "છેલ્લા મળ ત્યાગ પછીથી", alerts: "અલર્ટ્સ", medications: "દવાઓ", notes: "ક્લિનિકલ નોંધો", logout: "લૉગ આઉટ" },
  kn: { title: "ಕೇರ್ ಪಲ್ಸ್", systemStatus: "ರೋಗಿ ಮೇಲ್ವಿಚಾರಣಾ ವ್ಯವಸ್ಥೆ", connected: "ಬೆಲ್ಟ್ ಸಂಪರ್ಕಗೊಂಡಿದೆ", disconnected: "ಬೆಲ್ಟ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ", sinceMeal: "ಕೊನೆಯ ಊಟದ ನಂತರ", sinceUrine: "ಕೊನೆಯ ಮೂತ್ರ ವಿಸರ್ಜನ ನಂತರ", sinceBowel: "ಕೊನೆಯ ಮಲ ವಿಸರ್ಜನೆ ನಂತರ", alerts: "ಎಚ್ಚರಿಕೆಗಳು", medications: "ಔಷಧಿಗಳು", notes: "ಕ್ಲಿನಿಕಲ್ ಟಿಪ್ಪಣಿಗಳು", logout: "ಲಾಗ್ ಔಟ್" },
  ml: { title: "കെയർ പൾസ്", systemStatus: "രോഗി നിരീക്ഷണ സംവിധാനം", connected: "ബെൽറ്റ് ബന്ധിപ്പിച്ചിരിക്കുന്നു", disconnected: "ബെൽറ്റ് വിച്ഛേദിക്കപ്പെട്ടു", sinceMeal: "അവസാന ഭക്ഷണത്തിന് ശേഷം", sinceUrine: "അവസാന മൂത്രവിസർജ്ജനത്തിന് ശേഷം", sinceBowel: "അവസാന മലവിസർജ്ജനത്തിന് ശേഷം", alerts: "അലേർട്ടുകൾ", medications: "മരുന്നുകൾ", notes: "ക്ലിനിക്കൽ കുറിപ്പുകൾ", logout: "ലോഗ് ഔട്ട്" },
  bn: { title: "কেয়ার পালস", systemStatus: "রোগী পর্যবেক্ষণ সিস্টেম", connected: "বেল্ট সংযুক্ত", disconnected: "বেল্ট সংযোগ বিচ্ছিন্ন", sinceMeal: "শেষ খাবারের পর থেকে", sinceUrine: "শেষ প্রস্রাবের পর থেকে", sinceBowel: "শেষ মলত্যাগের পর থেকে", alerts: "অ্যালার্ট", medications: "ওষুধ", notes: "ক্লিনিক্যাল নোট", logout: "লগ আউট" },
  pa: { title: "ਕੇਅਰ ਪਲਸ", systemStatus: "ਮਰੀਜ਼ ਨਿਗਰਾਨੀ ਪ੍ਰਣਾਲੀ", connected: "ਬੈਲਟ ਜੁੜੀ ਹੋਈ ਹੈ", disconnected: "ਬੈਲਟ ਡਿਸਕਨੈਕਟ ਹੋ ਗਈ", sinceMeal: "ਆਖਰੀ ਭੋजन ਤੋਂ ਬਾਅद", sinceUrine: "ਆਖਰੀ ਪਿਸ਼ਾਬ ਤੋਂ ਬਾਅਦ", sinceBowel: "ਆਖਰੀ ਟੱਟੀ ਤੋਂ ਬਾਅਦ", alerts: "ਅਲਰਟ", medications: "ਦਵਾਈਆਂ", notes: "ਕਲੀਨਿਕਲ ਨੋਟਸ", logout: "ਲੌਗ ਆਊਟ" },
  sat: { title: "केयर पल्स", systemStatus: "रोगी नेंगाओ सेबा", connected: "बेल्ट जोड़ाव अकाना", disconnected: "बेल्ट बाड़ जोड़ाव अकाना", sinceMeal: "मुचात जोम तायोम", sinceUrine: "मुचात उडुग तायोम", sinceBowel: "मुचात ईज तायोम", alerts: "एलेर्ट", medications: "रान को", notes: "क्लिनिकल ओल", logout: "ओडोक" },
  ur: { title: "کیئر پلس", systemStatus: "مریض کی نگرانی کا نظام", connected: "بیلٹ منسلک ہے", disconnected: "بیلٹ منقطع ہو گیا", sinceMeal: "آخری کھانے کے بعد سے", sinceUrine: "آخری پیشاب کے بعد سے", sinceBowel: "آخری فضلے کے بعد سے", alerts: "الرٹس", medications: "ادویات", notes: "کلینیکل نوٹس", logout: "لاگ آؤٹ" },
  or: { title: "କେୟାର ପଲ୍ସ", systemStatus: "ରୋଗୀ ନିରୀକ୍ଷଣ ପ୍ରଣାଳୀ", connected: "ବେଲ୍ଟ ସଂଯୁକ୍ତ ଅଛି", disconnected: "ବେଲ୍ଟ ବିଚ୍ଛିନ୍ନ ହୋଇଛି", sinceMeal: "ଶେଷ ଭୋଜନ ପରଠାରୁ", sinceUrine: "ଶେଷ ପରିସ୍ରା ପରଠାରୁ", sinceBowel: "ଶେଷ ମଳତ୍ୟାଗ ପରଠାରୁ", alerts: "ସତର୍କତା", medications: "ଓଷଧ", notes: "କ୍ଲିନିକାଲ୍ ନୋଟ୍", logout: "ଲଗ୍ ଆଉଟ୍" },
  doi: { title: "केयर पल्स", systemStatus: "मरीज निगरानी प्रणाली", connected: "बेल्ट जुड़ी दी ऐ", disconnected: "बेल्ट कटी दी ऐ", sinceMeal: "खादा खादे शा बाद", sinceUrine: "पेशाब शा बाद", sinceBowel: "शौच शा बाद", alerts: "अलर्ट", medications: "दवाइयां", notes: "क्लिनिकल नोट्स", logout: "लाग आउट" },
  brx: { title: "केयर पल्स", systemStatus: "साग्लोब नायदिं सिस्टम", connected: "बेल्ट फोनांजाबाय", disconnected: "बेल्ट सिगाइबाय", sinceMeal: "जोबथा जाखांनायनि उनाव", sinceUrine: "जोबथा हासुयनायनि उनाव", sinceBowel: "जोबथा खिनायनि उनाव", alerts: "एलेर्ट", medications: "मुलिफोर", notes: "क्लिनिकल नोट", logout: "लोग आउट" }
};
 




export default function CaregiverApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lang, setLang] = useState('en'); 
  const t = translations[lang] || translations['en'];
  // --- ADDED STATE FOR ONE-TIME SETUP ---
  const [isFirstSetup, setIsFirstSetup] = useState(true);
  const [patientProfile, setPatientProfile] = useState({
    name: '',
    disorder: '',
    age: '',
    caregiverName: ''
  });

  const [authMode, setAuthMode] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // --- ADDED STATE FOR BACKEND METRICS ---
  const [activeAlert, setActiveAlert] = useState("WAITING_FOR_BELT");
  const [timeStats, setTimeStats] = useState({ tslm: 0, tslu: 0, tslb: 0 });
  const [beltConnected, setBeltConnected] = useState(false);
  const BACKEND_URL = "http://127.0.0.1:5000";

; // Replace with your IPv4

  const [alerts, setAlerts] = useState([]);
  // Updated patient to use state from setup form
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(new Set());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [historyView, setHistoryView] = useState(false);
  const [alertHistory, setAlertHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('alerts');
  const [medications, setMedications] = useState([]);
  const [behavioralNotes, setBehavioralNotes] = useState([]);
  const [newMedication, setNewMedication] = useState('');
  const [newMedicationTime, setNewMedicationTime] = useState('');
  const [newMedicationDosage, setNewMedicationDosage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showMedForm, setShowMedForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  
  // --- ADDED BACKEND FETCHING FUNCTIONS ---
  // Replace your existing updateFromBackend with this:
    const updateFromBackend = async () => {
      try {
        // 1) fetch stored timestamps (ISO strings) from backend
        const token = localStorage.getItem("token");

    const resp = await fetch(`${BACKEND_URL}/api/state`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await resp.json();
    // data expected: { last_meal: "...", last_pee: "...", last_poop: "..." }

    // helper to convert ISO timestamp -> hours since (rounded)
    const hoursSince = (iso) => {
      if (!iso) return null;
      const mins = (Date.now() - new Date(iso).getTime()) / (1000 * 60);
      return Math.round((mins / 60) * 10) / 10; // e.g. 1.5 hrs
    };

    setTimeStats({
      tslm: hoursSince(data.last_meal) ?? 0,
      tslu: hoursSince(data.last_pee) ?? 0,
      tslb: hoursSince(data.last_poop) ?? 0
    });

    // Optional: if you add `last_final_state` to state.json on server, show it:
    if (data.last_final_state) {
      setActiveAlert(data.last_final_state);

      // 🔹 connection check (10 sec rule)
      const lastTime = new Date(data.last_final_state_time).getTime();
      const diffSec = (Date.now() - lastTime) / 1000;

      setBeltConnected(diffSec < 10);
    } else {
      setBeltConnected(false);
    }

  } catch (error) {
    console.error("Backend offline or connection refused:", error);
  }
};

// Replace your handleReset with this:
  const handleReset = async (type) => {
    try {
      // map UI event name -> final_state expected by backend update_event
      const map = {
        meal: "HUNGER",
        toilet: "PEE",
        bowel: "POOP"
      };
      const final_state = map[type];
      if (!final_state) return console.warn("Unknown reset type:", type);

      const token = localStorage.getItem("token");

      const resp = await fetch(`${BACKEND_URL}/api/update_event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ final_state }),
      });


      if (!resp.ok) {
        console.warn("Reset API returned not OK:", resp.status);
      } else {
        // immediately refresh metrics display
        updateFromBackend();
      }
    } catch (err) {
      console.warn("Reset failed:", err);
    }
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!loginEmail || !loginPassword) {
      setAuthError('Please fill in all fields');
      return;
    }

    try {
      const res = await loginUser({
        email: loginEmail,
        password: loginPassword,
      });

      // ✅ login success → store user + go dashboard
      setCurrentUser(res);
      setIsAuthenticated(true);

      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      // ✅ THIS prints the real message on screen
      setAuthError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setAuthError('Please fill in all fields');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    try {
      await registerUser({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });

      // ✅ switch to login tab
      setAuthMode('login');

      // ✅ GREEN success message
      setAuthError('SUCCESS: Account created successfully. You can now log in.');

      // clear fields
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
  };



  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsAuthenticated(false);
    setIsFirstSetup(true);
    setCurrentUser(null);
  };



  // --- ADDED SETUP HANDLER ---
  const handleSetupSubmit = (e) => {
    e.preventDefault();
    if (patientProfile.name && patientProfile.disorder && patientProfile.age && patientProfile.caregiverName) {
      setIsFirstSetup(false);
    } else {
      alert("Please fill in all patient details.");
    }
  };



  const playAlertSound = (severity) => {
    if ('vibrate' in navigator) navigator.vibrate(severity === 'critical' ? [200, 100, 200, 100, 200] : [150, 100, 150]);
  };

  const acknowledgeAlert = (alertId) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const addMedication = () => {
    if (newMedication.trim() && newMedicationTime.trim() && newMedicationDosage.trim()) {
      const med = { id: Date.now(), name: newMedication, dosage: newMedicationDosage, time: newMedicationTime, taken: false, dateAdded: new Date().toLocaleString() };
      setMedications([med, ...medications]);
      setNewMedication('');
      setNewMedicationTime('');
      setNewMedicationDosage('');
      setShowMedForm(false);
    }
  };

  const toggleMedicationTaken = (id) => {
    setMedications(meds => meds.map(med => med.id === id ? { ...med, taken: !med.taken } : med));
  };

  const deleteMedication = (id) => {
    setMedications(meds => meds.filter(med => med.id !== id));
  };

  const addBehavioralNote = () => {
    if (newNote.trim()) {
      const note = { id: Date.now(), content: newNote, timestamp: new Date().toLocaleString() };
      setBehavioralNotes([note, ...behavioralNotes]);
      setNewNote('');
      setShowNoteForm(false);
    }
  };

  const deleteNote = (id) => {
    setBehavioralNotes(notes => notes.filter(note => note.id !== id));
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
    }
  }, []);

useEffect(() => {
  if (isAuthenticated) {
    updateFromBackend(); // Initial call
    const interval = setInterval(() => {
      updateFromBackend();
    }, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }
}, [isAuthenticated]);

useEffect(() => {
  if (!activeAlert || activeAlert === "NORMAL" || activeAlert === "NO_USER") return;

  let newAlert = null;
  // Match both standard and demo-mode strings
  if (activeAlert === "HUNGER" || activeAlert === "POTENTIAL_HUNGER") {
    newAlert = {
      id: Date.now(),
      severity: "warning",
      icon: "🍽️",
      title: "Hunger Detected",
      message: "Immediate attention required.",
      action: `Provide food to ${patientProfile.name}.`,
      timestamp: new Date()
    };
  }
  // Repeat this pattern for PEE and POOP...
  
  if (newAlert) {
    setAlerts(prev => [newAlert, ...prev]);
    setAlertHistory(prev => [newAlert, ...prev]);
  }
}, [activeAlert, patientProfile.name]);

//   useEffect(() => {
//     if (!activeAlert || activeAlert === "NORMAL" || activeAlert === "NO_USER") {
//       return; // ❌ DO NOT CLEAR OLD ALERTS
//     }

//   let newAlert = null;

//   // === Toilet / Hunger alerts ===
//   if (activeAlert === "HUNGER") {
//     newAlert = {
//       id: Date.now(),
//       severity: "warning",
//       icon: "🍽️",
//       title: "Hunger Detected",
//       message: "Time threshold reached since last meal.",
//       action: `Provide food to ${patientProfile.name}.`,
//       timestamp: new Date()
//     };
//   }

//   if (activeAlert === "PEE") {
//     newAlert = {
//       id: Date.now(),
//       severity: "critical",
//       icon: "🚽",
//       title: "Urine Activity Detected",
//       message: "Pressure change detected.",
//       action: `Assist ${patientProfile.name} immediately.`,
//       timestamp: new Date()
//     };
//   }

//   if (activeAlert === "POOP") {
//     newAlert = {
//       id: Date.now(),
//       severity: "critical",
//       icon: "🚽",
//       title: "Bowel Activity Detected",
//       message: "Sustained abdominal pressure detected.",
//       action: `Assist ${patientProfile.name} immediately.`,
//       timestamp: new Date()
//     };
//   }

//   // === Restlessness ===
//   if (activeAlert === "RESTLESS" || activeAlert === "HIGHLY_RESTLESS") {
//     const isHighly = activeAlert === "HIGHLY_RESTLESS";

//     newAlert = {
//       id: Date.now(),
//       severity: isHighly ? "critical" : "warning",
//       icon: "⚠️",
//       title: isHighly ? "High Restlessness" : "Restlessness Detected",
//       message: "Abnormal movement detected by belt.",
//       action: "Check patient comfort.",
//       timestamp: new Date()
//     };
//   }

//   if (!newAlert) return;

//   // ✅ Add new alert on top WITHOUT deleting old ones
//   setAlerts(prev => [newAlert, ...prev]);

//   // ✅ Also store in history
//   setAlertHistory(prev => [newAlert, ...prev]);

// }, [activeAlert]);
// useEffect(() => {
//   if (!activeAlert || activeAlert === "NORMAL" || activeAlert === "NO_USER") {
//     return;
//   }

//   let newAlert = null;

//   // ===== HUNGER (handles POTENTIAL_HUNGER too) =====
//   if (activeAlert.includes("HUNGER")) {
//     const urgent = activeAlert.startsWith("POTENTIAL");

//     newAlert = {
//       id: Date.now(),
//       severity: urgent ? "critical" : "warning",
//       icon: "🍽️",
//       title: urgent ? "URGENT: Hunger Alert" : "Hunger Detected",
//       message: urgent
//         ? "Long time since last meal."
//         : "Patient may be feeling hungry.",
//       action: `Provide food to ${patientProfile.name}.`,
//       timestamp: new Date()
//     };
//   }

//   // ===== PEE =====
//   if (activeAlert.includes("PEE")) {
//     const urgent = activeAlert.startsWith("POTENTIAL");

//     newAlert = {
//       id: Date.now(),
//       severity: "critical",
//       icon: "🚽",
//       title: urgent ? "URGENT: Toilet Needed" : "Urine Activity Detected",
//       message: "Assist patient to restroom.",
//       action: `Help ${patientProfile.name} immediately.`,
//       timestamp: new Date()
//     };
//   }

//   // ===== POOP =====
//   if (activeAlert.includes("POOP")) {
//     const urgent = activeAlert.startsWith("POTENTIAL");

//     newAlert = {
//       id: Date.now(),
//       severity: "critical",
//       icon: "🚽",
//       title: urgent ? "URGENT: Bowel Needed" : "Bowel Activity Detected",
//       message: "Assist patient urgently.",
//       action: `Help ${patientProfile.name} immediately.`,
//       timestamp: new Date()
//     };
//   }

//   // ===== RESTLESS =====
//   if (activeAlert === "RESTLESS" || activeAlert === "HIGHLY_RESTLESS") {
//     const isHighly = activeAlert === "HIGHLY_RESTLESS";

//     newAlert = {
//       id: Date.now(),
//       severity: isHighly ? "critical" : "warning",
//       icon: "⚠️",
//       title: isHighly ? "High Restlessness" : "Restlessness Detected",
//       message: "Abnormal movement detected by belt.",
//       action: "Check patient comfort.",
//       timestamp: new Date()
//     };
//   }

//   if (!newAlert) return;

//   setAlerts(prev => [newAlert, ...prev]);
//   setAlertHistory(prev => [newAlert, ...prev]);

// }, [activeAlert]);



  // Login/Register Page
  if (!isAuthenticated) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', maxWidth: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>CarePulse</h1>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Patient Monitoring System</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', background: '#f3f4f6', padding: '8px', borderRadius: '8px' }}>
            <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className="tab-btn" style={{ flex: 1, border: 'none', background: authMode === 'login' ? 'white' : 'transparent', color: authMode === 'login' ? '#3b82f6' : '#6b7280', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>Login</button>
            <button onClick={() => { setAuthMode('register'); setAuthError(''); }} className="tab-btn" style={{ flex: 1, border: 'none', background: authMode === 'register' ? 'white' : 'transparent', color: authMode === 'register' ? '#3b82f6' : '#6b7280', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>Sign Up</button>
          </div>

          {authError && (
            <div
              style={{
                background: authError.startsWith('SUCCESS') ? '#dcfce7' : '#fee2e2',
                border: authError.startsWith('SUCCESS') ? '1px solid #22c55e' : '1px solid #fecaca',
                color: authError.startsWith('SUCCESS') ? '#166534' : '#991b1b',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {authError.replace('SUCCESS: ', '')}
            </div>
          )}


          {authMode === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Email</label>
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="caregiver@example.com" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Password</label>
                <input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Sign In</button>
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>Demo: Use any email/password</p>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Full Name</label>
                <input type="text" value={registerName} onChange={(e) => setRegisterName(e.target.value)} placeholder="John Doe" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Email</label>
                <input type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="caregiver@example.com" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Password</label>
                <input type={showPassword ? 'text' : 'password'} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Confirm Password</label>
                <input type={showPassword ? 'text' : 'password'} value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Create Account</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- ADDED PATIENT SETUP FORM ---
  if (isFirstSetup) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Activity size={40} color="#3b82f6" style={{ marginBottom: '15px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937' }}>Patient Setup</h2>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Please enter patient details for this session</p>
          </div>
          <form onSubmit={handleSetupSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Patient Name</label>
              <input type="text" value={patientProfile.name} onChange={(e) => setPatientProfile({...patientProfile, name: e.target.value})} placeholder="e.g. John Anderson" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Condition/Disorder</label>
              <input type="text" value={patientProfile.disorder} onChange={(e) => setPatientProfile({...patientProfile, disorder: e.target.value})} placeholder="e.g. Autism Spectrum Disorder" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Patient Age</label>
              <input type="number" value={patientProfile.age} onChange={(e) => setPatientProfile({...patientProfile, age: e.target.value})} placeholder="e.g. 25" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Caregiver Name</label>
              <input type="text" value={patientProfile.caregiverName} onChange={(e) => setPatientProfile({...patientProfile, caregiverName: e.target.value})} placeholder="Your Name" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Start Monitoring</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ background: '#0f172a', padding: '20px 0', color: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={32} color="#60a5fa" />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Patient Monitoring System</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Real-time Care Management</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{patientProfile.caregiverName}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Caregiver</div>
            </div>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                style={{ background: '#1e293b', color: 'white', border: '1px solid #94a3b8', borderRadius: '8px', padding: '5px', cursor: 'pointer' }}
              >
                <optgroup label="International">
                 <option value="en">English</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                  <option value="zh">中文 (Chinese)</option>
                  <option value="ar">العربية (Arabic)</option>
                  <option value="ja">日本語 (Japanese)</option>
                  <option value="ru">Русский (Russian)</option>
                  <option value="pt">Português (Portuguese)</option>
                  <option value="ne">नेपाली (Nepali)</option>
                </optgroup>
                <optgroup label="Indian">
               <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="as">অসমীয়া (Assamese)</option>
                <option value="mni">মৈতেইলোন (Manipuri)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="sat">संताली (Santhali)</option>
                <option value="ur">اردو (Urdu)</option>
                <option value="or">ଓଡ଼ିଆ (Odia)</option>
                <option value="doi">डोगरी (Dogri)</option>
                <option value="brx">बड़ो (Bodo)</option>
                </optgroup>
              </select>

              <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {t.logout}
              </button>
            </div></div>
        
        <div style={{ background: '#1e293b', marginTop: '20px', padding: '15px 0' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '40px' }}>
            <div><p style={{ fontSize: '10px', color: '#94a3b8', margin: '0' }}>PATIENT</p><p style={{ margin: '0', fontWeight: 'bold' }}>{patientProfile.name}</p></div>
            <div><p style={{ fontSize: '10px', color: '#94a3b8', margin: '0' }}>CONDITION</p><p style={{ margin: '0', fontWeight: 'bold' }}>{patientProfile.disorder}</p></div>
            <div><p style={{ fontSize: '10px', color: '#94a3b8', margin: '0' }}>AGE</p><p style={{ margin: '0', fontWeight: 'bold' }}>{patientProfile.age} Years</p></div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '30px' }}>
          <button style={{ background: 'white', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer shadow' }}><Phone size={28} color="#3b82f6" /><span>Call Patient</span></button>
          <button style={{ background: 'white', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer shadow' }}><MessageSquare size={28} color="#10b981" /><span>Message</span></button>
          <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ background: soundEnabled ? '#eff6ff' : 'white', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer shadow' }}><Bell size={28} color={soundEnabled ? '#3b82f6' : '#9ca3af'} /><span>{soundEnabled ? 'Alerts On' : 'Alerts Off'}</span></button>
        </div>

        {/* --- ADDED CONTEXTUAL METRICS GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <MetricCard title={t.sinceMeal} value={timeStats.tslm} icon={<Utensils color="#f97316"/>} onReset={() => handleReset('meal')} />
        <MetricCard title={t.sinceUrine} value={timeStats.tslu} icon={<Droplets color="#3b82f6"/>} onReset={() => handleReset('toilet')} />
        <MetricCard title={t.sinceBowel} value={timeStats.tslb} icon={<Baby color="#92400e"/>} onReset={() => handleReset('bowel')} />
      </div>

        <div style={{ background: 'white', borderRadius: '12px', display: 'flex', border: '1px solid #e2e8f0', marginBottom: '20px', overflow: 'hidden' }}>
        <button onClick={() => setActiveTab('alerts')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'alerts' ? '#0f172a' : 'white', color: activeTab === 'alerts' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>
  {t.alerts}
</button>

<button onClick={() => setActiveTab('medications')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'medications' ? '#0f172a' : 'white', color: activeTab === 'medications' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>
  {t.medications}
</button>

<button onClick={() => setActiveTab('notes')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'notes' ? '#0f172a' : 'white', color: activeTab === 'notes' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>
  {t.notes}
</button>
        </div>

        {activeTab === 'alerts' && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '20px',
                background: beltConnected ? '#dcfce7' : '#fee2e2',
                borderLeft: `6px solid ${beltConnected ? '#16a34a' : '#dc2626'}`,
                padding: '20px',
                borderRadius: '12px'
              }}
            >
              {beltConnected ? (
                <CheckCircle size={32} color="#16a34a" />
              ) : (
                <span style={{ fontSize: '32px', color: '#dc2626' }}>✖</span>
              )}


              <div>
                <h3 style={{ margin: 0 }}>
                {beltConnected ? t.connected : t.disconnected}
                </h3>

                <p style={{ margin: 0, fontSize: '14px' }}>
                {beltConnected ? t.monitoring : t.waiting}
                </p>

              </div>
            </div>

            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button onClick={() => setHistoryView(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #0f172a', background: !historyView ? '#0f172a' : 'white', color: !historyView ? 'white' : '#0f172a', cursor: 'pointer' }}>Active Alerts</button>
              <button onClick={() => setHistoryView(true)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #0f172a', background: historyView ? '#0f172a' : 'white', color: historyView ? 'white' : '#0f172a', cursor: 'pointer' }}>History ({alertHistory.length})</button>
            </div>

            {!historyView ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alerts.length === 0 ? (
                  <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>No active alerts</div>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} style={{ background: 'white', borderLeft: `6px solid ${alert.severity === 'critical' ? '#dc2626' : '#f59e0b'}`, padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <span style={{ fontSize: '32px' }}>{alert.icon}</span>
                        <div>
                          <p style={{ fontWeight: 'bold', margin: '0' }}>{alert.title}</p>
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>{alert.message}</p>
                          <p style={{ color: '#4b5563', fontSize: '13px' }}>→ {alert.action}</p>
                        </div>
                      </div>
                      <button onClick={() => acknowledgeAlert(alert.id)} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Acknowledge</button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '12px', padding: '10px', border: '1px solid #e2e8f0' }}>
                {alertHistory.map(alert => (
                  <div key={alert.id} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{alert.icon}</span>
                    <div><p style={{ fontWeight: 'bold', margin: '0' }}>{alert.title}</p><p style={{ fontSize: '12px', color: '#64748b' }}>{alert.timestamp.toLocaleTimeString()}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div>
            <button onClick={() => setShowMedForm(!showMedForm)} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}><Plus size={18} /> Add Medication</button>
            {showMedForm && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginTop: '15px', border: '1px solid #e2e8f0' }}>
                <input type="text" placeholder="Medication name" value={newMedication} onChange={(e) => setNewMedication(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                <input type="text" placeholder="Dosage (e.g., 500mg)" value={newMedicationDosage} onChange={(e) => setNewMedicationDosage(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                <input type="time" value={newMedicationTime} onChange={(e) => setNewMedicationTime(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={addMedication} style={{ flex: 1, padding: '10px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setShowMedForm(false)} style={{ flex: 1, padding: '10px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{ marginTop: '20px' }}>
              {medications.map(med => (
                <div key={med.id} style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <input type="checkbox" checked={med.taken} onChange={() => toggleMedicationTaken(med.id)} style={{ width: '20px', height: '20px' }} />
                    <div><p style={{ fontWeight: 'bold', margin: '0', textDecoration: med.taken ? 'line-through' : 'none' }}>{med.name}</p><p style={{ fontSize: '12px', color: '#64748b' }}>{med.dosage} @ {med.time}</p></div>
                  </div>
                  <button onClick={() => deleteMedication(med.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div>
            <button onClick={() => setShowNoteForm(!showNoteForm)} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}><Plus size={18} /> Add Clinical Note</button>
            {showNoteForm && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginTop: '15px', border: '1px solid #e2e8f0' }}>
                <textarea placeholder="Enter clinical observation..." value={newNote} onChange={(e) => setNewNote(e.target.value)} style={{ width: '100%', padding: '10px', minHeight: '100px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #d1d5db' }}></textarea>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={addBehavioralNote} style={{ flex: 1, padding: '10px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save Note</button>
                  <button onClick={() => setShowNoteForm(false)} style={{ flex: 1, padding: '10px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{ marginTop: '20px' }}>
              {behavioralNotes.map(note => (
                <div key={note.id} style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}><p style={{ margin: '0', fontSize: '14px' }}>{note.content}</p><p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>{note.timestamp}</p></div>
                  <button onClick={() => deleteNote(note.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, width: '100%', background: 'white', borderTop: '1px solid #e2e8f0', padding: '10px 0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
          <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span>
          System Status: Connected
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
const MetricCard = ({ title, value, icon, onReset }) => (
  <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px' }}>{icon}</div>
      <div>
        <p style={{ fontSize: '10px', color: '#64748b', margin: '0', fontWeight: 'bold', textTransform: 'uppercase' }}>{title}</p>
        <p style={{ margin: '0', fontSize: '18px', fontWeight: '900' }}>{value} <span style={{fontSize: '12px', color: '#94a3b8'}}>Hrs</span></p>
      </div>
    </div>
    <button onClick={onReset} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Reset Timer</button>
  </div>
);