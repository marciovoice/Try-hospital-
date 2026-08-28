/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Upload, 
  ChevronDown, 
  Sparkles, 
  BookOpen, 
  Compass, 
  Layers, 
  RotateCcw, 
  Sliders, 
  ShieldCheck, 
  Flame, 
  Wind, 
  Droplet,
  Info,
  Check
} from 'lucide-react';

// Milestone definitions mapped to scroll progress (0.0 to 1.0)
interface Milestone {
  range: [number, number];
  title: string;
  sanskrit: string;
  subtitle: string;
  description: string;
  badge: string;
  keyConcepts: string[];
}

const MILESTONES: Milestone[] = [
  {
    range: [0.0, 0.22],
    title: "The Sealed Treatise",
    sanskrit: "चरक संहिता — मूल ग्रन्थ",
    subtitle: "Sacred Foundations of Ancient Longevity",
    description: "The timeless Sanskrit compendium containing the foundational principles of Ayurvedic medicine, diagnostics, and human constitution.",
    badge: "Origin • Sutrasthan",
    keyConcepts: ["Ayus (Longevity)", "Pancha Mahabhuta (Five Elements)", "Dharma & Health"]
  },
  {
    range: [0.22, 0.50],
    title: "Unfolding the Sacred Foliage",
    sanskrit: "ज्ञानोद्गम — पत्र विस्तार",
    subtitle: "Awakening Botanical & Elemental Systems",
    description: "As the leather bindings and golden clasps release, centuries of herbal taxonomy, therapeutic formulations, and holistic anatomy disperse.",
    badge: "Phase I • Expansion",
    keyConcepts: ["Dravya (Substances)", "Guna (Attributes)", "Karma (Therapeutic Action)"]
  },
  {
    range: [0.50, 0.82],
    title: "The Tridosha & Agni Matrix",
    sanskrit: "त्रिदोष — वात • पित्त • कफ • अग्नि",
    subtitle: "Dynamic Biological Equilibrium",
    description: "The multi-dimensional network connecting Vata (Kinetic), Pitta (Metabolic), and Kapha (Structural) forces with Agni, Prakriti, and Rasayana.",
    badge: "Phase II • Core Matrix",
    keyConcepts: ["Vata (Movement)", "Pitta (Transformation)", "Kapha (Cohesion)", "Agni (Digestive Fire)"]
  },
  {
    range: [0.82, 1.0],
    title: "Holistic Integration & Rasayana",
    sanskrit: "समदोषः समाग्निश्च — पूर्ण स्वास्थ्यम्",
    subtitle: "Eternal Synthesis of Body, Mind & Spirit",
    description: "Reconvergence into cellular rejuvenation (Rasayana) and supreme vitality, where individual constitution aligns with the cosmic order.",
    badge: "Phase III • Synthesis",
    keyConcepts: ["Rasayana (Rejuvenation)", "Ojas (Vital Essence)", "Swastha (Supreme Balance)"]
  }
];

export default function App() {
  const [videoSrc, setVideoSrc] = useState<string>('/charaka_samhita.mp4');
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [videoDuration, setVideoDuration] = useState<number>(6.0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [zoomIntensity, setZoomIntensity] = useState<number>(1.25);
  const [scrollTrackHeight, setScrollTrackHeight] = useState<number>(400); // 400vh
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'doshas' | 'treatise'>('matrix');
  const [selectedDosha, setSelectedDosha] = useState<'vata' | 'pitta' | 'kapha'>('vata');
  const [audioFeedback, setAudioFeedback] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef<number>(0);
  const smoothedTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastChimeTimeRef = useRef<number>(0);

  // Initialize Web Audio for gentle meditative tones during scrubbing
  const playScrubChime = useCallback((pitch: number) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      if (now - lastChimeTimeRef.current < 0.18) return;
      lastChimeTimeRef.current = now;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Warm pentatonic frequency mapping
      const baseFreq = 220; // A3
      const freq = baseFreq * (1 + pitch * 1.5);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.04, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // AudioContext fallback
    }
  }, [isMuted]);

  // Video loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 6.0;
      setVideoDuration(dur);
      setVideoLoaded(true);
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Scroll listener tracking relative position inside the hero track
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollableDistance = containerRef.current.offsetHeight - window.innerHeight;
      
      if (totalScrollableDistance <= 0) return;
      
      const currentScroll = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalScrollableDistance));
      
      setScrollProgress(rawProgress);
      const targetTime = rawProgress * (videoDuration || 6.0);
      targetTimeRef.current = targetTime;

      // Meditative audio feedback at milestone thresholds
      if (audioFeedback && Math.abs(rawProgress - (smoothedTimeRef.current / (videoDuration || 6))) > 0.05) {
        playScrubChime(rawProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [videoDuration, audioFeedback, playScrubChime]);

  // High performance RAF LERP loop for buttery-smooth video scrubbing in both directions
  useEffect(() => {
    const updateVideoFrame = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        const target = targetTimeRef.current;
        const current = smoothedTimeRef.current;
        
        // Fast yet organic lerp factor (0.18 for rapid responsive trackpad/mouse sync)
        const diff = target - current;
        if (Math.abs(diff) > 0.001) {
          smoothedTimeRef.current = current + diff * 0.22;
          video.currentTime = smoothedTimeRef.current;
          setCurrentTime(smoothedTimeRef.current);
        } else if (Math.abs(video.currentTime - target) > 0.005) {
          smoothedTimeRef.current = target;
          video.currentTime = target;
          setCurrentTime(target);
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateVideoFrame);
    };

    animationFrameRef.current = requestAnimationFrame(updateVideoFrame);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle custom file upload replacement
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoLoaded(false);
    }
  };

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Current milestone based on scroll progress
  const currentMilestone = MILESTONES.find(
    m => scrollProgress >= m.range[0] && scrollProgress <= m.range[1]
  ) || MILESTONES[0];

  // Dynamic zoom factor based on scroll progress (starts at 1.0, peaks at 1.18 in matrix phase, stabilizes at 1.0)
  const currentZoom = 1.0 + Math.sin(scrollProgress * Math.PI) * (zoomIntensity - 1.0);

  // Jump to specific milestone
  const jumpToProgress = (targetProgress: number) => {
    if (!containerRef.current) return;
    const totalScrollableDistance = containerRef.current.offsetHeight - window.innerHeight;
    const targetScrollY = containerRef.current.offsetTop + targetProgress * totalScrollableDistance;
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative min-h-screen bg-[#090604] text-[#ede3d2] selection:bg-[#c99738]/30 selection:text-[#fff5db]">
      
      {/* Top Floating Glass Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 backdrop-blur-md bg-[#0b0806]/70 border-b border-[#3d2a1a]/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => jumpToProgress(0)}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#c99738] to-[#6d4c1b] p-0.5 shadow-lg shadow-[#c99738]/10 flex items-center justify-center">
              <div className="w-full h-full bg-[#120c08] rounded-[7px] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#e6b95d]" />
              </div>
            </div>
            <div>
              <span className="font-cinzel font-bold text-sm tracking-widest text-[#f5ebd9] uppercase block">
                Charak Samhita
              </span>
              <span className="text-[10px] tracking-wider text-[#9f8569] block font-sans">
                Scroll-Driven Ayurvedic Codex
              </span>
            </div>
          </div>

          {/* Center Milestone Indicator */}
          <div className="hidden md:flex items-center space-x-2 bg-[#17100b]/80 border border-[#3f2b1c]/60 rounded-full px-4 py-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#c99738] animate-pulse" />
            <span className="text-xs font-cinzel font-semibold text-[#e8d7be]">
              {currentMilestone.badge}
            </span>
            <span className="text-xs text-[#7d654f]">•</span>
            <span className="text-xs font-mono text-[#c99738]">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2">
            <button 
              id="audio-toggle-btn"
              onClick={() => {
                setIsMuted(!isMuted);
                setAudioFeedback(!isMuted);
              }}
              title={isMuted ? "Enable Meditative Chimes" : "Mute Sound"}
              className={`p-2 rounded-lg border transition-all ${
                !isMuted 
                  ? 'bg-[#332112] border-[#c99738] text-[#f7d688] shadow-md shadow-[#c99738]/20' 
                  : 'bg-[#140e0a] border-[#2e1f14] text-[#9f8569] hover:text-[#e8dfd8] hover:border-[#4d3420]'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button 
              id="settings-toggle-btn"
              onClick={() => setShowControls(!showControls)}
              title="Animation & Video Settings"
              className={`p-2 rounded-lg border transition-all ${
                showControls 
                  ? 'bg-[#332112] border-[#c99738] text-[#f7d688]' 
                  : 'bg-[#140e0a] border-[#2e1f14] text-[#9f8569] hover:text-[#e8dfd8] hover:border-[#4d3420]'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button 
              id="fullscreen-toggle-btn"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-2 rounded-lg bg-[#140e0a] border border-[#2e1f14] text-[#9f8569] hover:text-[#e8dfd8] hover:border-[#4d3420] transition-all"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            <label 
              id="upload-video-btn"
              title="Upload Custom Video"
              className="p-2 rounded-lg bg-[#140e0a] border border-[#2e1f14] text-[#9f8569] hover:text-[#e8dfd8] hover:border-[#4d3420] transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input 
                type="file" 
                accept="video/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>
          </div>
        </div>
      </header>

      {/* Settings Drawer Modal */}
      {showControls && (
        <div className="fixed top-20 right-6 z-50 w-80 bg-[#120c08]/95 backdrop-blur-xl border border-[#4a3422] rounded-2xl p-5 shadow-2xl text-xs space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-[#362416] pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#c99738]" />
              <h3 className="font-cinzel font-bold text-sm text-[#f0e2ce]">Scroll Engine Settings</h3>
            </div>
            <button 
              onClick={() => setShowControls(false)}
              className="text-[#8e735b] hover:text-[#eedec8]"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[#a89078] mb-1">
                <span>Scroll Track Height</span>
                <span className="font-mono text-[#c99738]">{scrollTrackHeight}vh</span>
              </div>
              <input 
                type="range" 
                min="200" 
                max="700" 
                step="50"
                value={scrollTrackHeight}
                onChange={(e) => setScrollTrackHeight(Number(e.target.value))}
                className="w-full accent-[#c99738] bg-[#22160e] rounded h-1.5 cursor-pointer"
              />
              <span className="text-[10px] text-[#735c46]">Higher values create a more gradual, cinematic scrub.</span>
            </div>

            <div>
              <div className="flex justify-between text-[#a89078] mb-1">
                <span>Peak Zoom Intensity</span>
                <span className="font-mono text-[#c99738]">{zoomIntensity.toFixed(2)}x</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="1.8" 
                step="0.05"
                value={zoomIntensity}
                onChange={(e) => setZoomIntensity(Number(e.target.value))}
                className="w-full accent-[#c99738] bg-[#22160e] rounded h-1.5 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-[#362416] flex items-center justify-between">
              <span className="text-[#a89078]">Video Time Seek</span>
              <span className="font-mono text-[#e5be6b]">
                {currentTime.toFixed(2)}s / {videoDuration.toFixed(2)}s
              </span>
            </div>

            <button
              onClick={() => {
                setVideoSrc('/charaka_samhita.mp4');
                setZoomIntensity(1.25);
                setScrollTrackHeight(400);
              }}
              className="w-full py-2 bg-[#20150d] hover:bg-[#2b1c11] border border-[#3b2717] rounded-lg text-[#c5a67a] flex items-center justify-center space-x-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          HERO SCROLL TRACK CONTAINER (STICKY FULL-SCREEN VIDEO STAGE)
         ========================================================================= */}
      <section 
        ref={containerRef} 
        id="hero-scroll-container"
        style={{ height: `${scrollTrackHeight}vh` }}
        className="relative w-full"
      >
        {/* Sticky Fullscreen Frame */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#070403] flex items-center justify-center">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(184,134,11,0.12)_0%,rgba(7,4,3,0.95)_75%)]" />

          {/* Main Full-Screen Video Canvas Layer */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src={videoSrc}
              preload="auto"
              muted
              playsInline
              disableRemotePlayback
              onLoadedMetadata={handleLoadedMetadata}
              style={{
                transform: `scale(${currentZoom})`,
                transition: 'transform 0.1s ease-out',
                filter: 'contrast(1.06) saturate(1.1) brightness(0.98)'
              }}
              className="w-full h-full object-contain md:object-cover pointer-events-none select-none"
            />
          </div>

          {/* Top & Bottom Cinematic Vignette Masks */}
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#090604] via-[#090604]/60 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#090604] via-[#090604]/80 to-transparent pointer-events-none" />

          {/* Left Decorative Gold Ruler Accent */}
          <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col items-center space-y-4 pointer-events-none">
            <div className="w-px h-16 bg-gradient-to-b from-transparent to-[#c99738]/50" />
            <span className="text-[10px] font-cinzel text-[#8f7457] -rotate-90 tracking-widest uppercase">
              चरक संहिता
            </span>
            <div className="w-px h-16 bg-gradient-to-t from-transparent to-[#c99738]/50" />
          </div>

          {/* Floating Milestone Text Overlay (Appears contextually during scroll scrubbing) */}
          <div className="absolute inset-x-0 bottom-24 md:bottom-20 z-20 px-6 pointer-events-none flex flex-col items-center text-center">
            <div className="max-w-3xl mx-auto space-y-3">
              
              {/* Sanskrit Epithet Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#180f0a]/80 backdrop-blur-md border border-[#c99738]/40 shadow-lg shadow-[#c99738]/5 animate-in fade-in zoom-in-95 duration-300">
                <Sparkles className="w-3.5 h-3.5 text-[#e5be6b]" />
                <span className="text-xs font-cinzel font-semibold text-[#f5ebd9] tracking-wider">
                  {currentMilestone.sanskrit}
                </span>
              </div>

              {/* Dynamic Headline */}
              <h1 className="font-cinzel text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#fff5ea] drop-shadow-md">
                {currentMilestone.title}
              </h1>

              {/* Subtitle & Narrative */}
              <p className="text-sm md:text-base text-[#c7b29a] max-w-2xl mx-auto line-clamp-2 drop-shadow">
                {currentMilestone.description}
              </p>

              {/* Key Concept Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {currentMilestone.keyConcepts.map((concept, i) => (
                  <span 
                    key={i}
                    className="text-[11px] font-sans px-3 py-0.5 rounded-full bg-[#1f130b]/70 border border-[#422c19] text-[#dec29b]"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Timeline Scrub Bar along Bottom */}
          <div className="absolute bottom-6 inset-x-0 z-30 px-6 max-w-4xl mx-auto pointer-events-auto">
            <div className="bg-[#120c08]/90 backdrop-blur-md border border-[#3d2a1a]/80 rounded-2xl p-3 shadow-2xl">
              <div className="flex items-center justify-between mb-2 text-xs">
                <div className="flex items-center space-x-2">
                  <Compass className="w-3.5 h-3.5 text-[#c99738]" />
                  <span className="font-cinzel font-semibold text-[#f0e3cf]">
                    Scroll Animation Progress
                  </span>
                </div>
                <div className="flex items-center space-x-3 font-mono">
                  <span className="text-[#8c745d]">
                    {currentTime.toFixed(1)}s / {videoDuration.toFixed(1)}s
                  </span>
                  <span className="text-[#c99738] font-bold">
                    {Math.round(scrollProgress * 100)}%
                  </span>
                </div>
              </div>

              {/* Interactive Milestone Jump Marks on Progress Bar */}
              <div className="relative w-full h-3 bg-[#1e130c] rounded-full overflow-hidden flex items-center cursor-pointer">
                {/* Active Progress Fill */}
                <div 
                  className="h-full bg-gradient-to-r from-[#8b6520] via-[#c99738] to-[#f4d17c] rounded-full transition-all duration-75"
                  style={{ width: `${scrollProgress * 100}%` }}
                />

                {/* Milestone Node Markers */}
                {MILESTONES.map((m, idx) => {
                  const markPct = m.range[0] * 100;
                  const isActive = scrollProgress >= m.range[0];
                  return (
                    <div
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToProgress(m.range[0]);
                      }}
                      title={`Jump to ${m.title}`}
                      style={{ left: `${markPct}%` }}
                      className={`absolute w-3 h-3 -ml-1.5 rounded-full border-2 transition-all ${
                        isActive 
                          ? 'bg-[#f4d17c] border-[#38210e] scale-110' 
                          : 'bg-[#2a1b12] border-[#553a23]'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Milestone Shortcut Chips */}
              <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                {MILESTONES.map((m, idx) => {
                  const isCurrent = scrollProgress >= m.range[0] && scrollProgress <= m.range[1];
                  return (
                    <button
                      key={idx}
                      onClick={() => jumpToProgress(m.range[0])}
                      className={`py-1 px-2 rounded-lg text-[10px] font-cinzel text-center truncate transition-all ${
                        isCurrent 
                          ? 'bg-[#362112] text-[#f7d688] border border-[#c99738]/60 font-bold shadow-sm' 
                          : 'bg-[#150e09] text-[#856e58] hover:text-[#d3beaa] border border-transparent'
                      }`}
                    >
                      {m.badge.split(' • ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Initial Scroll Prompt (Fades out once scrolling begins) */}
          <div 
            style={{ 
              opacity: Math.max(0, 1 - scrollProgress * 5),
              pointerEvents: scrollProgress > 0.1 ? 'none' : 'auto'
            }}
            className="absolute bottom-36 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 text-center transition-opacity duration-300 pointer-events-none"
          >
            <div className="w-6 h-10 rounded-full border-2 border-[#c99738]/60 p-1 flex justify-center">
              <div className="w-1 h-2 bg-[#c99738] rounded-full animate-bounce" />
            </div>
            <span className="text-xs font-cinzel tracking-widest text-[#d8c3a5] uppercase">
              Scroll Down to Unfold the Tome
            </span>
          </div>

        </div>
      </section>

      {/* =========================================================================
          NEXT SECTION (FLOWS SEAMLESSLY WHEN VIDEO REACHES ITS FINAL FRAME)
         ========================================================================= */}
      <main id="codex-content-section" className="relative z-30 bg-[#0b0806] border-t border-[#312014] py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#180f0a] border border-[#c99738]/30">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c99738]" />
              <span className="text-xs font-cinzel font-semibold text-[#e8d5be] tracking-wider">
                Vedic Medical Canon
              </span>
            </div>
            <h2 className="font-cinzel text-3xl md:text-5xl font-bold text-[#f5eedf]">
              The Core Architecture of Ayurvedic Medicine
            </h2>
            <p className="text-[#a48e78] text-base leading-relaxed">
              Synthesized by Sage Agnivesha and redacted by Maharishi Charaka over two millennia ago, the Charak Samhita is the definitive compendium of internal medicine (Kaya Chikitsa).
            </p>
          </div>

          {/* Interactive Navigation Tabs for Knowledge Exploration */}
          <div className="flex justify-center border-b border-[#2d1e13]">
            <div className="flex space-x-2 md:space-x-8">
              {[
                { id: 'matrix', label: 'Tridosha Matrix', icon: Layers },
                { id: 'doshas', label: 'Dosha Diagnostics', icon: Compass },
                { id: 'treatise', label: 'The 8 Sthanas (Divisions)', icon: BookOpen }
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center space-x-2 py-4 px-3 border-b-2 font-cinzel text-sm font-semibold transition-all ${
                      active 
                        ? 'border-[#c99738] text-[#f7d688]' 
                        : 'border-transparent text-[#7d6753] hover:text-[#baa48d]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab 1: Interactive Matrix */}
          {activeTab === 'matrix' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Card 1: Vata */}
              <div className="bg-[#120c08] border border-[#312014] hover:border-[#c99738]/50 rounded-2xl p-7 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#21140c] border border-[#442b1a] flex items-center justify-center mb-5 text-[#8dc7ff] group-hover:scale-105 transition-transform">
                  <Wind className="w-6 h-6 text-[#9bcaff]" />
                </div>
                <span className="text-xs font-mono text-[#8dc7ff] uppercase tracking-wider block mb-1">
                  Air & Space • Kinetic Principle
                </span>
                <h3 className="font-cinzel text-2xl font-bold text-[#f5ebd9] mb-2">Vata (वात)</h3>
                <p className="text-sm text-[#a48e78] mb-6 leading-relaxed">
                  Governs cellular communication, respiration, nervous impulse transmission, and sensory perception.
                </p>
                <div className="space-y-2 text-xs border-t border-[#26180e] pt-4">
                  <div className="flex justify-between text-[#856e58]">
                    <span>Key Site:</span>
                    <span className="text-[#e2d0b8] font-medium">Colon & Nervous System</span>
                  </div>
                  <div className="flex justify-between text-[#856e58]">
                    <span>Balanced State:</span>
                    <span className="text-[#e2d0b8] font-medium">Creativity, Clarity, Vitality</span>
                  </div>
                  <div className="flex justify-between text-[#856e58]">
                    <span>Aggravating Factors:</span>
                    <span className="text-[#e2d0b8] font-medium">Cold, Dryness, Irregularity</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Pitta */}
              <div className="bg-[#120c08] border border-[#312014] hover:border-[#c99738]/50 rounded-2xl p-7 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#21140c] border border-[#442b1a] flex items-center justify-center mb-5 text-[#ff9f68] group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6 text-[#ffa658]" />
                </div>
                <span className="text-xs font-mono text-[#ffa658] uppercase tracking-wider block mb-1">
                  Fire & Water • Metabolic Principle
                </span>
                <h3 className="font-cinzel text-2xl font-bold text-[#f5ebd9] mb-2">Pitta (पित्त)</h3>
                <p className="text-sm text-[#a48e78] mb-6 leading-relaxed">
                  Regulates digestion, enzyme production, body temperature, hormonal synthesis, and intellectual brilliance.
                </p>
                <div className="space-y-2 text-xs border-t border-[#26180e] pt-4">
                  <div className="flex justify-between text-[#856e58]">
                    <span>Key Site:</span>
                    <span className="text-[#e2d0b8] font-medium">Small Intestine & Liver</span>
                  </div>
                  <div className="flex justify-between text-[#856e58]">
                    <span>Balanced State:</span>
                    <span className="text-[#e2d0b8] font-medium">Sharp Intellect, Robust Agni</span>
                  </div>
                  <div className="flex justify-between text-[#856e58]">
                    <span>Aggravating Factors:</span>
                    <span className="text-[#e2d0b8] font-medium">Excess Heat, Pungency, Anger</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Kapha */}
              <div className="bg-[#120c08] border border-[#312014] hover:border-[#c99738]/50 rounded-2xl p-7 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#21140c] border border-[#442b1a] flex items-center justify-center mb-5 text-[#9be898] group-hover:scale-105 transition-transform">
                  <Droplet className="w-6 h-6 text-[#9be898]" />
                </div>
                <span className="text-xs font-mono text-[#9be898] uppercase tracking-wider block mb-1">
                  Earth & Water • Structural Principle
                </span>
                <h3 className="font-cinzel text-2xl font-bold text-[#f5ebd9] mb-2">Kapha (कफ)</h3>
                <p className="text-sm text-[#a48e78] mb-6 leading-relaxed">
                  Provides anatomical lubricity, cellular hydration, skeletal density, physical stamina, and psychological calm.
                </p>
                <div className="space-y-2 text-xs border-t border-[#26180e] pt-4">
                  <div className="flex justify-between text-[#856e58]">
                    <span>Key Site:</span>
                    <span className="text-[#e2d0b8] font-medium">Chest, Stomach & Joints</span>
                  </div>
                  <div className="flex justify-between text-[#856e58]">
                    <span>Balanced State:</span>
                    <span className="text-[#e2d0b8] font-medium">Immunity (Ojas), Endurance</span>
                  </div>
                  <div className="flex justify-between text-[#856e58]">
                    <span>Aggravating Factors:</span>
                    <span className="text-[#e2d0b8] font-medium">Sedentary Habits, Dampness</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Dosha Diagnostics */}
          {activeTab === 'doshas' && (
            <div className="bg-[#130d09] border border-[#312014] rounded-3xl p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="space-y-4">
                  <h3 className="font-cinzel text-2xl font-bold text-[#f4ecd9]">
                    Individual Constitution (Prakriti)
                  </h3>
                  <p className="text-sm text-[#9f8872] leading-relaxed">
                    According to Charak Samhita, every individual is born with a unique genetic equilibrium of the three doshas established at conception.
                  </p>
                  <div className="flex flex-col space-y-2 pt-2">
                    {[
                      { id: 'vata', label: 'Vata Predominance', color: 'border-[#4a729e]' },
                      { id: 'pitta', label: 'Pitta Predominance', color: 'border-[#a85a2b]' },
                      { id: 'kapha', label: 'Kapha Predominance', color: 'border-[#448240]' }
                    ].map(btn => (
                      <button
                        key={btn.id}
                        onClick={() => setSelectedDosha(btn.id as typeof selectedDosha)}
                        className={`py-3 px-4 rounded-xl text-left font-cinzel text-xs font-semibold border transition-all ${
                          selectedDosha === btn.id 
                            ? `bg-[#24170f] text-[#f7d688] ${btn.color} shadow-lg` 
                            : 'bg-[#180f0a] text-[#8a725b] border-[#291b11] hover:text-[#d3beaa]'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-[#1c120b] border border-[#382416] rounded-2xl p-7 space-y-6">
                  {selectedDosha === 'vata' && (
                    <>
                      <div className="flex items-center justify-between border-b border-[#2d1d12] pb-4">
                        <div>
                          <h4 className="font-cinzel text-xl font-bold text-[#f0e3d0]">Vata Constitutional Protocol</h4>
                          <span className="text-xs text-[#7d9ebc]">Dry • Light • Cold • Rough • Subtle • Mobile</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#172738] text-[#8ec5ff] text-xs font-mono">
                          Air + Akasha
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-[#140c07] p-4 rounded-xl border border-[#2b1b11]">
                          <span className="font-cinzel font-bold text-[#c99738] block mb-2">Recommended Nutrition (Ahara)</span>
                          <ul className="space-y-1.5 text-[#a8937d]">
                            <li>• Warm, unctuous soups with pure cow's ghee</li>
                            <li>• Sweet, sour, and salty rasas (tastes)</li>
                            <li>• Cooked root vegetables & soaked almonds</li>
                          </ul>
                        </div>
                        <div className="bg-[#140c07] p-4 rounded-xl border border-[#2b1b11]">
                          <span className="font-cinzel font-bold text-[#c99738] block mb-2">Daily Regimen (Dinacharya)</span>
                          <ul className="space-y-1.5 text-[#a8937d]">
                            <li>• Warm sesame oil self-massage (Abhyanga)</li>
                            <li>• Consistent sleep schedule before 10 PM</li>
                            <li>• Grounding, meditative breathwork (Nadi Shodhana)</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedDosha === 'pitta' && (
                    <>
                      <div className="flex items-center justify-between border-b border-[#2d1d12] pb-4">
                        <div>
                          <h4 className="font-cinzel text-xl font-bold text-[#f0e3d0]">Pitta Constitutional Protocol</h4>
                          <span className="text-xs text-[#d87c4a]">Hot • Sharp • Light • Acidic • Spreading</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#381c12] text-[#ffa372] text-xs font-mono">
                          Agni + Jala
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-[#140c07] p-4 rounded-xl border border-[#2b1b11]">
                          <span className="font-cinzel font-bold text-[#c99738] block mb-2">Recommended Nutrition (Ahara)</span>
                          <ul className="space-y-1.5 text-[#a8937d]">
                            <li>• Cooling botanical infusions (Coriander, Rose, Mint)</li>
                            <li>• Sweet, bitter, and astringent rasas</li>
                            <li>• Coconut water, melons, and fresh basmati rice</li>
                          </ul>
                        </div>
                        <div className="bg-[#140c07] p-4 rounded-xl border border-[#2b1b11]">
                          <span className="font-cinzel font-bold text-[#c99738] block mb-2">Daily Regimen (Dinacharya)</span>
                          <ul className="space-y-1.5 text-[#a8937d]">
                            <li>• Cooling moonlight walks & Sheetali Pranayama</li>
                            <li>• Coconut oil massage during peak midday warmth</li>
                            <li>• Moderation in competitive mental exertion</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedDosha === 'kapha' && (
                    <>
                      <div className="flex items-center justify-between border-b border-[#2d1d12] pb-4">
                        <div>
                          <h4 className="font-cinzel text-xl font-bold text-[#f0e3d0]">Kapha Constitutional Protocol</h4>
                          <span className="text-xs text-[#6fa36b]">Heavy • Slow • Cool • Oily • Smooth • Dense</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#183017] text-[#9df597] text-xs font-mono">
                          Prithvi + Jala
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-[#140c07] p-4 rounded-xl border border-[#2b1b11]">
                          <span className="font-cinzel font-bold text-[#c99738] block mb-2">Recommended Nutrition (Ahara)</span>
                          <ul className="space-y-1.5 text-[#a8937d]">
                            <li>• Pungent, bitter, and astringent spices (Ginger, Pippali)</li>
                            <li>• Warm honey water & light millet grains</li>
                            <li>• Fasting intervals and reduction of heavy fats</li>
                          </ul>
                        </div>
                        <div className="bg-[#140c07] p-4 rounded-xl border border-[#2b1b11]">
                          <span className="font-cinzel font-bold text-[#c99738] block mb-2">Daily Regimen (Dinacharya)</span>
                          <ul className="space-y-1.5 text-[#a8937d]">
                            <li>• Vigorous dry herbal powder massage (Udvartana)</li>
                            <li>• Early rising before sunrise (Brahma Muhurta)</li>
                            <li>• Dynamic physical activity and Surya Namaskar</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: The 8 Divisions (Sthanas) */}
          {activeTab === 'treatise' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { name: 'Sutrasthana', chapters: '30 Chapters', topic: 'General principles, dietetics, philosophy & pharmacology' },
                { name: 'Nidanasthana', chapters: '8 Chapters', topic: 'Pathology & diagnosis of eight major diseases' },
                { name: 'Vimanasthana', chapters: '8 Chapters', topic: 'Methodology, pharmacology measurements & epidemiology' },
                { name: 'Sharirasthana', chapters: '8 Chapters', topic: 'Human embryology, anatomy & metaphysics' },
                { name: 'Indriyasthana', chapters: '12 Chapters', topic: 'Prognostics and sensory clinical signs of life expectancy' },
                { name: 'Chikitsasthana', chapters: '30 Chapters', topic: 'Therapeutics, specialized treatments & rejuvenation formulas' },
                { name: 'Kalpasthana', chapters: '12 Chapters', topic: 'Pharmacy formulations and therapeutic purgatives' },
                { name: 'Siddhisthana', chapters: '12 Chapters', topic: 'Success in clinical panchakarma administration' },
              ].map((sth, i) => (
                <div key={i} className="bg-[#120c08] border border-[#2b1c11] rounded-2xl p-6 hover:border-[#c99738]/40 transition-all">
                  <span className="text-[10px] font-mono text-[#c99738] block mb-1">Book {i + 1}</span>
                  <h4 className="font-cinzel text-lg font-bold text-[#f5ebd9] mb-1">{sth.name}</h4>
                  <span className="text-xs text-[#8c745d] block mb-3">{sth.chapters}</span>
                  <p className="text-xs text-[#a6917c] leading-relaxed">{sth.topic}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sanskrit Golden Quote Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#21140c] via-[#160d08] to-[#0c0704] border border-[#483321] p-10 md:p-14 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,151,56,0.08)_0%,transparent_70%)]" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-cinzel text-[#e5be6b] uppercase tracking-widest block">
                Charak Samhita Sutrasthana (1.41)
              </span>
              <p className="font-cinzel text-xl md:text-2xl font-bold text-[#fff4e0] italic leading-relaxed">
                "हिताहितं सुखं दुःखमायुस्तस्य हिताहितम् ।<br className="hidden md:block"/>
                मानं च तच्च यत्रोक्तमायुर्वेदः स उच्यते ॥"
              </p>
              <p className="text-sm text-[#bda893]">
                "That wisdom which defines the beneficial and harmful, the joyful and sorrowful states of life, together with their measurements and nature—that is declared as Ayurveda."
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-[#291b11] pt-8 pb-12 flex flex-col md:flex-row items-center justify-between text-xs text-[#7f6a55] gap-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#c99738]" />
              <span className="font-cinzel text-[#d3beaa]">Charak Samhita Experience</span>
              <span>•</span>
              <span>Scroll-Controlled Video Engine</span>
            </div>
            <button
              onClick={() => jumpToProgress(0)}
              className="hover:text-[#f0dfcc] flex items-center space-x-1 transition-colors"
            >
              <span>Back to Hero Beginning</span>
              <ChevronDown className="w-3.5 h-3.5 rotate-180" />
            </button>
          </footer>

        </div>
      </main>

    </div>
  );
}
