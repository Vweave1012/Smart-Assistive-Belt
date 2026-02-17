import React, { useState, useEffect } from 'react';
/* Added Utensils, Droplets, Baby for TSL metrics */
import { Bell, LogOut, Plus, Trash2, Phone, MessageSquare, Activity, Eye, EyeOff, Mail, Lock, Clock, User, CheckCircle, Utensils, Droplets, Baby } from 'lucide-react';

import { loginUser, registerUser, predictState, getState, updateEvent } from "./api";





export default function CaregiverApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    setAuthError("");

    if (!loginEmail || !loginPassword) {
      setAuthError("Please fill in all fields");
      return;
    }

    try {
      const res = await loginUser({
        email: loginEmail,
        password: loginPassword,
      });

      if (res.error) {
        setAuthError(res.error);
        return;
      }

      localStorage.setItem("token", res.token);

      setCurrentUser({ name: res.name, email: res.email });
      setIsAuthenticated(true);

    } catch (err) {
      setAuthError("Server not reachable");
    }
  };






  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");

    try {
      await registerUser({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });

      alert("Account created! Please login.");
      setAuthMode("login");

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
  if (!activeAlert || activeAlert === "NORMAL" || activeAlert === "NO_USER") {
    return; // ❌ DO NOT CLEAR OLD ALERTS
  }

  let newAlert = null;

  // === Toilet / Hunger alerts ===
  if (activeAlert === "HUNGER") {
    newAlert = {
      id: Date.now(),
      severity: "warning",
      icon: "🍽️",
      title: "Hunger Detected",
      message: "Time threshold reached since last meal.",
      action: `Provide food to ${patientProfile.name}.`,
      timestamp: new Date()
    };
  }

  if (activeAlert === "PEE") {
    newAlert = {
      id: Date.now(),
      severity: "critical",
      icon: "🚽",
      title: "Urine Activity Detected",
      message: "Pressure change detected.",
      action: `Assist ${patientProfile.name} immediately.`,
      timestamp: new Date()
    };
  }

  if (activeAlert === "POOP") {
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

  // === Restlessness ===
  if (activeAlert === "RESTLESS" || activeAlert === "HIGHLY_RESTLESS") {
    const isHighly = activeAlert === "HIGHLY_RESTLESS";

    newAlert = {
      id: Date.now(),
      severity: isHighly ? "critical" : "warning",
      icon: "⚠️",
      title: isHighly ? "High Restlessness" : "Restlessness Detected",
      message: "Abnormal movement detected by belt.",
      action: "Check patient comfort.",
      timestamp: new Date()
    };
  }

  if (!newAlert) return;

  // ✅ Add new alert on top WITHOUT deleting old ones
  setAlerts(prev => [newAlert, ...prev]);

  // ✅ Also store in history
  setAlertHistory(prev => [newAlert, ...prev]);

}, [activeAlert]);




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

          {authError && <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#991b1b', fontSize: '14px' }}>{authError}</div>}

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
            <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
          </div>
        </div>
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
          <MetricCard title="Since Last Meal" value={timeStats.tslm} icon={<Utensils color="#f97316"/>} onReset={() => handleReset('meal')} />
          <MetricCard title="Since Last Urine" value={timeStats.tslu} icon={<Droplets color="#3b82f6"/>} onReset={() => handleReset('toilet')} />
          <MetricCard title="Since Last Bowel" value={timeStats.tslb} icon={<Baby color="#92400e"/>} onReset={() => handleReset('bowel')} />
        </div>

        <div style={{ background: 'white', borderRadius: '12px', display: 'flex', border: '1px solid #e2e8f0', marginBottom: '20px', overflow: 'hidden' }}>
          <button onClick={() => setActiveTab('alerts')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'alerts' ? '#0f172a' : 'white', color: activeTab === 'alerts' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>Alerts</button>
          <button onClick={() => setActiveTab('medications')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'medications' ? '#0f172a' : 'white', color: activeTab === 'medications' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>Medications</button>
          <button onClick={() => setActiveTab('notes')} style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'notes' ? '#0f172a' : 'white', color: activeTab === 'notes' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>Clinical Notes</button>
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
                  {beltConnected ? "BELT CONNECTED" : "BELT DISCONNECTED"}
                </h3>

                <p style={{ margin: 0, fontSize: '14px' }}>
                  {beltConnected
                    ? "System monitoring real-time patient behavior"
                    : "Waiting for sensor data from smart belt"}
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