import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAppStore from '../store/useAppStore'

export default function ReportPage() {
  const { interviewDetails, intensityThreshold, annoyingFreqRanges, selectedSound, pauseAudio } = useAppStore((s) => ({
    interviewDetails: s.interviewDetails,
    intensityThreshold: s.intensityThreshold,
    annoyingFreqRanges: s.annoyingFreqRanges,
    selectedSound: s.selectedSound,
    pauseAudio: s.pauseAudio
  }))

  // Pause audio when report page loads
  useEffect(() => {
    pauseAudio()
  }, [])

  const fmtRange = (r) => String(r).replace(/k/g, 'kHz')

  const onPrint = () => {
    window.print()
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10 md:p-12">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Assessment Report</h2>
          <p className="text-gray-600 mb-8">Summary of interview and marked annoying frequency ranges.</p>
        </div>

        {/* Top Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 border-b pb-8 border-gray-200">
          {/* Left Column - Interview Details */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Interview Details</h3>
            <div className="space-y-2">
              <p><strong>Date:</strong> {interviewDetails.date || '---'}</p>
              <p><strong>Child:</strong> {interviewDetails.childName || '---'}</p>
              <p><strong>Age:</strong> {interviewDetails.childAge || '---'}</p>
              <p><strong>Assessor:</strong> {interviewDetails.assessorName || '---'}</p>
            </div>
          </div>

          {/* Right Column - Audio & Threshold */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Audio & Threshold</h3>
            <div className="space-y-2">
              <p><strong>Selected Sound:</strong> {selectedSound || '---'}</p>
              <p><strong>Intensity Threshold:</strong> {intensityThreshold} dB</p>
            </div>
          </div>
        </div>

        {/* Marked Ranges Table */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Marked Annoying Frequency Ranges</h3>
          {annoyingFreqRanges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No frequency ranges have been marked as annoying yet.</p>
            </div>
          ) : (
            <div className="w-full overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">#</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Intensity</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Frequency Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {annoyingFreqRanges.map((item, index) => (
                    <tr key={index}>
                      <td className="py-4 px-4 text-gray-600">{index + 1}</td>
                      <td className="py-4 px-4">{item.intensity} dB</td>
                      <td className="py-4 px-4">{fmtRange(item.range)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-end gap-4 mt-10">
          <button onClick={onPrint} className="bg-gradient-to-br from-blue-500 to-green-400 text-white font-semibold rounded-xl py-3 px-8 shadow-lg hover:shadow-xl transition-all no-print">
            Print Report
          </button>
          <Link to="/details" className="bg-gray-200 text-gray-800 font-semibold rounded-xl py-3 px-8 hover:bg-gray-300 transition-all no-print">
            Back
          </Link>
        </div>

      </div>
    </div>
  )
}
