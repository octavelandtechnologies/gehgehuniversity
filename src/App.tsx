/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Award, 
  CheckCircle, 
  ChevronRight, 
  ArrowRight,
  Upload, 
  Download, 
  AlertCircle,
  BookOpen,
  MapPin,
  RefreshCw,
  ExternalLink,
  User,
  BadgeAlert,
  Share2
} from 'lucide-react';
import { UNIVERSITY_QUESTIONS, NIGERIAN_STATES } from './data';
import { StudentInfo, PlatformType } from './types';
import IdCardCanvas from './components/IdCardCanvas';
import crestImage from './assets/images/university_crest_1779730400525.png';

export default function App() {
  // Wizard steps: 0 (Welcome), 1 (Quiz), 2 (Admissions & Info Input), 3 (Social Unlock & Download)
  const [step, setStep] = useState<number>(0);
  
  // Quiz states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Quiz questions: selected at random from the total 12
  const [selectedQuestions, setSelectedQuestions] = useState<typeof UNIVERSITY_QUESTIONS>(() => {
    return [...UNIVERSITY_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 6);
  });

  // Student registration states
  const [studentName, setStudentName] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('Delta'); // GehGeh's origin base
  const [passportUrl, setPassportUrl] = useState<string | null>(null);
  const [matricNo, setMatricNo] = useState<string>('');
  const [level, setLevel] = useState<string>('500 Level (Professor of Wisdom)');
  const [score, setScore] = useState<number>(0);

  // Memoize student data to prevent infinite re-renders on the canvas component
  const studentData = useMemo(() => ({
    name: studentName,
    passportUrl: passportUrl,
    matricNo: matricNo,
    level: level,
    score: score,
    stateOfOrigin: selectedState,
    admissionDate: "2026/2027"
  }), [studentName, passportUrl, matricNo, level, score, selectedState]);

  // Social trigger states
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(null);
  const [socialClicked, setSocialClicked] = useState<boolean>(false);
  const [downloadCounter, setDownloadCounter] = useState<number>(0);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  // Download trigger callback from Canvas component
  const canvasDownloadFnRef = useRef<(() => void) | null>(null);

  // Social Links for Octaveland Technologies
  const socialLinks: Record<'Facebook' | 'TikTok' | 'Instagram', string> = {
    Facebook: 'https://www.facebook.com/profile.php?id=61590075822091',
    TikTok: 'https://www.tiktok.com/@octaveland_technologies',
    Instagram: 'https://www.instagram.com/octaveland_technologies/'
  };

  // Generate a realistic Nigerian Student Matrix number
  const generateMatricNumber = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `UOWU/2026/MAT/${randomDigits}`;
  };

  // Grade quiz score and mapping to GehGeh educational status Levels
  const handleAnswerSelect = (optionKey: string) => {
    setAnswers(prev => ({
      ...prev,
      [selectedQuestions[currentQuestionIndex].id]: optionKey
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      processGradeExam();
    }
  };

  const processGradeExam = () => {
    let finalScore = 0;
    selectedQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        finalScore += 1;
      }
    });

    setScore(finalScore);
    
    // Assign student level according to the GehGeh Wisdom level
    let wisdomLevelLabel = '';
    if (finalScore === 6) {
      wisdomLevelLabel = "500 Level (Professor of Wisdom & Relationship Defence)";
    } else if (finalScore === 5) {
      wisdomLevelLabel = "400 Level (Wise Elder & Relationship Consultant)";
    } else if (finalScore === 4) {
      wisdomLevelLabel = "300 Level (Wise Disciple of Authenticity)";
    } else if (finalScore === 2 || finalScore === 3) {
      wisdomLevelLabel = "200 Level (Novice of Common Sense)";
    } else {
      wisdomLevelLabel = "100 Level (Freshman in Folly - 'Had I Know!')";
    }

    setLevel(wisdomLevelLabel);
    setMatricNo(generateMatricNumber());
    setStep(2); // Jump to Accept Admission step
  };

  // Handle uploaded passport (convert file to base64)
  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPassportUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Drag & Drop passport
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPassportUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    setStep(3); // Jump to Preview and final question unlock step
  };

  const handleSocialClick = () => {
    setSocialClicked(true);
    if (selectedPlatform) {
      window.open(socialLinks[selectedPlatform], '_blank', 'noopener,noreferrer');
    }
  };

  const handleFullReset = () => {
    setStep(0);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setStudentName('');
    setSelectedState('Delta');
    setPassportUrl(null);
    setSelectedPlatform(null);
    setSocialClicked(false);
    setSelectedQuestions([...UNIVERSITY_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 6));
  };

  // Interactive share mechanism to refer the portal to other prospective students
  const handleSharePortal = async () => {
    const shareTitle = "The University of Wisdom and Understanding";
    const shareText = `🎓 I just scored my official provisional admission ID Card from Vice Chancellor GehGeh at the prestigious University of Wisdom and Understanding (UOWU)! Claim your custom student card here:`;
    const shareUrl = window.location.origin + window.location.pathname;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } catch (err) {
        console.log("Web share aborted or unsupported, falling back to clipboard: ", err);
        fallbackCopyToClipboard();
      }
    } else {
      fallbackCopyToClipboard();
    }
  };

  const fallbackCopyToClipboard = () => {
    const shareMsg = `🎓 *ADMISSION PORTAL LIVE* 🎓\n\nI just received my provisional student ID card at the *University of Wisdom and Understanding*, proudly brought to you by *Octaveland Technologies*!\n\nTake the entrance exam and claim your custom ID card now:\n👉 ${window.location.origin + window.location.pathname}`;
    
    navigator.clipboard.writeText(shareMsg).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    }).catch(err => {
      console.error("Failed to copy path: ", err);
    });
  };

  // Computed metrics for stats layout block
  const wisdomPercentage = Math.round((score / 6) * 100);
  const wisdomStatus = score >= 5 ? "EXEMPTED" : score >= 3 ? "PROBATIONAL" : "INTERNED";
  const wisdomCategory = score === 6 ? "NO FOOLING" : score >= 4 ? "STREET DECENT" : "COCOS FOOL";

  return (
    <div className="min-h-screen bg-[#f0f4f1] text-[#1a1a1a] flex flex-col font-sans relative overflow-x-hidden pixel-grid selection:bg-[#008751] selection:text-white">
      
      {/* Top Navigation bar - Authentic Bold Typography Brand block */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-[#008751] px-2 sm:px-4 py-3 sm:py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none" onClick={handleFullReset}>
            <div className="bg-[#008751] text-white p-2 sm:p-2.5 inline-block shrink-0">
              <h2 className="text-[8px] sm:text-[10px] font-black uppercase tracking-tighter leading-none">University of</h2>
              <h1 className="text-xs sm:text-sm md:text-lg font-black uppercase leading-none tracking-tighter">Wisdom & Understanding</h1>
            </div>
            <img 
              src={crestImage} 
              alt="UOWU Academic Seal" 
              className="hidden xs:block w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-full border-2 border-dashed border-[#008751]"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500 pl-4 border-l-2 border-dashed border-gray-200">
            <span className="w-2.5 h-2.5 bg-[#008751] rounded-full animate-pulse" />
            <span>Motto: \"Had I know, the last comment of a fool\"</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right pr-2">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase leading-none">Powered By</p>
              <p className="text-[10px] font-black text-[#008751] uppercase leading-none mt-1">Octaveland Tech</p>
            </div>
            <button 
              onClick={handleFullReset}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white rounded-none border-2 border-black hover:bg-gray-100 transition shadow-[2px_2px_0_0_#000] shrink-0"
            >
              <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#008751]" />
              <span className="hidden xs:inline">Reset Admissions</span>
              <span className="xs:hidden">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col justify-center items-center z-10">
        
        {/* Step 0: Welcome gates with gorgeous Bold Block layout */}
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-4"
          >
            {/* Left intro text content */}
            <div className="md:col-span-7 space-y-6">
              <div className="inline-block bg-[#008751] text-white px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                IN PARTNERSHIP WITH OCTAVELAND TECHNOLOGIES
              </div>

              <h1 className="text-3xl xs:text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[#1a1a1a]">
                THE UNIVERSITY OF <br />
                <span className="text-[#008751]">WISDOM</span> &amp; <br />
                <span className="underline decoration-wavy decoration-[#008751]/50 underline-offset-8">UNDERSTANDING</span>
              </h1>

              <p className="text-xs font-bold italic text-gray-500 border-l-4 border-[#008751] pl-4 py-1 text-justify">
                \"Had I know, the last comment of a fool.\" <br />
                <span className="block mt-1 font-mono font-black text-[#008751] not-italic">— OFFICIAL U.O.W.U UNIVERSITY MOTTO</span>
              </p>

              <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                This is a fun, Nigerian interactive website proudly brought to you by <span className="text-[#008751] font-black">Octaveland Technologies</span>, celebrating the highly viral lectures, street sense checklists, and relationship rules of Vice Chancellor VC <span className="text-[#008751] font-extrabold font-display">GehGeh (Emmanuel Obruste)</span>. Take the 6-question challenge to generate your premium identity card!
              </p>

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-5 text-base font-black uppercase tracking-wider text-white bg-[#008751] hover:bg-[#007042] border-4 border-black shadow-[4px_4px_0_0_#1a1a1a] transition-all cursor-pointer"
                >
                  <span>Take Entrance Quiz</span>
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </motion.button>
              </div>
            </div>

            {/* Right aesthetic preview banner */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-8 bg-white border-4 border-black shadow-[8px_8px_0_0_#008751] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#008751]/10 rounded-full blur-xl pointer-events-none" />
              
              <img 
                src={crestImage} 
                alt="Large University Crest" 
                className="w-40 h-40 object-contain rounded-full border-4 border-[#008751] p-1.5 bg-white shadow-md mb-4"
              />

              <div className="text-center space-y-2">
                <h3 className="font-black text-xs uppercase tracking-widest text-[#008751]">OFFICIAL VC CLEARANCE</h3>
                <p className="font-display font-bold text-lg text-gray-800 leading-tight">EMMANUEL OBRUSTE</p>
                <span className="inline-block px-3 py-1 bg-gray-100 border border-gray-300 font-mono text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                  PORTAL VERIFICATION STAMP
                </span>
              </div>
            </div>
            
          </motion.div>
        )}

        {/* Step 1: The 6 Quiz questions (Super bold typography theme) */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-white border-4 border-black p-6 md:p-10 shadow-[8px_8px_0_0_#008751] relative"
            style={{ boxShadow: '8px 8px 0px 0px #008751' }}
          >
            {/* Exam Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-4 border-gray-100 pb-5 mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-[#008751] text-white p-2 font-black text-xs uppercase tracking-tighter">UOWU</div>
                <span className="font-display font-black text-lg uppercase tracking-tight text-[#1a1a1a]">Entrance Examination</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs font-black">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200">
                  QUESTION {currentQuestionIndex + 1} OF {selectedQuestions.length}
                </span>
              </div>
            </div>

            {/* Bold Progress Bar */}
            <div className="w-full bg-gray-100 h-4 border-2 border-black inline-block mb-8 relative">
              <div 
                className="bg-[#008751] h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / selectedQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question Bold Text */}
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-black uppercase text-[#1a1a1a] tracking-tighter leading-none mb-4">
                {currentQuestionIndex + 1}. {selectedQuestions[currentQuestionIndex].question}
              </h2>

              {/* Options Stack in Bold Box Layout */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {selectedQuestions[currentQuestionIndex].options.map((opt) => {
                  const isSelected = answers[selectedQuestions[currentQuestionIndex].id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleAnswerSelect(opt.key)}
                      className={`w-full text-left flex items-start gap-4 p-4 border-2 font-bold cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-[#008751] text-white border-black shadow-[4px_4px_0_0_#1a1a1a]' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#008751] hover:text-[#1a1a1a] hover:bg-gray-50'
                      }`}
                    >
                      {/* Bold Box key Block */}
                      <span className={`w-6 h-6 flex items-center justify-center font-display text-xs font-black shrink-0 border-2 ${
                        isSelected 
                          ? 'bg-white border-black text-[#008751]' 
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}>
                        {opt.key.toUpperCase()}
                      </span>
                      <span className="text-sm md:text-base leading-tight">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nav controls */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t-2 border-dashed border-gray-100">
              <div className="text-[10px] text-gray-400 uppercase font-black tracking-tight">
                *Select an answer to proceed
              </div>

              <button
                disabled={!answers[selectedQuestions[currentQuestionIndex].id]}
                onClick={handleNextQuestion}
                className={`inline-flex items-center gap-2 px-6 py-3 font-black uppercase tracking-wider border-2 border-black transition-all ${
                  answers[selectedQuestions[currentQuestionIndex].id]
                    ? 'bg-[#008751] hover:bg-[#007042] text-white shadow-[3px_3px_0_0_#1a1a1a] cursor-pointer'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                <span>
                  {currentQuestionIndex === selectedQuestions.length - 1 
                    ? 'Grade & Award Level' 
                    : 'Next Point'
                  }
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Admission Accepted & Registration details submission */}
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
          >
            {/* Left side: Bold Grade Showcase Box (5 columns) */}
            <div className="md:col-span-5 bg-white border-4 border-[#008751] p-6 text-center space-y-6 shadow-[6px_6px_0_0_#161616]">
              <div className="bg-[#008751] text-white p-3 inline-block">
                <h2 className="text-xs font-black uppercase tracking-tighter">Admission Status</h2>
                <h1 className="text-xl font-black uppercase leading-none tracking-tighter">Provisional Secured</h1>
              </div>

              <h2 className="text-xs font-black uppercase text-gray-400 tracking-wider">WISDOM GRADIENT LEVEL</h2>
              
              <div className="inline-block p-4 border-2 border-[#008751] bg-[#008751]/5">
                <div className="text-lg font-black text-[#008751] leading-none mb-1">CURRENT TIER</div>
                <div className="text-2xl font-black text-[#1a1a1a] uppercase leading-none tracking-tighter">
                  {score === 6 ? "500 LEVEL" : `${score}00 LEVEL`}
                </div>
              </div>

              {/* Status explanation */}
              <p className="text-xs font-bold text-gray-500 leading-relaxed italic border-l-2 border-[#008751] pl-3 text-left">
                \"You scored {score} out of 6 points. Place designated: {level}. Proceed immediately to identity card setup.\"
              </p>

              {/* Little stats grid */}
              <div className="grid grid-cols-3 gap-2 border-t border-dashed border-gray-200 pt-4">
                <div className="text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Wisdom Index</p>
                  <p className="text-base font-black text-[#008751]">{wisdomPercentage}%</p>
                </div>
                <div className="text-center border-l border-gray-200">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Status</p>
                  <p className="text-base font-black text-green-600 leading-none mt-1">{wisdomStatus}</p>
                </div>
                <div className="text-center border-l border-gray-200">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Category</p>
                  <p className="text-base font-black leading-none mt-1 text-gray-800">{wisdomCategory}</p>
                </div>
              </div>
            </div>

            {/* Right side: Registration Name / Passport Photo (7 columns) */}
            <div className="md:col-span-7 bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0_0_#008751]" style={{ boxShadow: '6px 6px 0px 0px #008751' }}>
              <div className="border-b-4 border-gray-100 pb-4 mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1a1a1a] flex items-center gap-2">
                  <User className="w-5 h-5 text-[#008751]" />
                  Issue Student ID Card
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase mt-1">
                  Fill in your custom details to appear on the final rectangular identity card asset
                </p>
              </div>

              <form onSubmit={handleInfoSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="student-name" className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    Full Name on Card *
                  </label>
                  <input 
                    type="text"
                    id="student-name"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. EMERIE OKAFOR"
                    maxLength={35}
                    className="w-full bg-gray-50 border-2 border-gray-200 p-3 font-bold text-lg focus:outline-none focus:border-[#008751] transition-colors"
                  />
                </div>

                {/* State of Origin */}
                <div className="space-y-2">
                  <label htmlFor="state-origin" className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    State of Origin (Nigeria)
                  </label>
                  <div className="relative">
                    <select 
                      id="state-origin"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-200 p-3 font-bold text-base focus:outline-none focus:border-[#008751] appearance-none"
                    >
                      {NIGERIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st} State
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                      <MapPin className="w-4 h-4 text-gray-450" />
                    </div>
                  </div>
                </div>

                {/* Passport Upload Area - Bold & Clickable file box */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    Upload Passport Photograph (Optional)
                  </label>
                  
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full border-2 border-dashed p-6 transition-all duration-150 flex flex-col items-center justify-center text-center gap-3 cursor-pointer ${
                      isDragging 
                        ? 'border-[#008751] bg-[#008751]/5' 
                        : passportUrl 
                          ? 'border-green-600 bg-gray-50' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="passport-input"
                      accept="image/*"
                      onChange={handlePassportUpload}
                      className="hidden"
                    />
                    
                    <label htmlFor="passport-input" className="w-full cursor-pointer flex flex-col items-center justify-center">
                      {passportUrl ? (
                        <div className="flex items-center gap-4">
                          <img 
                            src={passportUrl} 
                            alt="Uploaded Portrait preview" 
                            className="w-16 h-20 rounded-none border-2 border-black object-cover shadow-sm"
                          />
                          <div className="text-left">
                            <p className="text-xs font-black uppercase text-[#008751] flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-emerald-500 inline" />
                              Passport Selected
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Click to replace photo</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-2.5 bg-white border border-gray-200 rounded-none text-gray-500">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase text-[#1a1a1a]">Drag &amp; Drop Passport Photograph</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Supports JPG / PNG images</p>
                            <span className="inline-block mt-3 text-[10px] font-black bg-white text-gray-800 uppercase px-3 py-1 border-2 border-black hover:bg-gray-100">
                              Browse Computer
                            </span>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Form Action Buttons in block layout */}
                <div className="pt-4 border-t-2 border-gray-100 flex flex-col sm:flex-row gap-4">
                  <button 
                    type="button"
                    onClick={() => setStep(0)}
                    className="w-full sm:w-auto px-6 py-3 font-black uppercase tracking-wider text-xs border-2 border-black bg-white hover:bg-gray-100 transition"
                  >
                    Restart Portal
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 text-white font-black bg-[#008751] hover:bg-[#007042] border-4 border-black text-center uppercase tracking-widest shadow-[3px_3px_0_0_#1a1a1a] transition-all cursor-pointer"
                  >
                    <span>Proceed to ID Card Layout</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Step 3: ID Card Draft Preview, final platform release questions, and social lock */}
        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl space-y-8 flex flex-col items-center"
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Panel: Preview of ID Card and design title (7 columns) */}
              <div className="lg:col-span-12 flex flex-col items-center space-y-4">
                <div className="text-center">
                  <span className="inline-block bg-[#008751] text-white px-3 py-1 text-[10px] font-black tracking-widest uppercase mb-2">
                    OFFICIAL MATRICULATION DATA PREVIEW
                  </span>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1a1a1a]">
                    Review Your Academic Credential
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">
                    Your official rectangular JPG ID card has been rendered on the secure canvas.
                  </p>
                </div>

                {/* Actual canvas preview rendered elegantly */}
                <div className="w-full py-4 flex justify-center">
                  <IdCardCanvas 
                    student={studentData}
                    onDownloadReady={(downloadFn) => {
                      canvasDownloadFnRef.current = downloadFn;
                    }}
                  />
                </div>
              </div>

              {/* Right Panel: Social Locks & Unlock Quest (12 columns full-width block below) */}
              <div className="lg:col-span-12">
                <div className="bg-white border-4 border-black p-6 md:p-8 space-y-6 shadow-[8px_8px_0_0_#008751]" style={{ boxShadow: '8px 8px 0px 0px #008751' }}>
                  
                  {/* Validation block header */}
                  <div className="border-b-4 border-gray-100 pb-4 mb-4">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-[#1a1a1a] flex items-center gap-2">
                       <BadgeAlert className="w-5 h-5 text-[#008751]" />
                       Final Release Quest by Octaveland Technologies
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase mt-1">
                      Which platform do you watch GehGeh to unlock your direct high-definition rectangular JPEG file download?
                    </p>
                  </div>

                  {/* Final Question */}
                  <div className="space-y-4">
                    <p className="text-base font-black text-[#1a1a1a] uppercase tracking-tight">
                      Which platform do you watch GehGeh?
                    </p>

                    {/* Social options grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(['Facebook', 'TikTok', 'Instagram'] as PlatformType[]).map((platform) => {
                        const isChosen = selectedPlatform === platform;
                        return (
                          <button
                            key={platform}
                            onClick={() => {
                              setSelectedPlatform(platform);
                              // Reset clicked block if switching platform
                              if (selectedPlatform !== platform) {
                                setSocialClicked(false);
                              }
                            }}
                            className={`flex items-center justify-between p-4 border-2 font-black cursor-pointer transition-all ${
                              isChosen 
                                ? 'bg-[#008751] text-white border-black shadow-[4px_4px_0_0_#1a1a1a]' 
                                : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-black hover:text-[#1a1a1a]'
                            }`}
                          >
                            <span>{platform}</span>
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isChosen ? 'border-white bg-white' : 'border-gray-300 bg-white'
                            }`}>
                              {isChosen && <span className="w-2 h-2 bg-[#008751] rounded-full" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Social Lock Reveal (Condition triggered) */}
                  <AnimatePresence mode="wait">
                    {selectedPlatform && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-5 border-2 border-dashed border-[#008751] bg-[#008751]/5 space-y-4"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#008751] shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-black uppercase text-[#008751]">
                              Verification Step Active for {selectedPlatform} student
                            </h4>
                            <p className="text-xs text-gray-600 font-bold uppercase mt-1">
                              follow our page on {selectedPlatform.toLowerCase()} before you can download your id:
                            </p>
                          </div>
                        </div>

                        {/* Social interactive trigger button */}
                        <div className="pt-1">
                          <button
                            onClick={handleSocialClick}
                            className={`w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 border-2 font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                              socialClicked 
                                ? 'bg-gray-100 text-[#008751] border-gray-300' 
                                : 'bg-[#008751] text-white border-black hover:bg-[#007042] shadow-[3px_3px_0_0_#111]'
                            }`}
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Follow Us on {selectedPlatform}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Ultimate Download Trigger Section */}
                  <div className="pt-4 border-t-2 border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(2);
                        setSocialClicked(false);
                      }}
                      className="text-[10px] font-black uppercase text-gray-400 hover:text-black transition tracking-wider"
                    >
                      ← Edit details (Name / Passport photo)
                    </button>

                    {/* Locked/Unlocked download element */}
                    <div className="w-full md:w-auto">
                      {socialClicked ? (
                        <motion.button
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (canvasDownloadFnRef.current) {
                              canvasDownloadFnRef.current();
                              setDownloadCounter(prev => prev + 1);
                            }
                          }}
                          className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-[#008751] hover:bg-[#007042] text-white font-black text-base uppercase tracking-widest border-4 border-black shadow-[4px_4px_0_0_#1a1a1a] transition-all cursor-pointer"
                        >
                          <Download className="w-5 h-5 shrink-0" />
                          <span>Download ID Card</span>
                        </motion.button>
                      ) : (
                        <div className="text-center md:text-right space-y-1 bg-gray-50 border border-gray-200 px-5 py-4 w-full">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase">
                            <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
                            Download option currently locked
                          </span>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            Follow our page on {selectedPlatform || "socials"} to release download button
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Celebration download success alert */}
                  {downloadCounter > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 border-2 border-green-300 bg-green-50 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                          <span className="text-green-800 font-extrabold uppercase text-xs block">
                            Credential image successfully generated!
                          </span>
                          <span className="text-[10px] text-green-700 font-bold uppercase font-mono">
                            Welcome to the legacy representing Octaveland &amp; GehGeh.
                          </span>
                        </div>
                      </div>

                      {/* Share Portal Button instead of resetting */}
                      <button 
                        onClick={handleSharePortal}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs border-2 border-slate-900 active:translate-y-0.5 shadow-[2px_2px_0_0_#000] cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Intake Another Wise Student</span>
                      </button>
                    </motion.div>
                  )}

                  {/* Share success toast micro-notif */}
                  <AnimatePresence>
                    {shareSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed bottom-6 right-6 z-[100] bg-black text-white px-5 py-4 border-2 border-[#008751] shadow-2xl flex items-center gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider">Admission Link Copied!</p>
                          <p className="text-[10px] text-gray-400 uppercase mt-0.5 font-bold">Share with other friends to get certified</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>

            </div>
          </motion.div>
        )}

      </main>

      {/* Portal Footer credit and quotes */}
      <footer className="w-full bg-white border-t-2 border-gray-200 py-6 px-4 text-center mt-auto font-mono text-[9px] md:text-xs text-gray-400 space-y-2">
        <p className="max-w-xl mx-auto italic font-bold">
          \"The biggest mistake you can ever make as a premium wise man is having an academic mind block. Always defend relationship metrics.\"
        </p>
        <p className="text-[#008751] font-black uppercase tracking-widest text-[9px] leading-tight flex flex-col sm:flex-row items-center justify-center gap-1">
          <span>© 2026 THE UNIVERSITY OF WISDOM & UNDERSTANDING</span>
          <span className="hidden sm:inline">•</span>
          <span>POWERED BY OCTAVELAND TECHNOLOGIES</span>
        </p>
      </footer>
    </div>
  );
}
