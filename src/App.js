import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Database, Send, Activity, User, Target, Info, 
  CheckCircle2, Sparkles, Bot, Droplet, Zap, Brain, Battery,
  BatteryMedium, BatteryFull
} from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [accentColor, setAccentColor] = useState('blue');
  
  // State for the App Form (Frontend)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    activity: 'Active (Playing outside)',
    water: 4, // glasses of water
    sleep: 8, // hours of sleep
    goal: 'Learn a new sport'
  });

  // State for the Simulated Database (Backend)
  const [sheetData, setSheetData] = useState([
    { id: 1, timestamp: '10:05 AM', name: 'Alex', age: '10', activity: 'Active', water: 5, sleep: 9, goal: 'Run faster' },
    { id: 2, timestamp: '11:30 AM', name: 'Sam', age: '9', activity: 'Very Active', water: 8, sleep: 10, goal: 'Get stronger' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // AI Coach State
  const [aiAdvice, setAiAdvice] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const accents = {
    blue: 'bg-blue-500 hover:bg-blue-600 text-white',
    green: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    purple: 'bg-purple-500 hover:bg-purple-600 text-white',
    orange: 'bg-orange-500 hover:bg-orange-600 text-white'
  };
  
  const textAccents = {
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500'
  };

  const bgAccentsLight = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-emerald-50 border-emerald-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200'
  };

  const bgAccentsDark = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    green: 'bg-emerald-500/10 border-emerald-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    orange: 'bg-orange-500/10 border-orange-500/20'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age) return;

    setIsSubmitting(true);

    // Simulate network delay to teach how data travels over the internet
    setTimeout(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newRow = {
        id: sheetData.length + 1,
        timestamp: timeString,
        ...formData,
        // Shorten activity for the table
        activity: formData.activity.split(' ')[0]
      };

      setSheetData(prev => [...prev, newRow]);
      setFormData({ name: '', age: '', activity: 'Active (Playing outside)', water: 4, sleep: 8, goal: 'Learn a new sport' });
      setIsSubmitting(false);
      
      // Highlight the database to show it updated
      const dbContainer = document.getElementById('database-container');
      if (dbContainer) {
        dbContainer.classList.add('ring-4', 'ring-emerald-400', 'transition-all');
        setTimeout(() => dbContainer.classList.remove('ring-4', 'ring-emerald-400'), 1500);
      }
    }, 1500); // 1.5 second simulated delay
  };

  const fetchWithRetry = async (url, options, retries = 5) => {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('API Error');
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(res => setTimeout(res, delays[i]));
      }
    }
  };

  const getAiAdvice = async () => {
    if (!formData.name || !formData.age) {
      setAiError("Please tell me your name and age in Section 01 first!");
      return;
    }
    
    setIsGenerating(true);
    setAiError("");
    setAiAdvice("");
    
    // NOTE: Keep this empty or use a proxy for production to protect your key. 
    // This is for demonstration purposes in the Canvas environment.
    const apiKey = ""; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const prompt = `You are a friendly, enthusiastic health and science teacher for 4th graders. The user is a ${formData.age} year old named ${formData.name}. Their activity level is "${formData.activity}", they drank ${formData.water} glasses of water today, and slept ${formData.sleep} hours last night. Their goal is "${formData.goal}". 
    Give them a 2-sentence "Mini Health Lesson" explaining how their specific water or sleep amount affects their body or brain, and how it helps them reach their goal. Use kid-friendly science facts and emojis!`;

    try {
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: "You are a helpful, educational science teacher for young students. Keep answers to 2 sentences max." }] }
      };

      const data = await fetchWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiAdvice(text || "Keep up the great work! Your brain and body are getting stronger every day!");
    } catch (err) {
      setAiError("Oops! The AI Science Teacher is busy experimenting in the lab right now. Try again later!");
    } finally {
      setIsGenerating(false);
    }
  };

  const getWaterFact = (amount) => {
    if (amount < 4) return "Did you know? Your brain is 73% water! When you don't drink enough, it can be harder to focus in class and your body feels tired.";
    if (amount < 7) return "You're doing okay! Water helps carry oxygen to your muscles so you have energy to run, jump, and play.";
    return "Awesome! Being fully hydrated means your body can sweat and cool down easily when you play hard, keeping your heart super healthy!";
  };

  const getSleepFact = (amount) => {
    if (amount < 8) return "Uh oh! Less sleep makes it harder for your body to fight off germs and sickness. Your body battery is running low!";
    if (amount < 10) return "Good job! While you sleep, your brain is actually super busy organizing everything you learned today into memories.";
    return "Supercharged! 10+ hours is perfect for 4th graders. Your body uses this deep sleep time to grow taller and repair muscles!";
  };

  const getSleepIcon = (amount) => {
    if (amount < 8) return <Battery className="text-red-500" size={24} />;
    if (amount < 10) return <BatteryMedium className="text-yellow-500" size={24} />;
    return <BatteryFull className="text-emerald-500" size={24} />;
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-zinc-950 text-zinc-200' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Header Bar */}
      <header className={`px-6 py-4 flex justify-between items-center border-b ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <Activity className={textAccents[accentColor]} size={24} />
          <h1 className="text-xl font-bold tracking-tight">HealthTracker <span className="font-light opacity-60">EDU</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2 mr-4">
            {Object.keys(accents).map(color => (
              <button 
                key={color} 
                onClick={() => setAccentColor(color)}
                className={`w-5 h-5 rounded-full ${accents[color].split(' ')[0]} ${accentColor === color ? 'ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-950' : ''}`}
                aria-label={`Set accent to ${color}`}
              />
            ))}
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-zinc-800/10 dark:hover:bg-zinc-800 transition">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* LEFT COLUMN: THE WEB APP (FRONTEND) */}
        <section className="space-y-8 relative">
          <div className="mb-6">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">My Profile App</h2>
            <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              This is the "Frontend". It's what the user sees and interacts with.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-baseline gap-2 mb-6">
                <span className={`text-2xl font-black ${textAccents[accentColor]}`}>01</span>
                <h3 className="text-xl font-bold uppercase tracking-wider">Your Info</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold mb-2 uppercase opacity-70">First Name</label>
                  <div className={`flex items-center border rounded-lg px-3 py-2 ${darkMode ? 'bg-zinc-950 border-zinc-700' : 'bg-slate-50 border-slate-300'}`}>
                    <User size={18} className="opacity-50 mr-2" />
                    <input 
                      type="text" name="name" value={formData.name} onChange={handleInputChange}
                      placeholder="e.g. Jordan" required
                      className="bg-transparent border-none outline-none w-full placeholder-opacity-40 text-current"
                    />
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold mb-2 uppercase opacity-70">Age</label>
                  <div className={`flex items-center border rounded-lg px-3 py-2 ${darkMode ? 'bg-zinc-950 border-zinc-700' : 'bg-slate-50 border-slate-300'}`}>
                    <input 
                      type="number" name="age" value={formData.age} onChange={handleInputChange}
                      placeholder="Years" min="5" max="15" required
                      className="bg-transparent border-none outline-none w-full placeholder-opacity-40 text-current"
                    />
                    <span className="opacity-50 text-sm">yrs</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-2xl font-black ${textAccents[accentColor]}`}>02</span>
                <h3 className="text-xl font-bold uppercase tracking-wider">Health Lab</h3>
              </div>
              <p className={`text-sm mb-6 ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Interact with the trackers below to learn how your daily habits affect your amazing body!
              </p>
              
              {/* Water Tracker */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold uppercase opacity-70 flex items-center gap-2">
                    <Droplet size={16} className="text-blue-500" /> Water Drank Today
                  </label>
                  <span className="font-bold text-blue-500">{formData.water} Glasses</span>
                </div>
                
                <div className="flex gap-1 sm:gap-2 justify-between">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <button
                      key={`water-${num}`}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, water: num }))}
                      className={`p-2 sm:p-3 rounded-xl border-2 transition-all flex-1 flex justify-center items-center ${
                        formData.water >= num 
                          ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20 scale-105' 
                          : `${darkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700' : 'bg-slate-50 border-slate-200 text-slate-300 hover:border-slate-300'}`
                      }`}
                    >
                      <Droplet size={20} className={formData.water >= num ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
                {/* Dynamic Water Fact */}
                <div className={`p-3 rounded-lg border text-sm flex gap-3 ${darkMode ? bgAccentsDark.blue : bgAccentsLight.blue}`}>
                  <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className={darkMode ? 'text-blue-100' : 'text-blue-900'}>{getWaterFact(formData.water)}</p>
                </div>
              </div>

              {/* Sleep Tracker */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold uppercase opacity-70 flex items-center gap-2">
                    {getSleepIcon(formData.sleep)} Sleep Last Night
                  </label>
                  <span className="font-bold">{formData.sleep} Hours</span>
                </div>
                
                <div className="px-2">
                  <input 
                    type="range" 
                    min="4" max="12" step="1"
                    value={formData.sleep}
                    onChange={(e) => setFormData(prev => ({ ...prev, sleep: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs mt-2 opacity-50 font-bold">
                    <span>4 hrs (Tired)</span>
                    <span>8 hrs (Okay)</span>
                    <span>12 hrs (Supercharged)</span>
                  </div>
                </div>

                {/* Dynamic Sleep Fact */}
                <div className={`p-3 rounded-lg border text-sm flex gap-3 ${darkMode ? bgAccentsDark.green : bgAccentsLight.green}`}>
                  <Brain size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className={darkMode ? 'text-emerald-100' : 'text-emerald-900'}>{getSleepFact(formData.sleep)}</p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-baseline gap-2 mb-6">
                <span className={`text-2xl font-black ${textAccents[accentColor]}`}>03</span>
                <h3 className="text-xl font-bold uppercase tracking-wider">Goals & AI Teacher</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-bold mb-2 uppercase opacity-70">My Main Goal</label>
                <select 
                  name="goal" value={formData.goal} onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg border appearance-none text-current ${darkMode ? 'bg-zinc-950 border-zinc-700' : 'bg-slate-50 border-slate-300'}`}
                >
                  <option>Learn a new sport</option>
                  <option>Run faster</option>
                  <option>Get stronger</option>
                  <option>Drink more water</option>
                  <option>Focus better in school</option>
                </select>
              </div>

              {/* AI Teacher Button */}
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-zinc-950/50 border-zinc-800' : 'bg-slate-50/50 border-slate-200'}`}>
                 <p className={`text-sm mb-3 ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Click the button below to send your data (Age, Water, Sleep, Goal) to our AI Science Teacher. It will generate a custom lesson just for you!
                </p>

                <button 
                  type="button"
                  onClick={getAiAdvice}
                  disabled={isGenerating}
                  className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 border-2 ${isGenerating ? 'opacity-70 cursor-wait' : ''} ${darkMode ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' : 'border-slate-300 hover:bg-slate-100 text-slate-600'}`}
                >
                  {isGenerating ? (
                    <><Activity className="animate-spin" size={18} /> Teacher is thinking...</>
                  ) : (
                    <><Sparkles size={18} className={textAccents[accentColor]} /> Generate AI Mini-Lesson ✨</>
                  )}
                </button>

                {aiError && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                    {aiError}
                  </div>
                )}

                {aiAdvice && !isGenerating && (
                  <div className={`mt-4 p-4 rounded-xl border relative overflow-hidden ${darkMode ? bgAccentsDark[accentColor] : bgAccentsLight[accentColor]} animate-in fade-in slide-in-from-bottom-2`}>
                    <Bot size={80} className={`absolute -right-4 -bottom-4 opacity-10 ${textAccents[accentColor]}`} />
                    <p className="text-sm md:text-base font-medium leading-relaxed relative z-10">
                      "{aiAdvice}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95 ${accents[accentColor]} ${isSubmitting ? 'opacity-80 cursor-wait' : ''}`}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {isSubmitting ? (
                  <>
                    <Activity className="animate-spin" />
                    Sending data over the internet...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Save to Database
                  </>
                )}
              </button>

              {/* Educational Tooltip */}
              {showTooltip && !isSubmitting && (
                <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-64 p-3 rounded-lg text-xs shadow-xl z-10 ${darkMode ? 'bg-zinc-800 text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
                  <div className="flex gap-2 items-start">
                    <Info size={16} className={textAccents[accentColor]} />
                    <p>Clicking this creates a <b>POST Request</b>. It packages your info and sends it to the server!</p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </section>

        <section className="space-y-4 lg:pl-8 lg:border-l border-dashed border-opacity-20 border-current pt-8 lg:pt-0">
          
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2 flex items-center gap-2">
                <Database className={textAccents[accentColor]} />
                The Database
              </h2>
              <p className={`text-sm ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                This is the "Backend" (Google Sheets). It safely stores the data forever.
              </p>
            </div>
          </div>

          {/* Educational Animation / Connection line */}
          <div className="h-16 flex items-center justify-center relative overflow-hidden rounded-lg bg-black/5 dark:bg-white/5 mb-4">
            {isSubmitting ? (
              <div className="flex flex-col items-center animate-pulse">
                <div className="flex gap-2">
                  <div className={`w-3 h-3 rounded-full ${accents[accentColor].split(' ')[0]} animate-bounce`} style={{animationDelay: '0ms'}}></div>
                  <div className={`w-3 h-3 rounded-full ${accents[accentColor].split(' ')[0]} animate-bounce`} style={{animationDelay: '150ms'}}></div>
                  <div className={`w-3 h-3 rounded-full ${accents[accentColor].split(' ')[0]} animate-bounce`} style={{animationDelay: '300ms'}}></div>
                </div>
                <span className="text-xs font-bold mt-2 opacity-70">RECEIVING DATA...</span>
              </div>
            ) : (
              <div className="text-xs font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={16} /> Waiting for new data
              </div>
            )}
          </div>

          {/* Simulated Google Sheet UI */}
          <div 
            id="database-container"
            className={`rounded-lg overflow-hidden border ${darkMode ? 'border-zinc-700' : 'border-slate-300'} shadow-xl transition-colors duration-500`}
          >
            {/* Sheet Header */}
            <div className="bg-emerald-600 text-white p-2 flex items-center gap-2 text-sm font-semibold">
              <div className="w-4 h-4 bg-white/20 rounded grid place-items-center"><div className="w-2 h-2 bg-white rounded-sm"></div></div>
              Class_Health_App_Responses
            </div>
            
            {/* Sheet Toolbar */}
            <div className={`p-1 flex gap-2 border-b ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-300'}`}>
              <div className="h-4 w-4 rounded-full bg-red-400/80 ml-1"></div>
              <div className="h-4 w-4 rounded-full bg-yellow-400/80"></div>
              <div className="h-4 w-4 rounded-full bg-green-400/80"></div>
            </div>

            {/* Sheet Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                <thead>
                  <tr className={`${darkMode ? 'bg-zinc-900' : 'bg-slate-200'}`}>
                    <th className={`border p-2 font-medium ${darkMode ? 'border-zinc-700 text-zinc-400' : 'border-slate-300 text-slate-600'} w-12 text-center`}></th>
                    <th className={`border p-2 font-medium ${darkMode ? 'border-zinc-700 text-zinc-400' : 'border-slate-300 text-slate-600'}`}>A</th>
                    <th className={`border p-2 font-medium ${darkMode ? 'border-zinc-700 text-zinc-400' : 'border-slate-300 text-slate-600'}`}>B</th>
                    <th className={`border p-2 font-medium ${darkMode ? 'border-zinc-700 text-zinc-400' : 'border-slate-300 text-slate-600'}`}>C</th>
                    <th className={`border p-2 font-medium ${darkMode ? 'border-zinc-700 text-zinc-400' : 'border-slate-300 text-slate-600'}`}>D</th>
                    <th className={`border p-2 font-medium ${darkMode ? 'border-zinc-700 text-zinc-400' : 'border-slate-300 text-slate-600'}`}>E</th>
                    <th className={`border p-2 font-medium ${darkMode ? 'border-zinc-700 text-zinc-400' : 'border-slate-300 text-slate-600'}`}>F</th>
                  </tr>
                  <tr className={`${darkMode ? 'bg-zinc-800' : 'bg-white'}`}>
                    <td className={`border p-2 text-center text-xs font-bold ${darkMode ? 'border-zinc-700 text-zinc-500 bg-zinc-900' : 'border-slate-300 text-slate-400 bg-slate-100'}`}>1</td>
                    <td className={`border p-2 font-bold ${darkMode ? 'border-zinc-700' : 'border-slate-300'}`}>Timestamp</td>
                    <td className={`border p-2 font-bold ${darkMode ? 'border-zinc-700' : 'border-slate-300'}`}>Name</td>
                    <td className={`border p-2 font-bold ${darkMode ? 'border-zinc-700' : 'border-slate-300'}`}>Age</td>
                    <td className={`border p-2 font-bold ${darkMode ? 'border-zinc-700' : 'border-slate-300'}`}>Water</td>
                    <td className={`border p-2 font-bold ${darkMode ? 'border-zinc-700' : 'border-slate-300'}`}>Sleep</td>
                    <td className={`border p-2 font-bold ${darkMode ? 'border-zinc-700' : 'border-slate-300'}`}>Goal</td>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-zinc-950' : 'bg-white'}`}>
                  {sheetData.map((row, index) => (
                    <tr key={row.id} className={index === sheetData.length - 1 && index > 1 ? `bg-emerald-500/20 transition-colors` : ''}>
                      <td className={`border p-2 text-center text-xs font-bold ${darkMode ? 'border-zinc-700 text-zinc-500 bg-zinc-900' : 'border-slate-300 text-slate-400 bg-slate-100'}`}>
                        {index + 2}
                      </td>
                      <td className={`border p-2 ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}>{row.timestamp}</td>
                      <td className={`border p-2 ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}>{row.name}</td>
                      <td className={`border p-2 ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}>{row.age}</td>
                      <td className={`border p-2 ${darkMode ? 'border-zinc-800' : 'border-slate-200'} text-blue-500 font-medium`}>{row.water} <span className="opacity-50 font-normal">gl</span></td>
                      <td className={`border p-2 ${darkMode ? 'border-zinc-800' : 'border-slate-200'} text-emerald-500 font-medium`}>{row.sleep} <span className="opacity-50 font-normal">hr</span></td>
                      <td className={`border p-2 ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}>{row.goal}</td>
                    </tr>
                  ))}
                  {/* Empty filler rows */}
                  {[...Array(Math.max(0, 5 - sheetData.length))].map((_, i) => (
                    <tr key={`empty-${i}`}>
                       <td className={`border p-2 text-center text-xs font-bold ${darkMode ? 'border-zinc-700 text-zinc-500 bg-zinc-900' : 'border-slate-300 text-slate-400 bg-slate-100'}`}>
                        {sheetData.length + i + 2}
                      </td>
                      <td className={`border p-2 ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}></td>
                      <td className={`border p-2 ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}></td>
                      <td className={`border p-2 ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}></td>
                      <td className={`border p-2 ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}></td>
                      <td className={`border p-2 ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}></td>
                      <td className={`border p-2 ${darkMode ? 'border-zinc-800' : 'border-slate-200'}`}></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Sheet Tabs */}
            <div className={`p-2 flex gap-4 text-xs font-bold border-t ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-slate-200 border-slate-300'}`}>
              <div className={`px-4 py-1 rounded-t-lg bg-white text-emerald-700 border-b-2 border-emerald-500 dark:bg-zinc-800 dark:text-emerald-400`}>
                Sheet1
              </div>
              <div className="px-4 py-1 opacity-50 cursor-pointer">+ Add Sheet</div>
            </div>
          </div>

          <div className={`p-4 rounded-xl mt-4 text-sm ${darkMode ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
            <h4 className="font-bold flex items-center gap-2 mb-1"><Target size={16}/> Lesson Check</h4>
            <p>Notice how your <b>App (Frontend)</b> and <b>Database (Backend)</b> look completely different, but they communicate with each other using the exact same data! When you clicked the Water and Sleep trackers, those numbers got packaged up and sent over the internet to be stored in the columns above.</p>
          </div>

        </section>
      </main>
    </div>
  );
}
