import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import useAppStore from '../store/useAppStore'

export default function FrequencyPage() {
  const isPlaying = useAppStore((s) => s.isPlaying)
  const audioContext = useAppStore((s) => s.audioContext)
  const playAudio = useAppStore((s) => s.playAudio)
  const pauseAudio = useAppStore((s) => s.pauseAudio)
  const resumeAudio = useAppStore((s) => s.resumeAudio)
  const setIntensity = useAppStore((s) => s.setIntensity)
  const intensityThreshold = useAppStore((s) => s.intensityThreshold)
  const setFrequencyRange = useAppStore((s) => s.setFrequencyRange)
  const toggleAnnoyingFreqRange = useAppStore((s) => s.toggleAnnoyingFreqRange)
  const annoyingFreqRanges = useAppStore((s) => s.annoyingFreqRanges)

  const freqRanges = ['0-1k', '1-2k', '2-3k', '3-4k', '4-5k', '5-6k', '6-7k', '7-8k', '8-9k', '9-10k', '10-11k', '11-12k', '12-13k', '13-14k', '14-15k', '15-16k', '16-17k', '17-18k', '18-19k', '19-20k']

  // Calculate max level based on threshold
  const maxLevel = intensityThreshold - 10
  const safeMaxLevel = Math.max(0, maxLevel)

  const [activeRange, setActiveRange] = useState('0-1k')
  const [currentIntensity, setCurrentIntensity] = useState(() => {
    const n = Number(intensityThreshold) || 0
    const initial = n > 1 ? Math.round(n) : 50
    return Math.min(initial, safeMaxLevel) // Ensure initial value doesn't exceed max
  })

  const togglePlay = () => {
    if (isPlaying) return void pauseAudio()
    if (audioContext && audioContext.state === 'suspended') return void resumeAudio()
    return void playAudio()
  }

  const onIntensityChange = (e) => {
    const v = Number(e.target.value)
    setCurrentIntensity(v)
    setIntensity(v / 100) // Still maps to 0-1.0 gain scale
  }

  const selectRange = (r) => {
    setActiveRange(r)
    setFrequencyRange(r)
  }

  const markAnnoying = () => {
    toggleAnnoyingFreqRange(activeRange, currentIntensity)
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-12 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Frequency Test</h2>

        <div className="flex flex-col items-center gap-8 mb-8">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="bg-gradient-to-br from-blue-500 to-green-400 text-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg hover:shadow-xl transition-all text-3xl"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div className="w-full max-w-md">
            <div className="flex items-center justify-between mb-3">
              <label className="text-base font-medium text-gray-700">Intensity</label>
              <div className="text-base font-bold text-blue-600">{currentIntensity} dB / {safeMaxLevel} dB</div>
            </div>

            <input
              type="range"
              min="0"
              max={safeMaxLevel}
              step="1"
              value={currentIntensity}
              onChange={onIntensityChange}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-base font-medium text-gray-700 mb-4">Frequency Range</label>
          <div className="w-full flex flex-wrap justify-center gap-2 py-2 mb-6">
            {freqRanges.map((range) => {
              const isActive = activeRange === range
              const isMarked = annoyingFreqRanges.some(item => item.range === range)
              
              let buttonStyle = 'py-2 px-4 rounded-lg font-medium whitespace-nowrap transition-all '
              
              if (isMarked) {
                buttonStyle += 'bg-red-200 border-red-400 text-red-700 font-semibold border-2'
              } else if (isActive) {
                buttonStyle += 'bg-gradient-to-br from-blue-400 to-green-300 text-white font-semibold shadow-md'
              } else {
                buttonStyle += 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
              
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => selectRange(range)}
                  className={buttonStyle}
                >
                  {range}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={markAnnoying} 
            className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all"
          >
            Mark Annoying Range
          </button>
          <Link 
            to="/report" 
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-all text-center"
          >
            Finish & View Report
          </Link>
        </div>

      </div>
    </div>
  )
}
