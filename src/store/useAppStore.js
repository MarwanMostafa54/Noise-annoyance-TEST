import create from 'zustand'
import emailjs from '@emailjs/browser'

const initialInterview = { date: '', childName: '', childAge: '', assessorName: '' }

const readPersistedVerified = () => {
  try { return localStorage.getItem('noise_app_isVerified') === '1' } catch (e) { return false }
}

const useAppStore = create((set, get) => ({
  isVerified: readPersistedVerified(),
  interviewDetails: { ...initialInterview },
  selectedSound: '',
  intensityThreshold: 0,
  annoyingFreqRanges: [],
  audioContext: null,
  audioSource: null,
  audioBuffer: null,
  gainNode: null,
  filterNode: null,
  isPlaying: false,

  setVerified: (status) => {
    const val = Boolean(status)
    try { localStorage.setItem('noise_app_isVerified', val ? '1' : '0') } catch (e) {}
    set({ isVerified: val })
  },

  updateInterviewDetails: (field, value) => set((state) => ({ interviewDetails: { ...state.interviewDetails, [field]: value } })),
  setSelectedSound: (s) => set({ selectedSound: s }),

  verificationEmail: '',
  verificationName: '',
  sentOtpCode: '',

  setVerificationDetails: (field, value) => set((state) => ({ [field]: value })),

  generateAndSendOtp: async (name, email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    set({ sentOtpCode: otp, verificationName: name, verificationEmail: email });
    const templateParams = { user_name: name, user_email: email, otp_code: otp };
    try {
      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_a3we77k";
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_3yldkrn";
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "G8fwX4LOLd7deIsjc";
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      return true;
    } catch (error) { console.error('EmailJS Error:', error); return false }
  },

  verifyOtp: (enteredCode) => {
    const { sentOtpCode } = get();
    if (enteredCode && enteredCode === sentOtpCode) {
      try { localStorage.setItem('noise_app_isVerified', '1') } catch (e) {}
      set({ isVerified: true });
      return true;
    }
    return false;
  },

  clearAudio: () => {
    const { audioContext, audioSource } = get();
    if (audioSource) try { audioSource.stop() } catch (e) {}
    if (audioContext) try { audioContext.close() } catch (e) {}
    set({ selectedSound: '', audioContext: null, audioSource: null, gainNode: null, filterNode: null, isPlaying: false })
  },

  loadAudio: async (audioFile) => {
    try {
      let context = get().audioContext
      if (!context) {
        const Ctor = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) || null
        if (!Ctor) throw new Error('Web Audio API is not available in this environment')
        context = new Ctor()
      }
      const prevSource = get().audioSource
      try { if (prevSource && typeof prevSource.stop === 'function') prevSource.stop() } catch (e) {}
      let audioBuffer = null
      if (audioFile instanceof AudioBuffer) audioBuffer = audioFile
      else if (typeof audioFile === 'string') { const res = await fetch(audioFile); const ab = await res.arrayBuffer(); audioBuffer = await context.decodeAudioData(ab) }
      else if (audioFile instanceof Blob) { const ab = await audioFile.arrayBuffer(); audioBuffer = await context.decodeAudioData(ab) }
      else if (audioFile instanceof ArrayBuffer) audioBuffer = await context.decodeAudioData(audioFile)
      else throw new Error('Unsupported audioFile type')
      const createSource = () => { const src = context.createBufferSource(); src.buffer = audioBuffer; src.loop = true; return src }
      const source = createSource(); const gainNode = context.createGain(); const filterNode = context.createBiquadFilter();
      filterNode.type = 'highpass'; filterNode.frequency.value = 20; filterNode.Q.value = 0.1
      source.connect(filterNode); filterNode.connect(gainNode); gainNode.connect(context.destination)
      gainNode.gain.setValueAtTime(0, context.currentTime)
      set({ audioContext: context, audioSource: source, audioBuffer, gainNode, filterNode })
      return true
    } catch (err) { console.error('loadAudio error', err); return false }
  },

  playAudio: () => {
    const { audioContext, audioSource, audioBuffer } = get()
    if (!audioContext) return
    try {
      if (audioSource) {
        try { audioSource.start(0) } catch (e) {
          if (audioBuffer) {
            const src = audioContext.createBufferSource(); src.buffer = audioBuffer; src.loop = true
            const filter = get().filterNode || audioContext.createBiquadFilter()
            const gain = get().gainNode || audioContext.createGain()
            if (!get().filterNode) set({ filterNode: filter }); if (!get().gainNode) set({ gainNode: gain })
            src.connect(filter); filter.connect(gain); gain.connect(audioContext.destination); set({ audioSource: src }); src.start(0)
          }
        }
      } else if (audioBuffer) {
        const src = audioContext.createBufferSource(); src.buffer = audioBuffer; src.loop = true
        const filter = get().filterNode || audioContext.createBiquadFilter(); const gain = get().gainNode || audioContext.createGain()
        if (!get().filterNode) set({ filterNode: filter }); if (!get().gainNode) set({ gainNode: gain })
        src.connect(filter); filter.connect(gain); gain.connect(audioContext.destination); set({ audioSource: src }); src.start(0)
      }
      if (audioContext.state === 'suspended') audioContext.resume()
      set({ isPlaying: true })
    } catch (err) { console.error('playAudio error', err) }
  },

  pauseAudio: async () => { const { audioContext } = get(); if (!audioContext) return; try { await audioContext.suspend(); set({ isPlaying: false }) } catch (err) { console.error('pauseAudio error', err) } },

  resumeAudio: async () => { const { audioContext } = get(); if (!audioContext) return; try { await audioContext.resume(); set({ isPlaying: true }) } catch (err) { console.error('resumeAudio error', err) } },

  setIntensity: (level) => {
    const lvl = Math.max(0, Math.min(1, Number(level) || 0))
    const { gainNode } = get()
    if (gainNode && gainNode.gain) {
      try { gainNode.gain.value = lvl } catch (e) { try { gainNode.gain.setValueAtTime(lvl, (get().audioContext && get().audioContext.currentTime) || 0) } catch (e2) {} }
    }
  },

  setFrequencyRange: (rangeString) => {
    const filter = get().filterNode; if (!filter) return
    const parseVal = (s) => { if (!s) return NaN; const t = s.trim().toLowerCase(); if (t.endsWith('khz')) return parseFloat(t.replace('khz', '')) * 1000; if (t.endsWith('k')) return parseFloat(t.replace('k', '')) * 1000; return parseFloat(t) }
    const parts = rangeString.split('-').map((p) => p.trim()); if (parts.length !== 2) return
    const low = parseVal(parts[0]); const high = parseVal(parts[1]); if (isNaN(low) || isNaN(high) || high <= low) return
    if (low === 0 && high <= 1000) { filter.type = 'lowpass'; filter.frequency.value = Math.max(20, high); filter.Q.value = 1 } else {
      filter.type = 'bandpass'; const center = (low + high) / 2; const bandwidth = Math.max(1, high - low); let Q = center / bandwidth; if (!isFinite(Q) || Q <= 0) Q = 1; Q = Math.min(Math.max(Q, 0.1), 50); filter.frequency.value = Math.max(20, center); filter.Q.value = Q
    }
  },

  saveThreshold: (level) => set({ intensityThreshold: Number(level) || 0 }),

  toggleAnnoyingFreqRange: (range, intensity) => {
    const currentRanges = get().annoyingFreqRanges; const existingRange = currentRanges.find(item => item.range === range)
    if (existingRange) set({ annoyingFreqRanges: currentRanges.filter(item => item.range !== range) })
    else set({ annoyingFreqRanges: [...currentRanges, { range, intensity }] })
  },

  resetState: async () => {
    try { const { audioSource, audioContext } = get(); if (audioSource && typeof audioSource.stop === 'function') try { audioSource.stop() } catch (e) {} if (audioContext && typeof audioContext.close === 'function') try { await audioContext.close() } catch (e) {} } catch (e) {}
    try { localStorage.removeItem('noise_app_isVerified') } catch (e) {}
    set({ isVerified: false, interviewDetails: { ...initialInterview }, selectedSound: '', intensityThreshold: 0, annoyingFreqRanges: [], audioContext: null, audioSource: null, audioBuffer: null, gainNode: null, filterNode: null, isPlaying: false, verificationEmail: '', verificationName: '', sentOtpCode: '' })
  },

  retakeTest: async () => {
    try { const { audioSource, audioContext } = get(); if (audioSource && typeof audioSource.stop === 'function') try { audioSource.stop() } catch (e) {} if (audioContext && typeof audioContext.close === 'function') try { await audioContext.close() } catch (e) {} } catch (e) {}
    set({ interviewDetails: { ...initialInterview }, selectedSound: '', intensityThreshold: 0, annoyingFreqRanges: [], audioContext: null, audioSource: null, audioBuffer: null, gainNode: null, filterNode: null, isPlaying: false })
  }

}))

export default useAppStore
