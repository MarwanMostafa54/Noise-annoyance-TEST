import create from 'zustand'
import emailjs from '@emailjs/browser'

const initialInterview = {
  date: '',
  childName: '',
  childAge: '',
  assessorName: ''
}

const useAppStore = create((set, get) => ({
  // state
  isVerified: false,
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

  // actions
  setVerified: (status) => set({ isVerified: Boolean(status) }),

  updateInterviewDetails: (field, value) =>
    set((state) => ({
      interviewDetails: { ...state.interviewDetails, [field]: value }
    })),

  setSelectedSound: (s) => set({ selectedSound: s }),

  // verification fields for the OTP flow
  verificationEmail: '',
  verificationName: '',
  sentOtpCode: '',

  setVerificationDetails: (field, value) =>
    set((state) => ({ [field]: value })),

  generateAndSendOtp: async (name, email) => {
    // 1. Generate a 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    set({ sentOtpCode: otp, verificationName: name, verificationEmail: email });

    // 2. Prepare the email template parameters
    const templateParams = {
      user_name: name,
      user_email: email,
      otp_code: otp,
    };

    // 3. Send the email via EmailJS
    try {
      // !!! PASTE YOUR 3 KEYS FROM EMAILJS HERE !!!
      const SERVICE_ID = "service_a3we77k";
      const TEMPLATE_ID = "template_3yldkrn";
      const PUBLIC_KEY = "G8fwX4LOLd7deIsjc";

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      return true; // Success
    } catch (error) {
      console.error('EmailJS Error:', error);
      return false; // Failure
    }
  },

  verifyOtp: (enteredCode) => {
    const { sentOtpCode } = get();
    if (enteredCode && enteredCode === sentOtpCode) {
      set({ isVerified: true });
      return true;
    }
    return false;
  },

  clearAudio: () => {
    const { audioContext, audioSource } = get();
    
    if (audioSource) {
      try {
        audioSource.stop();
      } catch (e) {
        // Audio might not have started yet, which is fine
      }
    }
    if (audioContext) {
      audioContext.close();
    }
    
    set({
      selectedSound: '',
      audioContext: null,
      audioSource: null,
      gainNode: null,
      filterNode: null,
      isPlaying: false
    });
  },

  // loadAudio supports: URL (string), File/Blob, ArrayBuffer, or AudioBuffer
  loadAudio: async (audioFile) => {
    const getNumeric = (v) => {
      if (typeof v === 'number') return v
      if (typeof v !== 'string') return NaN
      const normalized = v.trim().toLowerCase()
      if (normalized.endsWith('khz')) return parseFloat(normalized.replace('khz', '')) * 1000
      if (normalized.endsWith('k')) return parseFloat(normalized.replace('k', '')) * 1000
      return parseFloat(normalized)
    }

    try {
      // create audio context if missing
      let context = get().audioContext
      if (!context) {
        const Ctor = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) || null
        if (!Ctor) throw new Error('Web Audio API is not available in this environment')
        context = new Ctor()
      }

      // stop and cleanup previous source if present
      const prevSource = get().audioSource
      try {
        if (prevSource && typeof prevSource.stop === 'function') {
          prevSource.stop()
        }
      } catch (e) {
        // ignore
      }

      // obtain AudioBuffer
      let audioBuffer = null
      if (audioFile instanceof AudioBuffer) {
        audioBuffer = audioFile
      } else if (typeof audioFile === 'string') {
        const res = await fetch(audioFile)
        const ab = await res.arrayBuffer()
        audioBuffer = await context.decodeAudioData(ab)
      } else if (audioFile instanceof Blob) {
        const ab = await audioFile.arrayBuffer()
        audioBuffer = await context.decodeAudioData(ab)
      } else if (audioFile instanceof ArrayBuffer) {
        audioBuffer = await context.decodeAudioData(audioFile)
      } else {
        throw new Error('Unsupported audioFile type')
      }

      // helper to create a source from buffer (AudioBufferSourceNodes are single-use)
      const createSource = () => {
        const src = context.createBufferSource()
        src.buffer = audioBuffer
        src.loop = true
        return src
      }

      const source = createSource()
      const gainNode = context.createGain()
      const filterNode = context.createBiquadFilter()
      
      // Initialize filter to pass all frequencies (no filtering)
      filterNode.type = 'highpass'
      filterNode.frequency.value = 20 // Very low frequency - essentially no filtering
      filterNode.Q.value = 0.1

      // connect: source -> filter -> gain -> destination
      source.connect(filterNode)
      filterNode.connect(gainNode)
      gainNode.connect(context.destination)

      // Initialize gain to 0 to prevent loud audio on first play
      gainNode.gain.setValueAtTime(0, context.currentTime)

      // store in state
      set({
        audioContext: context,
        audioSource: source,
        audioBuffer,
        gainNode,
        filterNode
      })

      return true
    } catch (err) {
      console.error('loadAudio error', err)
      return false
    }
  },

  playAudio: () => {
    const { audioContext, audioSource, audioBuffer, gainNode } = get()
    if (!audioContext) return

    try {
      // If source exists and has not been started, start it.
      if (audioSource) {
        try {
          audioSource.start(0)
        } catch (e) {
          // start can only be called once on a BufferSource. recreate it using the stored buffer
          if (audioBuffer) {
            const src = audioContext.createBufferSource()
            src.buffer = audioBuffer
            src.loop = true
            const filter = get().filterNode || audioContext.createBiquadFilter()
            const gain = get().gainNode || audioContext.createGain()
            if (!get().filterNode) set({ filterNode: filter })
            if (!get().gainNode) set({ gainNode: gain })
            src.connect(filter)
            filter.connect(gain)
            gain.connect(audioContext.destination)
            set({ audioSource: src })
            src.start(0)
          }
        }
      } else if (audioBuffer) {
        // create a fresh source
        const src = audioContext.createBufferSource()
        src.buffer = audioBuffer
        src.loop = true
        const filter = get().filterNode || audioContext.createBiquadFilter()
        const gain = get().gainNode || audioContext.createGain()
        if (!get().filterNode) set({ filterNode: filter })
        if (!get().gainNode) set({ gainNode: gain })
        src.connect(filter)
        filter.connect(gain)
        gain.connect(audioContext.destination)
        set({ audioSource: src })
        src.start(0)
      }

      // resume the context if it was suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }

      set({ isPlaying: true })
    } catch (err) {
      console.error('playAudio error', err)
    }
  },

  pauseAudio: async () => {
    const { audioContext } = get()
    if (!audioContext) return
    try {
      await audioContext.suspend()
      set({ isPlaying: false })
    } catch (err) {
      console.error('pauseAudio error', err)
    }
  },

  resumeAudio: async () => {
    const { audioContext } = get()
    if (!audioContext) return
    try {
      await audioContext.resume()
      set({ isPlaying: true })
    } catch (err) {
      console.error('resumeAudio error', err)
    }
  },

  setIntensity: (level) => {
    const lvl = Math.max(0, Math.min(1, Number(level) || 0))
    const { gainNode } = get()
    if (gainNode && gainNode.gain) {
      try {
        gainNode.gain.value = lvl
      } catch (e) {
        // some browsers require setValueAtTime
        try {
          gainNode.gain.setValueAtTime(lvl, (get().audioContext && get().audioContext.currentTime) || 0)
        } catch (e2) {
          // ignore
        }
      }
    }
    // do not implicitly save threshold here; user can call saveThreshold if desired
  },

  setFrequencyRange: (rangeString) => {
    const filter = get().filterNode
    if (!filter) return

    // parse "low-high" strings like "0-1k" or "1k-2k"
    const parseVal = (s) => {
      if (!s) return NaN
      const t = s.trim().toLowerCase()
      if (t.endsWith('khz')) return parseFloat(t.replace('khz', '')) * 1000
      if (t.endsWith('k')) return parseFloat(t.replace('k', '')) * 1000
      return parseFloat(t)
    }

    const parts = rangeString.split('-').map((p) => p.trim())
    if (parts.length !== 2) return
    const low = parseVal(parts[0])
    const high = parseVal(parts[1])
    if (isNaN(low) || isNaN(high) || high <= low) return

    if (low === 0 && high <= 1000) {
      // lowpass
      filter.type = 'lowpass'
      filter.frequency.value = Math.max(20, high)
      filter.Q.value = 1
    } else {
      // bandpass
      filter.type = 'bandpass'
      const center = (low + high) / 2
      const bandwidth = Math.max(1, high - low)
      // Q = center / bandwidth (approx). Limit to reasonable range.
      let Q = center / bandwidth
      if (!isFinite(Q) || Q <= 0) Q = 1
      Q = Math.min(Math.max(Q, 0.1), 50)
      filter.frequency.value = Math.max(20, center)
      filter.Q.value = Q
    }
  },

  saveThreshold: (level) => set({ intensityThreshold: Number(level) || 0 }),

  toggleAnnoyingFreqRange: (range, intensity) => {
    const currentRanges = get().annoyingFreqRanges
    const existingRange = currentRanges.find(item => item.range === range)

    if (existingRange) {
      // If marked, unmark it by filtering it out
      set({
        annoyingFreqRanges: currentRanges.filter(item => item.range !== range)
      })
    } else {
      // If not marked, mark it by adding the new object
      set({
        annoyingFreqRanges: [...currentRanges, { range, intensity }]
      })
    }
  },

  resetState: async () => {
    // stop audio and close context
    try {
      const { audioSource, audioContext } = get()
      if (audioSource && typeof audioSource.stop === 'function') {
        try {
          audioSource.stop()
        } catch (e) {
          // ignore
        }
      }
      if (audioContext && typeof audioContext.close === 'function') {
        try {
          await audioContext.close()
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }

    // reset to defaults
    set({
      isVerified: false,
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
      verificationEmail: '',
      verificationName: '',
      sentOtpCode: ''
    })
  }
}))

export default useAppStore
