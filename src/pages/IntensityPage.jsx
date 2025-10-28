import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaPlay, FaPause } from 'react-icons/fa'
import useAppStore from '../store/useAppStore'

export default function IntensityPage() {
  const isPlaying = useAppStore((s) => s.isPlaying)
  const audioContext = useAppStore((s) => s.audioContext)
  const audioSource = useAppStore((s) => s.audioSource)
  const playAudio = useAppStore((s) => s.playAudio)
  const pauseAudio = useAppStore((s) => s.pauseAudio)
  const resumeAudio = useAppStore((s) => s.resumeAudio)
  const setIntensity = useAppStore((s) => s.setIntensity)
  const saveThreshold = useAppStore((s) => s.saveThreshold)
  const intensityThreshold = useAppStore((s) => s.intensityThreshold)

  const [currentIntensity, setCurrentIntensity] = useState(50) // Start at 50

  // Initialize audio gain to match slider position on mount
  useEffect(() => {
    // Set initial slider value
    const initialSliderValue = 50 // Start at 50
    setCurrentIntensity(initialSliderValue)
    
    // Always set the intensity to match the slider, regardless of audio state
    setIntensity(initialSliderValue / 100)
  }, [audioSource, setIntensity]) // Re-run when audioSource changes

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio()
      return
    }

    if (audioContext && audioContext.state === 'suspended') {
      resumeAudio()
    } else {
      playAudio()
    }
  }

  const onChange = (e) => {
    const v = Number(e.target.value)
    setCurrentIntensity(v)
    setIntensity(v / 100)
  }

  const onSave = () => {
    saveThreshold(Number(currentIntensity))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10 md:p-12 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Intensity Test</h2>
        <p className="text-gray-600 mb-10 text-center">Play the sound and adjust the slider to find the level that is annoying for the child.</p>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="bg-gradient-to-br from-blue-500 to-green-400 text-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg hover:shadow-xl transition-all mb-10"
        >
          {isPlaying ? <FaPause className="text-3xl" /> : <FaPlay className="text-3xl ml-1" />}
        </button>

        {/* Intensity Slider */}
        <div className="w-full mb-10">
          <div className="flex justify-between mb-2">
            <label htmlFor="intensity" className="text-sm font-medium text-gray-700">Intensity</label>
            <span className="text-sm font-bold text-blue-600">{currentIntensity} dB</span>
          </div>
          <div className="relative">
            <input
              type="range"
              id="intensity"
              min="0"
              max="100"
              step="1"
              value={currentIntensity}
              onChange={onChange}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 relative z-20"
            />
            {intensityThreshold > 0 && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-red-500 rounded-full z-10"
                style={{
                  left: `${intensityThreshold}%`,
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none'
                }}
                title={`Saved Threshold: ${intensityThreshold} dB`}
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-4">
          <button 
            onClick={onSave} 
            className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all"
          >
            Save Threshold
          </button>
          <Link 
            to="/frequency" 
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-all text-center"
          >
            Next Step
          </Link>
        </div>
      </div>
    </div>
  )
}
