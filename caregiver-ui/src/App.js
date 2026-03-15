import React, { useState, useEffect } from 'react';
/* Added Utensils, Droplets, Baby for TSL metrics */
import { Bell, LogOut, Plus, Trash2, Phone, MessageSquare, Activity, Eye, EyeOff, Mail, Lock, Clock, User, CheckCircle, Utensils, Droplets, Baby } from 'lucide-react';

import { loginUser, registerUser, predictState, getState, updateEvent } from "./api";
import logo from "./assets/logo.svg";

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const translations = {
  en: { connected: "BELT CONNECTED", disconnected: "BELT DISCONNECTED", sinceMeal: "Since Last Meal", sinceUrine: "Since Last Urine", sinceBowel: "Since Last Bowel", alerts: "Alerts", medications: "Medications", notes: "Clinical Notes", logout: "Logout", monitoring: "System monitoring real-time patient behavior", waiting: "Waiting for sensor data from smart belt", callPatient: "Call Patient", message: "Message", activeAlerts: "Active Alerts", history: "History", acknowledge: "Acknowledge", noAlerts: "No active alerts", addMedication: "Add Medication", addNote: "Add Clinical Note", save: "Save", saveNote: "Save Note", cancel: "Cancel", medicationNamePlaceholder: "Medication name", dosagePlaceholder: "Dosage (e.g., 500mg)", notePlaceholder: "Enter clinical observation...", alertsOn: "Alerts On", alertsOff: "Alerts Off", systemStatus: "System Status: Connected", patientLabel: "PATIENT", conditionLabel: "CONDITION", ageLabel: "AGE", ageUnit: "Years", caregiver: "Caregiver" },
  es: { connected: "CINTURÓN CONECTADO", disconnected: "CINTURÓN DESCONECTADO", sinceMeal: "Desde la comida", sinceUrine: "Desde la orina", sinceBowel: "Desde la deposición", alerts: "Alertas", medications: "Medicamentos", notes: "Notas Clínicas", logout: "Salir", monitoring: "Monitoreo en vivo", waiting: "Esperando datos...", callPatient: "Llamar", message: "Mensaje", activeAlerts: "Alertas activas", history: "Historial", acknowledge: "Reconocer", noAlerts: "Sin alertas activas", addMedication: "Agregar Medicamento", addNote: "Agregar Nota Clínica", save: "Guardar", saveNote: "Guardar Nota", cancel: "Cancelar", medicationNamePlaceholder: "Nombre del medicamento", dosagePlaceholder: "Dosis (ej. 500mg)", notePlaceholder: "Ingrese observación clínica...", alertsOn: "Alertas Activadas", alertsOff: "Alertas Desactivadas", systemStatus: "Estado del sistema: Conectado", patientLabel: "PACIENTE", conditionLabel: "CONDICIÓN", ageLabel: "EDAD", ageUnit: "Años", caregiver: "Cuidador" },
  fr: { connected: "CEINTURE CONNECTÉE", disconnected: "CEINTURE DÉCONNECTÉE", sinceMeal: "Depuis le repas", sinceUrine: "Depuis l'urine", sinceBowel: "Depuis la selle", alerts: "Alertes", medications: "Médicaments", notes: "Notes Cliniques", logout: "Sortir", monitoring: "Surveillance en direct", waiting: "En attente...", callPatient: "Appeler", message: "Message", activeAlerts: "Alertes actives", history: "Historique", acknowledge: "Reconnaître", noAlerts: "Aucune alerte active", addMedication: "Ajouter un Médicament", addNote: "Ajouter une Note Clinique", save: "Enregistrer", saveNote: "Enregistrer la Note", cancel: "Annuler", medicationNamePlaceholder: "Nom du médicament", dosagePlaceholder: "Dosage (ex. 500mg)", notePlaceholder: "Entrez l'observation clinique...", alertsOn: "Alertes Activées", alertsOff: "Alertes Désactivées", systemStatus: "Statut système: Connecté", patientLabel: "PATIENT", conditionLabel: "CONDITION", ageLabel: "ÂGE", ageUnit: "Ans", caregiver: "Soignant" },
  de: { connected: "GÜRTEL VERBUNDEN", disconnected: "GÜRTEL GETRENNT", sinceMeal: "Seit letzter Mahlzeit", sinceUrine: "Seit letztem Urin", sinceBowel: "Seit letztem Stuhlgang", alerts: "Warnungen", medications: "Medikamente", notes: "Klinische Notizen", logout: "Abmelden", monitoring: "Echtzeit-Überwachung aktiv", waiting: "Warte auf Signal...", callPatient: "Patient anrufen", message: "Nachricht", activeAlerts: "Aktive Warnungen", history: "Verlauf", acknowledge: "Bestätigen", noAlerts: "Keine aktiven Warnungen", addMedication: "Medikament hinzufügen", addNote: "Klinische Notiz hinzufügen", save: "Speichern", saveNote: "Notiz speichern", cancel: "Abbrechen", medicationNamePlaceholder: "Medikamentenname", dosagePlaceholder: "Dosierung (z.B. 500mg)", notePlaceholder: "Klinische Beobachtung eingeben...", alertsOn: "Alarme An", alertsOff: "Alarme Aus", systemStatus: "Systemstatus: Verbunden", patientLabel: "PATIENT", conditionLabel: "ZUSTAND", ageLabel: "ALTER", ageUnit: "Jahre", caregiver: "Pflegeperson" },
  zh: { connected: "腰带已连接", disconnected: "腰带已断开", sinceMeal: "进食以来", sinceUrine: "排尿以来", sinceBowel: "排便以来", alerts: "警报", medications: "药物", notes: "临床笔记", logout: "登出", monitoring: "实时监控中", waiting: "等待数据...", callPatient: "呼叫患者", message: "信息", activeAlerts: "活跃警报", history: "历史", acknowledge: "确认", noAlerts: "无活跃警报", addMedication: "添加药物", addNote: "添加临床笔记", save: "保存", saveNote: "保存笔记", cancel: "取消", medicationNamePlaceholder: "药物名称", dosagePlaceholder: "剂量（例如500mg）", notePlaceholder: "输入临床观察...", alertsOn: "警报开启", alertsOff: "警报关闭", systemStatus: "系统状态：已连接", patientLabel: "患者", conditionLabel: "病情", ageLabel: "年龄", ageUnit: "岁", caregiver: "护理人员" },
  ar: { connected: "الحزام متصل", disconnected: "الحزام مقطوع", sinceMeal: "منذ الوجبة", sinceUrine: "منذ التبول", sinceBowel: "منذ التبرز", alerts: "تنبيهات", medications: "أدوية", notes: "ملاحظات سريرية", logout: "خروج", monitoring: "مراقبة حية", waiting: "في الانتظار...", callPatient: "اتصال بالمريض", message: "رسالة", activeAlerts: "تنبيهات نشطة", history: "السجل", acknowledge: "تأكيد", noAlerts: "لا توجد تنبيهات نشطة", addMedication: "إضافة دواء", addNote: "إضافة ملاحظة سريرية", save: "حفظ", saveNote: "حفظ الملاحظة", cancel: "إلغاء", medicationNamePlaceholder: "اسم الدواء", dosagePlaceholder: "الجرعة (مثال: 500mg)", notePlaceholder: "أدخل الملاحظة السريرية...", alertsOn: "التنبيهات مفعلة", alertsOff: "التنبيهات معطلة", systemStatus: "حالة النظام: متصل", patientLabel: "المريض", conditionLabel: "الحالة", ageLabel: "العمر", ageUnit: "سنة", caregiver: "مقدم الرعاية" },
  ja: { connected: "ベルト接続中", disconnected: "ベルト切断", sinceMeal: "食事から", sinceUrine: "排尿から", sinceBowel: "排便から", alerts: "アラート", medications: "服薬", notes: "臨床メモ", logout: "終了", monitoring: "ライブ監視中", waiting: "待機中...", callPatient: "患者に電話", message: "メッセージ", activeAlerts: "アクティブアラート", history: "履歴", acknowledge: "確認", noAlerts: "アクティブなアラートなし", addMedication: "薬を追加", addNote: "臨床メモを追加", save: "保存", saveNote: "メモを保存", cancel: "キャンセル", medicationNamePlaceholder: "薬の名前", dosagePlaceholder: "用量（例: 500mg）", notePlaceholder: "臨床観察を入力...", alertsOn: "アラートオン", alertsOff: "アラートオフ", systemStatus: "システム状態：接続済み", patientLabel: "患者", conditionLabel: "病状", ageLabel: "年齢", ageUnit: "歳", caregiver: "介護者" },
  ru: { connected: "РЕМЕНЬ ПОДКЛЮЧЕН", disconnected: "РЕМЕНЬ ОТКЛЮЧЕН", sinceMeal: "С последнего приёма пищи", sinceUrine: "С последнего мочеиспускания", sinceBowel: "С последней дефекации", alerts: "Оповещения", medications: "Лекарства", notes: "Клинические заметки", logout: "Выйти", monitoring: "Мониторинг активен", waiting: "Ожидание сигнала...", callPatient: "Позвонить пациенту", message: "Сообщение", activeAlerts: "Активные оповещения", history: "История", acknowledge: "Подтвердить", noAlerts: "Нет активных оповещений", addMedication: "Добавить лекарство", addNote: "Добавить клиническую заметку", save: "Сохранить", saveNote: "Сохранить заметку", cancel: "Отмена", medicationNamePlaceholder: "Название лекарства", dosagePlaceholder: "Дозировка (напр. 500мг)", notePlaceholder: "Введите клиническое наблюдение...", alertsOn: "Оповещения вкл.", alertsOff: "Оповещения выкл.", systemStatus: "Статус системы: Подключено", patientLabel: "ПАЦИЕНТ", conditionLabel: "ДИАГНОЗ", ageLabel: "ВОЗРАСТ", ageUnit: "лет", caregiver: "Сиделка" },
  pt: { connected: "CINTO CONECTADO", disconnected: "CINTO DESCONECTADO", sinceMeal: "Desde a última refeição", sinceUrine: "Desde a última urina", sinceBowel: "Desde a última evacuação", alerts: "Alertas", medications: "Medicamentos", notes: "Notas Clínicas", logout: "Sair", monitoring: "Monitoramento ativo", waiting: "Aguardando sinal...", callPatient: "Ligar para o paciente", message: "Mensagem", activeAlerts: "Alertas ativos", history: "Histórico", acknowledge: "Reconhecer", noAlerts: "Sem alertas ativos", addMedication: "Adicionar Medicamento", addNote: "Adicionar Nota Clínica", save: "Salvar", saveNote: "Salvar Nota", cancel: "Cancelar", medicationNamePlaceholder: "Nome do medicamento", dosagePlaceholder: "Dosagem (ex. 500mg)", notePlaceholder: "Insira observação clínica...", alertsOn: "Alertas Ativados", alertsOff: "Alertas Desativados", systemStatus: "Status do sistema: Conectado", patientLabel: "PACIENTE", conditionLabel: "CONDIÇÃO", ageLabel: "IDADE", ageUnit: "Anos", caregiver: "Cuidador" },
  ne: { connected: "बेल्ट जडान भयो", disconnected: "बेल्ट विच्छेद भयो", sinceMeal: "खाना पछि", sinceUrine: "पिसाब पछि", sinceBowel: "शौच पछि", alerts: "अलर्ट", medications: "औषधिहरू", notes: "क्लिनिकल नोटहरू", logout: "लग आउट", monitoring: "निगरानी भइरहेको छ", waiting: "प्रतीक्षा गर्दै...", callPatient: "कल गर्नुहोस्", message: "सन्देश", activeAlerts: "सक्रिय अलर्ट", history: "इतिहास", acknowledge: "स्वीकार गर्नुहोस्", noAlerts: "कुनै सक्रिय अलर्ट छैन", addMedication: "औषधि थप्नुहोस्", addNote: "क्लिनिकल नोट थप्नुहोस्", save: "सुरक्षित गर्नुहोस्", saveNote: "नोट सुरक्षित गर्नुहोस्", cancel: "रद्द गर्नुहोस्", medicationNamePlaceholder: "औषधिको नाम", dosagePlaceholder: "मात्रा (जस्तै 500mg)", notePlaceholder: "क्लिनिकल अवलोकन लेख्नुहोस्...", alertsOn: "अलर्ट सक्रिय", alertsOff: "अलर्ट निष्क्रिय", systemStatus: "प्रणाली स्थिति: जडित", patientLabel: "बिरामी", conditionLabel: "अवस्था", ageLabel: "उमेर", ageUnit: "वर्ष", caregiver: "हेरचाहकर्ता" },
  hi: { connected: "बेल्ट जुड़ा हुआ है", disconnected: "बेल्ट डिस्कनेक्ट हो गया", sinceMeal: "पिछले भोजन के बाद से", sinceUrine: "पिछले पेशाब के बाद से", sinceBowel: "पिछली शौच के बाद से", alerts: "अलर्ट", medications: "दवाइयाँ", notes: "क्लिनिकल नोट्स", logout: "लॉग आउट", monitoring: "निगरानी सक्रिय है", waiting: "सेंसर डेटा का इंतज़ार...", callPatient: "मरीज को कॉल करें", message: "संदेश", activeAlerts: "सक्रिय अलर्ट", history: "इतिहास", acknowledge: "स्वीकार करें", noAlerts: "कोई सक्रिय अलर्ट नहीं", addMedication: "दवाई जोड़ें", addNote: "क्लिनिकल नोट जोड़ें", save: "सहेजें", saveNote: "नोट सहेजें", cancel: "रद्द करें", medicationNamePlaceholder: "दवाई का नाम", dosagePlaceholder: "खुराक (जैसे 500mg)", notePlaceholder: "क्लिनिकल अवलोकन दर्ज करें...", alertsOn: "अलर्ट चालू", alertsOff: "अलर्ट बंद", systemStatus: "सिस्टम स्थिति: जुड़ा हुआ", patientLabel: "मरीज़", conditionLabel: "स्थिति", ageLabel: "उम्र", ageUnit: "वर्ष", caregiver: "देखभालकर्ता" },
  mr: { connected: "बेल्ट जोडला गेला आहे", disconnected: "बेल्ट डिस्कनेक्ट झाला", sinceMeal: "जेवणापासून", sinceUrine: "लघवीपासून", sinceBowel: "शौचापासून", alerts: "अलर्ट", medications: "औषधे", notes: "क्लिनिकल नोट्स", logout: "लॉग आउट", monitoring: "देखरेख सुरू आहे", waiting: "सेन्सर डेटाची प्रतीक्षा...", callPatient: "कॉल करा", message: "संदेश", activeAlerts: "सक्रिय अलर्ट", history: "इतिहास", acknowledge: "मान्य करा", noAlerts: "कोणतेही सक्रिय अलर्ट नाहीत", addMedication: "औषध जोडा", addNote: "क्लिनिकल नोट जोडा", save: "जतन करा", saveNote: "नोट जतन करा", cancel: "रद्द करा", medicationNamePlaceholder: "औषधाचे नाव", dosagePlaceholder: "मात्रा (उदा. 500mg)", notePlaceholder: "क्लिनिकल निरीक्षण नोंदवा...", alertsOn: "अलर्ट चालू", alertsOff: "अलर्ट बंद", systemStatus: "सिस्टम स्थिती: जोडलेले", patientLabel: "रुग्ण", conditionLabel: "स्थिती", ageLabel: "वय", ageUnit: "वर्षे", caregiver: "काळजीवाहक" },
  ta: { connected: "பெல்ட் இணைக்கப்பட்டது", disconnected: "பெல்ட் துண்டிக்கப்பட்டது", sinceMeal: "உணவுக்குப் பிறகு", sinceUrine: "சிறுநீருக்குப் பிறகு", sinceBowel: "மலம் கழித்த பிறகு", alerts: "எச்சரிக்கைகள்", medications: "மருந்துகள்", notes: "மருத்துவ குறிப்புகள்", logout: "வெளியேறு", monitoring: "கண்காணிக்கிறது", waiting: "காத்திருக்கிறது...", callPatient: "அழைப்பு", message: "செய்தி", activeAlerts: "செயலில் உள்ள எச்சரிக்கைகள்", history: "வரலாறு", acknowledge: "ஒப்புக்கொள்", noAlerts: "செயலில் உள்ள எச்சரிக்கை இல்லை", addMedication: "மருந்து சேர்க்கவும்", addNote: "மருத்துவ குறிப்பு சேர்க்கவும்", save: "சேமிக்கவும்", saveNote: "குறிப்பு சேமிக்கவும்", cancel: "ரத்து செய்யவும்", medicationNamePlaceholder: "மருந்தின் பெயர்", dosagePlaceholder: "அளவு (எ.கா. 500mg)", notePlaceholder: "மருத்துவ கவனிப்பை உள்ளிடவும்...", alertsOn: "எச்சரிக்கை இயக்கம்", alertsOff: "எச்சரிக்கை நிறுத்தம்", systemStatus: "கணினி நிலை: இணைக்கப்பட்டது", patientLabel: "நோயாளி", conditionLabel: "நிலை", ageLabel: "வயது", ageUnit: "வயது", caregiver: "பராமரிப்பாளர்" },
  te: { connected: "బెల్ట్ కనెక్ట్ అయింది", disconnected: "బెల్ట్ డిస్కనెక్ట్ అయింది", sinceMeal: "చివరి భోజనం నుండి", sinceUrine: "చివరి మూత్రవిసర్జన నుండి", sinceBowel: "చివరి మలవిసర్జన నుండి", alerts: "అలర్ట్లు", medications: "మందులు", notes: "క్లినికల్ నోట్స్", logout: "లాగ్ అవుట్", monitoring: "పర్యవేక్షణ చురుకుగా ఉంది", waiting: "సిగ్నల్ కోసం వేచి ఉంది...", callPatient: "రోగికి కాల్ చేయండి", message: "సందేశం", activeAlerts: "చురుకైన అలర్ట్లు", history: "చరిత్ర", acknowledge: "అంగీకరించు", noAlerts: "చురుకైన అలర్ట్లు లేవు", addMedication: "మందు జోడించు", addNote: "క్లినికల్ నోట్ జోడించు", save: "సేవ్ చేయి", saveNote: "నోట్ సేవ్ చేయి", cancel: "రద్దు చేయి", medicationNamePlaceholder: "మందు పేరు", dosagePlaceholder: "మోతాదు (ఉదా. 500mg)", notePlaceholder: "క్లినికల్ పరిశీలన నమోదు చేయండి...", alertsOn: "అలర్ట్లు ఆన్", alertsOff: "అలర్ట్లు ఆఫ్", systemStatus: "సిస్టమ్ స్థితి: కనెక్ట్ అయింది", patientLabel: "రోగి", conditionLabel: "పరిస్థితి", ageLabel: "వయసు", ageUnit: "సంవత్సరాలు", caregiver: "సంరక్షకుడు" },
  kn: { connected: "ಬೆಲ್ಟ್ ಸಂಪರ್ಕಗೊಂಡಿದೆ", disconnected: "ಬೆಲ್ಟ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ", sinceMeal: "ಕೊನೆಯ ಊಟದ ನಂತರ", sinceUrine: "ಕೊನೆಯ ಮೂತ್ರ ವಿಸರ್ಜನ ನಂತರ", sinceBowel: "ಕೊನೆಯ ಮಲ ವಿಸರ್ಜನೆ ನಂತರ", alerts: "ಎಚ್ಚರಿಕೆಗಳು", medications: "ಔಷಧಿಗಳು", notes: "ಕ್ಲಿನಿಕಲ್ ಟಿಪ್ಪಣಿಗಳು", logout: "ಲಾಗ್ ಔಟ್", monitoring: "ಮೇಲ್ವಿಚಾರಣೆ ಸಕ್ರಿಯ", waiting: "ಸಿಗ್ನಲ್ ಗಾಗಿ ಕಾಯುತ್ತಿದೆ...", callPatient: "ರೋಗಿಗೆ ಕರೆ ಮಾಡಿ", message: "ಸಂದೇಶ", activeAlerts: "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು", history: "ಇತಿಹಾಸ", acknowledge: "ಒಪ್ಪಿಕೊಳ್ಳಿ", noAlerts: "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ", addMedication: "ಔಷಧಿ ಸೇರಿಸಿ", addNote: "ಕ್ಲಿನಿಕಲ್ ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ", save: "ಉಳಿಸಿ", saveNote: "ಟಿಪ್ಪಣಿ ಉಳಿಸಿ", cancel: "ರದ್ದುಮಾಡಿ", medicationNamePlaceholder: "ಔಷಧಿ ಹೆಸರು", dosagePlaceholder: "ಪ್ರಮಾಣ (ಉದಾ. 500mg)", notePlaceholder: "ಕ್ಲಿನಿಕಲ್ ಅವಲೋಕನ ನಮೂದಿಸಿ...", alertsOn: "ಎಚ್ಚರಿಕೆಗಳು ಆನ್", alertsOff: "ಎಚ್ಚರಿಕೆಗಳು ಆಫ್", systemStatus: "ಸಿಸ್ಟಮ್ ಸ್ಥಿತಿ: ಸಂಪರ್ಕಿತ", patientLabel: "ರೋಗಿ", conditionLabel: "ಸ್ಥಿತಿ", ageLabel: "ವಯಸ್ಸು", ageUnit: "ವರ್ಷಗಳು", caregiver: "ಆರೈಕೆದಾರ" },
  ml: { connected: "ബെൽറ്റ് ബന്ധിപ്പിച്ചു", disconnected: "ബെൽറ്റ് വിച്ഛേദിച്ചു", sinceMeal: "അവസാന ഭക്ഷണത്തിന് ശേഷം", sinceUrine: "അവസാന മൂത്രവിസർജ്ജനത്തിന് ശേഷം", sinceBowel: "അവസാന മലവിസർജ്ജനത്തിന് ശേഷം", alerts: "അലേർട്ടുകൾ", medications: "മരുന്നുകൾ", notes: "ക്ലിനിക്കൽ കുറിപ്പുകൾ", logout: "ലോഗ് ഔട്ട്", monitoring: "നിരീക്ഷണം സജീവം", waiting: "സിഗ്നലിനായി കാത്തിരിക്കുന്നു...", callPatient: "രോഗിയെ വിളിക്കുക", message: "സന്ദേശം", activeAlerts: "സജീവ അലേർട്ടുകൾ", history: "ചരിത്രം", acknowledge: "സ്വീകരിക്കുക", noAlerts: "സജീവ അലേർട്ടുകൾ ഇല്ല", addMedication: "മരുന്ന് ചേർക്കുക", addNote: "ക്ലിനിക്കൽ കുറിപ്പ് ചേർക്കുക", save: "സേവ് ചെയ്യുക", saveNote: "കുറിപ്പ് സേവ് ചെയ്യുക", cancel: "റദ്ദാക്കുക", medicationNamePlaceholder: "മരുന്നിന്റെ പേര്", dosagePlaceholder: "അളവ് (ഉദാ. 500mg)", notePlaceholder: "ക്ലിനിക്കൽ നിരീക്ഷണം നൽകുക...", alertsOn: "അലേർട്ടുകൾ ഓണ്‍", alertsOff: "അലേർട്ടുകൾ ഓഫ്", systemStatus: "സിസ്റ്റം നില: ബന്ധിപ്പിച്ചു", patientLabel: "രോഗി", conditionLabel: "അവസ്ഥ", ageLabel: "പ്രായം", ageUnit: "വർഷം", caregiver: "പരിചരണക്കാരൻ" },
  gu: { connected: "બેલ્ટ જોડાયેલ છે", disconnected: "બેલ્ટ ડિસ્કનેક્ટ થયો", sinceMeal: "છેલ્લા ભોજન પછી", sinceUrine: "છેલ્લા પેશાબ પછી", sinceBowel: "છેલ્લા મળ ત્યાગ પછી", alerts: "અલર્ટ્સ", medications: "દવાઓ", notes: "ક્લિનિકલ નોંધો", logout: "લૉગ આઉટ", monitoring: "નિરીક્ષણ સક્રિય", waiting: "સિગ્નલની રાહ...", callPatient: "દર્દીને કૉલ કરો", message: "સંદેશ", activeAlerts: "સક્રિય અલર્ટ", history: "ઇતિહાસ", acknowledge: "સ્વીકારો", noAlerts: "કોઈ સક્રિય અલર્ટ નથી", addMedication: "દવા ઉમેરો", addNote: "ક્લિનિકલ નોંધ ઉમેરો", save: "સાચવો", saveNote: "નોંધ સાચવો", cancel: "રદ કરો", medicationNamePlaceholder: "દવાનું નામ", dosagePlaceholder: "માત્રા (દા.ત. 500mg)", notePlaceholder: "ક્લિનિકલ અવલોકન દાખલ કરો...", alertsOn: "અલર્ટ ચાલુ", alertsOff: "અલર્ટ બંધ", systemStatus: "સિસ્ટમ સ્થિતિ: જોડાયેલ", patientLabel: "દર્દી", conditionLabel: "સ્થિતિ", ageLabel: "ઉંમર", ageUnit: "વર્ષ", caregiver: "સંભાળ રાખનાર" },
  pa: { connected: "ਬੈਲਟ ਜੁੜੀ ਹੋਈ ਹੈ", disconnected: "ਬੈਲਟ ਡਿਸਕਨੈਕਟ ਹੋ ਗਈ", sinceMeal: "ਆਖਰੀ ਭੋਜਨ ਤੋਂ ਬਾਅਦ", sinceUrine: "ਆਖਰੀ ਪਿਸ਼ਾਬ ਤੋਂ ਬਾਅਦ", sinceBowel: "ਆਖਰੀ ਟੱਟੀ ਤੋਂ ਬਾਅਦ", alerts: "ਅਲਰਟ", medications: "ਦਵਾਈਆਂ", notes: "ਕਲੀਨਿਕਲ ਨੋਟਸ", logout: "ਲੌਗ ਆਊਟ", monitoring: "ਨਿਗਰਾਨੀ ਸਰਗਰਮ", waiting: "ਸਿਗਨਲ ਦੀ ਉਡੀਕ...", callPatient: "ਮਰੀਜ਼ ਨੂੰ ਕਾਲ ਕਰੋ", message: "ਸੁਨੇਹਾ", activeAlerts: "ਸਰਗਰਮ ਅਲਰਟ", history: "ਇਤਿਹਾਸ", acknowledge: "ਸਵੀਕਾਰ ਕਰੋ", noAlerts: "ਕੋਈ ਸਰਗਰਮ ਅਲਰਟ ਨਹੀਂ", addMedication: "ਦਵਾਈ ਜੋੜੋ", addNote: "ਕਲੀਨਿਕਲ ਨੋਟ ਜੋੜੋ", save: "ਸੁਰੱਖਿਅਤ ਕਰੋ", saveNote: "ਨੋਟ ਸੁਰੱਖਿਅਤ ਕਰੋ", cancel: "ਰੱਦ ਕਰੋ", medicationNamePlaceholder: "ਦਵਾਈ ਦਾ ਨਾਮ", dosagePlaceholder: "ਖੁਰਾਕ (ਜਿਵੇਂ 500mg)", notePlaceholder: "ਕਲੀਨਿਕਲ ਨਿਰੀਖਣ ਦਰਜ ਕਰੋ...", alertsOn: "ਅਲਰਟ ਚਾਲੂ", alertsOff: "ਅਲਰਟ ਬੰਦ", systemStatus: "ਸਿਸਟਮ ਸਥਿਤੀ: ਜੁੜਿਆ", patientLabel: "ਮਰੀਜ਼", conditionLabel: "ਸਥਿਤੀ", ageLabel: "ਉਮਰ", ageUnit: "ਸਾਲ", caregiver: "ਦੇਖਭਾਲ ਕਰਨ ਵਾਲਾ" },
  bn: { connected: "বেল্ট সংযুক্ত", disconnected: "বেল্ট বিচ্ছিন্ন", sinceMeal: "খাবারের পর", sinceUrine: "প্রস্রাবের পর", sinceBowel: "মলত্যাগের পর", alerts: "অ্যালার্ট", medications: "ওষুধ", notes: "ক্লিনিক্যাল নোট", logout: "লগ আউট", monitoring: "পর্যবেক্ষণ করছে", waiting: "সংকেতের জন্য অপেক্ষা...", callPatient: "রোগীকে কল করুন", message: "বার্তা", activeAlerts: "সক্রিয় অ্যালার্ট", history: "ইতিহাস", acknowledge: "স্বীকার করুন", noAlerts: "কোনো সক্রিয় অ্যালার্ট নেই", addMedication: "ওষুধ যোগ করুন", addNote: "ক্লিনিক্যাল নোট যোগ করুন", save: "সংরক্ষণ করুন", saveNote: "নোট সংরক্ষণ করুন", cancel: "বাতিল করুন", medicationNamePlaceholder: "ওষুধের নাম", dosagePlaceholder: "ডোজ (যেমন 500mg)", notePlaceholder: "ক্লিনিক্যাল পর্যবেক্ষণ লিখুন...", alertsOn: "অ্যালার্ট চালু", alertsOff: "অ্যালার্ট বন্ধ", systemStatus: "সিস্টেম অবস্থা: সংযুক্ত", patientLabel: "রোগী", conditionLabel: "অবস্থা", ageLabel: "বয়স", ageUnit: "বছর", caregiver: "পরিচর্যাকারী" },
  or: { connected: "ବେଲ୍ଟ ସଂଯୁକ୍ତ ଅଛି", disconnected: "ବେଲ୍ଟ ବିଚ୍ଛିନ୍ନ ହୋଇଛି", sinceMeal: "ଶେଷ ଭୋଜନ ପରଠାରୁ", sinceUrine: "ଶେଷ ପରିସ୍ରା ପରଠାରୁ", sinceBowel: "ଶେଷ ମଳତ୍ୟାଗ ପରଠାରୁ", alerts: "ସତର୍କତା", medications: "ଓଷଧ", notes: "କ୍ଲିନିକାଲ୍ ନୋଟ୍", logout: "ଲଗ୍ ଆଉଟ୍", monitoring: "ନଜର ରଖାଯାଉଛି", waiting: "ସଙ୍କେତ ପ୍ରତୀକ୍ଷା...", callPatient: "ରୋଗୀଙ୍କୁ ଫୋନ କରନ୍ତୁ", message: "ବାର୍ତ୍ତା", activeAlerts: "ସକ୍ରିୟ ସତର୍କତା", history: "ଇତିହାସ", acknowledge: "ସ୍ୱୀକାର କରନ୍ତୁ", noAlerts: "କୌଣସି ସକ୍ରିୟ ସତର୍କତା ନାହିଁ", addMedication: "ଓଷଧ ଯୋଡ଼ନ୍ତୁ", addNote: "କ୍ଲିନିକାଲ୍ ନୋଟ ଯୋଡ଼ନ୍ତୁ", save: "ସଞ୍ଚୟ କରନ୍ତୁ", saveNote: "ନୋଟ ସଞ୍ଚୟ କରନ୍ତୁ", cancel: "ବାତିଲ କରନ୍ତୁ", medicationNamePlaceholder: "ଓଷଧର ନାମ", dosagePlaceholder: "ମାତ୍ରା (ଯଥା 500mg)", notePlaceholder: "କ୍ଲିନିକାଲ୍ ପର୍ଯ୍ୟବେକ୍ଷଣ ଲେଖନ୍ତୁ...", alertsOn: "ସତର୍କତା ଚାଲୁ", alertsOff: "ସତର୍କତା ବନ୍ଦ", systemStatus: "ସିଷ୍ଟମ ସ୍ଥିତି: ସଂଯୁକ୍ତ", patientLabel: "ରୋଗୀ", conditionLabel: "ଅବସ୍ଥା", ageLabel: "ବୟସ", ageUnit: "ବର୍ଷ", caregiver: "ଯତ୍ନକାରୀ" },
  as: { connected: "বেল্ট সংলগ্ন হৈছে", disconnected: "বেল্ট বিছিন্ন হৈছে", sinceMeal: "শেষ আহাৰৰ পৰা", sinceUrine: "শেষ প্ৰস্ৰাৱৰ পৰা", sinceBowel: "শেষ শৌচৰ পৰা", alerts: "সতৰ্কবাণী", medications: "ঔষধ", notes: "ক্লিনিকাল টোকা", logout: "লগ আউট", monitoring: "নিৰীক্ষণ সক্ৰিয়", waiting: "সংকেতৰ বাবে অপেক্ষা...", callPatient: "ৰোগীক ফোন কৰক", message: "বাৰ্তা", activeAlerts: "সক্ৰিয় সতৰ্কবাণী", history: "ইতিহাস", acknowledge: "স্বীকাৰ কৰক", noAlerts: "কোনো সক্ৰিয় সতৰ্কবাণী নাই", addMedication: "ঔষধ যোগ কৰক", addNote: "ক্লিনিকাল টোকা যোগ কৰক", save: "সংৰক্ষণ কৰক", saveNote: "টোকা সংৰক্ষণ কৰক", cancel: "বাতিল কৰক", medicationNamePlaceholder: "ঔষধৰ নাম", dosagePlaceholder: "মাত্ৰা (যেনে 500mg)", notePlaceholder: "ক্লিনিকাল পৰ্যবেক্ষণ লিখক...", alertsOn: "সতৰ্কবাণী চালু", alertsOff: "সতৰ্কবাণী বন্ধ", systemStatus: "ছিষ্টেম অৱস্থা: সংলগ্ন", patientLabel: "ৰোগী", conditionLabel: "অৱস্থা", ageLabel: "বয়স", ageUnit: "বছৰ", caregiver: "পৰিচৰ্যাকাৰী" },
  ur: { connected: "بیلٹ منسلک ہے", disconnected: "بیلٹ منقطع ہو گیا", sinceMeal: "آخری کھانے کے بعد", sinceUrine: "آخری پیشاب کے بعد", sinceBowel: "آخری فضلے کے بعد", alerts: "الرٹس", medications: "ادویات", notes: "کلینیکل نوٹس", logout: "لاگ آؤٹ", monitoring: "نگرانی فعال ہے", waiting: "سگنل کا انتظار...", callPatient: "مریض کو کال کریں", message: "پیغام", activeAlerts: "فعال الرٹس", history: "تاریخ", acknowledge: "تصدیق کریں", noAlerts: "کوئی فعال الرٹ نہیں", addMedication: "دوا شامل کریں", addNote: "کلینیکل نوٹ شامل کریں", save: "محفوظ کریں", saveNote: "نوٹ محفوظ کریں", cancel: "منسوخ کریں", medicationNamePlaceholder: "دوا کا نام", dosagePlaceholder: "خوراک (مثلاً 500mg)", notePlaceholder: "طبی مشاہدہ درج کریں...", alertsOn: "الرٹس آن", alertsOff: "الرٹس آف", systemStatus: "نظام کی حالت: منسلک", patientLabel: "مریض", conditionLabel: "حالت", ageLabel: "عمر", ageUnit: "سال", caregiver: "دیکھ بھال کرنے والا" },
  mai: { connected: "बेल्ट जुड़ल अछि", disconnected: "बेल्ट विच्छेदित अछि", sinceMeal: "अंतिम भोजन सँ", sinceUrine: "अंतिम पिसाब सँ", sinceBowel: "अंतिम शौच सँ", alerts: "अलर्ट", medications: "दवाइयाँ", notes: "क्लिनिकल नोट्स", logout: "लग आउट", monitoring: "निगरानी सक्रिय अछि", waiting: "सिग्नलक प्रतीक्षा...", callPatient: "रोगीकें फोन करू", message: "संदेश", activeAlerts: "सक्रिय अलर्ट", history: "इतिहास", acknowledge: "स्वीकार करू", noAlerts: "कोनो सक्रिय अलर्ट नहि", addMedication: "दवाइ जोड़ू", addNote: "क्लिनिकल नोट जोड़ू", save: "सहेजू", saveNote: "नोट सहेजू", cancel: "रद्द करू", medicationNamePlaceholder: "दवाइक नाम", dosagePlaceholder: "खुराक (जेना 500mg)", notePlaceholder: "क्लिनिकल अवलोकन दर्ज करू...", alertsOn: "अलर्ट चालू", alertsOff: "अलर्ट बंद", systemStatus: "सिस्टम स्थिति: जुड़ल", patientLabel: "रोगी", conditionLabel: "स्थिति", ageLabel: "उमर", ageUnit: "वर्ष", caregiver: "देखभालकर्ता" },
  sa: { connected: "पट्टी संलग्ना अस्ति", disconnected: "पट्टी विच्छिन्ना अस्ति", sinceMeal: "अन्तिम-भोजनात्", sinceUrine: "अन्तिम-मूत्रविसर्जनात्", sinceBowel: "अन्तिम-मलविसर्जनात्", alerts: "सचेतकाः", medications: "औषधानि", notes: "क्लिनिकल टिप्पणी", logout: "निर्गमनम्", monitoring: "निरीक्षणम् सक्रियम्", waiting: "संकेतस्य प्रतीक्षा...", callPatient: "रुग्णं आह्वयतु", message: "सन्देशः", activeAlerts: "सक्रिय-सचेतकाः", history: "इतिहासः", acknowledge: "स्वीकरोतु", noAlerts: "न सक्रिय-सचेतकाः", addMedication: "औषधं योजयतु", addNote: "टिप्पणीं योजयतु", save: "संरक्षयतु", saveNote: "टिप्पणीं संरक्षयतु", cancel: "निरस्यतु", medicationNamePlaceholder: "औषधस्य नाम", dosagePlaceholder: "मात्रा (यथा 500mg)", notePlaceholder: "क्लिनिकल निरीक्षणम् लिखतु...", alertsOn: "सचेतकाः चालू", alertsOff: "सचेतकाः बंद", systemStatus: "सिस्टम स्थितिः: संलग्नम्", patientLabel: "रुग्णः", conditionLabel: "स्थितिः", ageLabel: "वयः", ageUnit: "वर्षाणि", caregiver: "परिचारकः" },
  kok: { connected: "बेल्ट जोडिल्लो आसा", disconnected: "बेल्ट तोडिल्लो आसा", sinceMeal: "निमाणें जेवण जाल्या उपरांत", sinceUrine: "निमाणी लघवी जाल्या उपरांत", sinceBowel: "निमाणें शौच जाल्या उपरांत", alerts: "शिटकावणी", medications: "वखदां", notes: "क्लिनिकल नोट्स", logout: "लॉग आउट", monitoring: "देखरेख चालू आसा", waiting: "सिग्नलची वाट...", callPatient: "दुयेंत्याक फोन करात", message: "संदेश", activeAlerts: "सक्रिय शिटकावणी", history: "इतिहास", acknowledge: "मान्य करात", noAlerts: "कसलीच सक्रिय शिटकावणी ना", addMedication: "वखद घालात", addNote: "क्लिनिकल नोट घालात", save: "सांबाळात", saveNote: "नोट सांबाळात", cancel: "रद्द करात", medicationNamePlaceholder: "वखदाचें नाव", dosagePlaceholder: "मात्रा (उदा. 500mg)", notePlaceholder: "क्लिनिकल निरीक्षण बरयात...", alertsOn: "शिटकावणी चालू", alertsOff: "शिटकावणी बंद", systemStatus: "सिस्टम स्थिती: जोडिल्लो", patientLabel: "दुयेंतो", conditionLabel: "स्थिती", ageLabel: "वर्स", ageUnit: "वर्सां", caregiver: "काळजीवाहक" },
  doi: { connected: "बेल्ट जुड़ी दी ऐ", disconnected: "बेल्ट कटी दी ऐ", sinceMeal: "खादा खादे शा बाद", sinceUrine: "पेशाब शा बाद", sinceBowel: "शौच शा बाद", alerts: "अलर्ट", medications: "दवाइयां", notes: "क्लिनिकल नोट्स", logout: "लाग आउट", monitoring: "निगरानी चालू ऐ", waiting: "सिग्नल दा इंतजार...", callPatient: "मरीज गी फोन करो", message: "संदेश", activeAlerts: "सक्रिय अलर्ट", history: "इतिहास", acknowledge: "स्वीकार करो", noAlerts: "कोई सक्रिय अलर्ट नी", addMedication: "दवाई जोड़ो", addNote: "क्लिनिकल नोट जोड़ो", save: "सुरक्षित करो", saveNote: "नोट सुरक्षित करो", cancel: "रद्द करो", medicationNamePlaceholder: "दवाई दा नाम", dosagePlaceholder: "खुराक (जियां 500mg)", notePlaceholder: "क्लिनिकल निरीखण दर्ज करो...", alertsOn: "अलर्ट चालू", alertsOff: "अलर्ट बंद", systemStatus: "सिस्टम स्थिति: जुड़ी दी ऐ", patientLabel: "मरीज", conditionLabel: "हालत", ageLabel: "उमर", ageUnit: "साल", caregiver: "देखभालकर्ता" },
  mni: { connected: "বেল্ট শমজিনখ্রে", disconnected: "বেল্ট থাদোকখ্রে", sinceMeal: "অকোনবা চাক চবগী মতুংদগী", sinceUrine: "অকোনবা অমতিং চৎপগী মতুংদগী", sinceBowel: "অকোনবা খোং হাম্বগী মতুংদগী", alerts: "চেকশিনৱা", medications: "হিদাক", notes: "ক্লিনিকাল নোট", logout: "লগ আউত", monitoring: "য়েংশিনবা থৌরাং লৈরে", waiting: "সিগ্নেলগী মতম চাদনা...", callPatient: "অনায়েকপু ফোন তৌবিয়ু", message: "মেসেজ", activeAlerts: "চালু চেকশিনৱা", history: "ইতিহাস", acknowledge: "ঙাক্লবিয়ু", noAlerts: "চালু চেকশিনৱা অমারো অকৈ", addMedication: "হিদাক থেংনবিয়ু", addNote: "ক্লিনিকাল নোট থেংনবিয়ু", save: "লুপা তৌবিয়ু", saveNote: "নোট লুপা তৌবিয়ু", cancel: "পুথোকপিয়ু", medicationNamePlaceholder: "হিদাকগী মিং", dosagePlaceholder: "মাংথোক (উদা. 500mg)", notePlaceholder: "ক্লিনিকাল য়েংনবা থীবিয়ু...", alertsOn: "চেকশিনৱা অন", alertsOff: "চেকশিনৱা অফ", systemStatus: "সিস্টেম থৌনা: শমজিনখ্রে", patientLabel: "অনায়েক", conditionLabel: "থৌনা", ageLabel: "চহি", ageUnit: "চহি", caregiver: "হকচাং চাউখৎপা" },
  sat: { connected: "বেল্ট জোড়াৱ অকানা", disconnected: "বেল্ট বাড়ি জোড়াৱ অকানা", sinceMeal: "মুচাত জোম তায়োম", sinceUrine: "মুচাত উডুগ তায়োম", sinceBowel: "মুচাত ইজ তায়োম", alerts: "এলের্ট", medications: "রান", notes: "ওল", logout: "ওডোক", monitoring: "নেংগাও চালাও অকানা", waiting: "সিগ্নাল আগুয়...", callPatient: "রোগীরে ফোন মেনাক", message: "সংদেশ", activeAlerts: "চালু এলের্ট", history: "ইতিহাস", acknowledge: "মানাৱ", noAlerts: "চালু এলের্ট বাড়ি", addMedication: "রান জোড়াও", addNote: "ওল জোড়াও", save: "রাখাও", saveNote: "ওল রাখাও", cancel: "বাদ দিও", medicationNamePlaceholder: "রানগী নাম", dosagePlaceholder: "মাত্রা (যেমন 500mg)", notePlaceholder: "ক্লিনিকাল নিরীক্ষণ লেখো...", alertsOn: "এলের্ট চালু", alertsOff: "এলের্ট বন্ধ", systemStatus: "সিস্টেম থিতি: জোড়াৱ", patientLabel: "রোগী", conditionLabel: "থিতি", ageLabel: "বয়স", ageUnit: "বছর", caregiver: "সেবাকারী" },
  brx: { connected: "বেল্ট ফোনাংজাবায়", disconnected: "বেল্ট সিগাইবায়", sinceMeal: "জোবথা জাখাংনায়নি উনাৱ", sinceUrine: "জোবথা হাসুয়নায়নি উনাৱ", sinceBowel: "জোবথা খিনায়নি উনাৱ", alerts: "এলের্ট", medications: "মুলি", notes: "নোট", logout: "লোগ আউট", monitoring: "নায়দিং জারিবায়", waiting: "সিগ্নালনি বাদি...", callPatient: "সাগ্লোবখৌ ফোন থাখো", message: "মেসেজ", activeAlerts: "জারি এলের্ট", history: "বুথুম", acknowledge: "মানো", noAlerts: "জারি এলের্ট নংগা", addMedication: "মুলি থানো", addNote: "নোট থানো", save: "সুবুংথানো", saveNote: "নোট সুবুংথানো", cancel: "বাতিল থানো", medicationNamePlaceholder: "মুলিনি মিং", dosagePlaceholder: "মাত্রা (যেমন 500mg)", notePlaceholder: "ক্লিনিকাল নায়দিং লেখো...", alertsOn: "এলের্ট আন", alertsOff: "এলের্ট আফ", systemStatus: "সিস্টেম থিতি: ফোনাংজাবায়", patientLabel: "সাগ্লোব", conditionLabel: "থিতি", ageLabel: "বয়", ageUnit: "বসর", caregiver: "সেবাকারী" },
  ks: { connected: "بیلٹ چھُ جُڑِتھ", disconnected: "بیلٹ چھُ الگ گومُت", sinceMeal: "آخری کھؠن پتہ", sinceUrine: "آخری پیشاب پتہ", sinceBowel: "آخری پاخانہ پتہ", alerts: "الرٹس", medications: "دوا", notes: "کلینیکل نوٹس", logout: "لاگ آؤٹ", monitoring: "نظارت فعال چھِ", waiting: "سگنالس انتظار...", callPatient: "مریضس فون کرِو", message: "پیغام", activeAlerts: "فعال الرٹس", history: "تاریخ", acknowledge: "تصدیق کرِو", noAlerts: "کانہہ فعال الرٹ نہ", addMedication: "دوا شامل کرِو", addNote: "کلینیکل نوٹ شامل کرِو", save: "محفوظ کرِو", saveNote: "نوٹ محفوظ کرِو", cancel: "منسوخ کرِو", medicationNamePlaceholder: "دواکھ نام", dosagePlaceholder: "خوراک (مثلاً 500mg)", notePlaceholder: "طبی مشاہدہ لیکھِو...", alertsOn: "الرٹس آن", alertsOff: "الرٹس آف", systemStatus: "سسٹم حالت: جُڑِتھ", patientLabel: "مریض", conditionLabel: "حالت", ageLabel: "عمر", ageUnit: "سال", caregiver: "نگہداشت والُک" },
  sd: { connected: "بيلٽ ڳنڍيل آهي", disconnected: "بيلٽ ڪٽيل آهي", sinceMeal: "آخري کاڌي کان پوءِ", sinceUrine: "آخري پيشاب کان پوءِ", sinceBowel: "آخري حاجت کان پوءِ", alerts: "الرٽس", medications: "دوايون", notes: "ڪلينڪل نوٽس", logout: "لاگ آئوٽ", monitoring: "نگراني فعال آهي", waiting: "سگنل جو انتظار...", callPatient: "مريض کي فون ڪريو", message: "پيغام", activeAlerts: "فعال الرٽس", history: "تاريخ", acknowledge: "تصديق ڪريو", noAlerts: "ڪوبه فعال الرٽ ناهي", addMedication: "دوا شامل ڪريو", addNote: "ڪلينڪل نوٽ شامل ڪريو", save: "محفوظ ڪريو", saveNote: "نوٽ محفوظ ڪريو", cancel: "منسوخ ڪريو", medicationNamePlaceholder: "دوا جو نالو", dosagePlaceholder: "خوراڪ (مثال 500mg)", notePlaceholder: "طبي مشاهدو درج ڪريو...", alertsOn: "الرٽس آن", alertsOff: "الرٽس آف", systemStatus: "سسٽم حالت: ڳنڍيل", patientLabel: "مريض", conditionLabel: "حالت", ageLabel: "عمر", ageUnit: "سال", caregiver: "سنڀاليندڙ" },
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
    caregiverName: '',
    PhoneNumber: ''
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
      setActiveAlert(prev => prev !== data.last_final_state ? data.last_final_state : prev);

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

      setCurrentUser(res);
      setIsAuthenticated(true);

      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
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

      setAuthMode('login');
      setAuthError('SUCCESS: Account created successfully. You can now log in.');

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

  const callPatient = () => {
  if (!patientProfile.phone) {
    alert("Patient phone number not set.");
    return;
  }

  window.location.href = `tel:${patientProfile.phone}`;
};

  const messagePatient = () => {
    if (!patientProfile.phone) {
      alert("Patient phone number not set.");
      return;
    }

    window.location.href = `sms:${patientProfile.phone}?body=Hello, how are you feeling?`;
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

  if (!beltConnected) return;

  let newAlert = null;

  if (activeAlert === "POTENTIAL_HUNGER") {

    newAlert = {
      id: Date.now(),
      severity: "warning",
      icon: "🍽️",
      title: "Hunger Detected",
      message: "Immediate attention required.",
      action: `Provide food to ${patientProfile.name}.`,
      timestamp: new Date()
    };

  } else if (activeAlert === "POTENTIAL_PEE") {

    newAlert = {
      id: Date.now(),
      severity: "critical",
      icon: "🚽",
      title: "Urine Activity Detected",
      message: "Pressure change detected.",
      action: `Assist ${patientProfile.name} immediately.`,
      timestamp: new Date()
    };

  } else if (activeAlert === "POTENTIAL_POOP") {

    newAlert = {
      id: Date.now(),
      severity: "critical",
      icon: "🚽",
      title: "Bowel Activity Detected",
      message: "Sustained abdominal pressure detected.",
      action: `Assist ${patientProfile.name} immediately.`,
      timestamp: new Date()
    };

  }

  if (newAlert) {
    setAlerts(prev => {
      if (prev.length > 0 && prev[0].title === newAlert.title) return prev;
      return [newAlert, ...prev];
    });

    setAlertHistory(prev => [newAlert, ...prev]);
  }

}, [activeAlert]);

  // Login/Register Page
  if (!isAuthenticated) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', maxWidth: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>

            <img
              src={logo}
              alt="Sanket Bandhu"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "contain",
                marginBottom: "10px"
              }}
            />

            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
              Sanket Bandhu
            </h1>

            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Patient Monitoring System
            </p>

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
            <img
              src={logo}
              alt="Sanket Bandhu"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "contain",
                marginBottom: "15px"
              }}
            />
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
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>
                Patient Phone Number
              </label>

              <input
                type="tel"
                value={patientProfile.phone}
                onChange={(e) =>
                  setPatientProfile({ ...patientProfile, phone: e.target.value })
                }
                placeholder="+91XXXXXXXXXX"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}
            />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>

              <img
                src={logo}
                alt="Sanket Bandhu"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "contain"
                }}
              />

              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  Sanket Bandhu
                </div>

                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Patient Monitoring System
                </div>
              </div>

            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{patientProfile.caregiverName}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{t.caregiver}</div>
            </div>
            {/* Language Selector */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{ background: '#1e293b', color: 'white', border: '1px solid #94a3b8', borderRadius: '8px', padding: '5px', cursor: 'pointer' }}
            >
              <optgroup label="International">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
                <option value="ar">العربية</option>
                <option value="ja">日本語</option>
                <option value="ru">Русский</option>
                <option value="pt">Português</option>
                <option value="ne">नेपाली</option>
              </optgroup>
              <optgroup label="Indian">
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="ml">മലയാളം</option>
                <option value="gu">ગુજરાતી</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
                <option value="bn">বাংলা</option>
                <option value="or">ଓଡ଼ିଆ</option>
                <option value="as">অসমীয়া</option>
                <option value="ur">اردو</option>
                <option value="mai">मैथिली</option>
                <option value="sa">संस्कृतम्</option>
                <option value="kok">कोंकणी</option>
                <option value="doi">डोगरी</option>
                <option value="mni">মৈতেইলোন</option>
                <option value="sat">संताली</option>
                <option value="brx">बड़ो</option>
                <option value="ks">کٲشُر</option>
                <option value="sd">سنڌي</option>
              </optgroup>
            </select>
            <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{t.logout}</button>
          </div>
        </div>
        <div style={{ background: '#1e293b', marginTop: '20px', padding: '15px 0' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '40px' }}>
            <div><p style={{ fontSize: '10px', color: '#94a3b8', margin: '0' }}>{t.patientLabel}</p><p style={{ margin: '0', fontWeight: 'bold' }}>{patientProfile.name}</p></div>
            <div><p style={{ fontSize: '10px', color: '#94a3b8', margin: '0' }}>{t.conditionLabel}</p><p style={{ margin: '0', fontWeight: 'bold' }}>{patientProfile.disorder}</p></div>
            <div><p style={{ fontSize: '10px', color: '#94a3b8', margin: '0' }}>{t.ageLabel}</p><p style={{ margin: '0', fontWeight: 'bold' }}>{patientProfile.age} {t.ageUnit}</p></div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '30px' }}>
          <button
            onClick={callPatient}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              padding: '20px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer shadow'
            }}
          >
            <Phone size={28} color="#3b82f6" />
            <span>Call Patient</span>
          </button>
          <button
            onClick={messagePatient}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              padding: '20px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer shadow'
            }}
          >
            <MessageSquare size={28} color="#10b981" />
            <span>Message</span>
          </button>
          <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ background: soundEnabled ? '#eff6ff' : 'white', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer shadow' }}><Bell size={28} color={soundEnabled ? '#3b82f6' : '#9ca3af'} /><span>{soundEnabled ? t.alertsOn : t.alertsOff}</span></button>
        </div>

        {/* --- ADDED CONTEXTUAL METRICS GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
          <MetricCard title={t.sinceMeal} value={timeStats.tslm} icon={<Utensils color="#f97316"/>} onReset={() => handleReset('meal')} />
          <MetricCard title={t.sinceUrine} value={timeStats.tslu} icon={<Droplets color="#3b82f6"/>} onReset={() => handleReset('toilet')} />
          <MetricCard title={t.sinceBowel} value={timeStats.tslb} icon={<Baby color="#92400e"/>} onReset={() => handleReset('bowel')} />
        </div>

        <div style={{ background: 'white', borderRadius: '12px', display: 'flex', border: '1px solid #e2e8f0', marginBottom: '20px', overflow: 'hidden' }}>
          <button onClick={() => setActiveTab('alerts')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'alerts' ? '#0f172a' : 'white', color: activeTab === 'alerts' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>{t.alerts}</button>
          <button onClick={() => setActiveTab('medications')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'medications' ? '#0f172a' : 'white', color: activeTab === 'medications' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>{t.medications}</button>
          <button onClick={() => setActiveTab('notes')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'notes' ? '#0f172a' : 'white', color: activeTab === 'notes' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>{t.notes}</button>
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
                <h3 style={{ margin: 0 }}>{beltConnected ? t.connected : t.disconnected}</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>{beltConnected ? t.monitoring : t.waiting}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button onClick={() => setHistoryView(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #0f172a', background: !historyView ? '#0f172a' : 'white', color: !historyView ? 'white' : '#0f172a', cursor: 'pointer' }}>{t.activeAlerts}</button>
              <button onClick={() => setHistoryView(true)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #0f172a', background: historyView ? '#0f172a' : 'white', color: historyView ? 'white' : '#0f172a', cursor: 'pointer' }}>{t.history} ({alertHistory.length})</button>
            </div>

            {!historyView ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alerts.length === 0 ? (
                  <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>{t.noAlerts}</div>
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
                      <button onClick={() => acknowledgeAlert(alert.id)} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>{t.acknowledge}</button>
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
            <button onClick={() => setShowMedForm(!showMedForm)} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}><Plus size={18} /> {t.addMedication}</button>
            {showMedForm && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginTop: '15px', border: '1px solid #e2e8f0' }}>
                <input type="text" placeholder={t.medicationNamePlaceholder} value={newMedication} onChange={(e) => setNewMedication(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                <input type="text" placeholder={t.dosagePlaceholder} value={newMedicationDosage} onChange={(e) => setNewMedicationDosage(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                <input type="time" value={newMedicationTime} onChange={(e) => setNewMedicationTime(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={addMedication} style={{ flex: 1, padding: '10px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{t.save}</button>
                  <button onClick={() => setShowMedForm(false)} style={{ flex: 1, padding: '10px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{t.cancel}</button>
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
            <button onClick={() => setShowNoteForm(!showNoteForm)} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}><Plus size={18} /> {t.addNote}</button>
            {showNoteForm && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginTop: '15px', border: '1px solid #e2e8f0' }}>
                <textarea placeholder={t.notePlaceholder} value={newNote} onChange={(e) => setNewNote(e.target.value)} style={{ width: '100%', padding: '10px', minHeight: '100px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #d1d5db' }}></textarea>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={addBehavioralNote} style={{ flex: 1, padding: '10px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{t.saveNote}</button>
                  <button onClick={() => setShowNoteForm(false)} style={{ flex: 1, padding: '10px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{t.cancel}</button>
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
          {t.systemStatus}
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