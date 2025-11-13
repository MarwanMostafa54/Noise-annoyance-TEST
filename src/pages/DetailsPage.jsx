import React, { useState } from 'react';
import useAppStore from '../store/useAppStore'; // Corrected path
import { Link, useNavigate } from 'react-router-dom';

const DetailsPage = () => {
  // Get state and functions from Zustand
  const { interviewDetails, updateInterviewDetails, loadAudio, setSelectedSound, clearAudio, selectedSound } = useAppStore(
    (state) => ({
      interviewDetails: state.interviewDetails,
      updateInterviewDetails: state.updateInterviewDetails,
      loadAudio: state.loadAudio, // Make sure loadAudio is in your store
      setSelectedSound: state.setSelectedSound, // Make sure this is in your store
      clearAudio: state.clearAudio,
      selectedSound: state.selectedSound,
    })
  );

  const navigate = useNavigate();

  // Get validation state
  const { date, childName, childAge, assessorName } = interviewDetails;
  const isFormValid = date && childName && childAge && assessorName;

  // Local state for tabs
  const [activeTab, setActiveTab] = useState('music');
  const [loadingPreset, setLoadingPreset] = useState('')
  const [loadError, setLoadError] = useState('')
  
  // presets in public/presets are accessible at /presets/... at runtime
  const presetFolders = {
    music: [
      'beethoven 3rd symphony.mp4',
      "Beethoven's 5th Symphony.mp4",
    ],
    'brain wave': [
      'alpha.mp4',
      'beta.mp4',
      'theta.mp4',
    ],
    tones: [
      'Delay Time Test Signal.mp4',
      'Fast Pink Noise 1s.mp4',
      'Fast Pink Noise 4s.mp4',
      'Pink Noise Stereo On 10s, Off 10s.mp4',
      'Pink Noise Stereo On 1s, Off 1s.mp4',
      'Pink Noise Stereo On 2s, Off 2s.mp4',
      'Pink Noise Stereo On 5s, Off 5s.mp4',
      'Pink Noise Stereo.mp4',
      'Pink Noise.mp4',
      'Polarity Test Signal.mp4',
      'Sine 1kHz Left Channel.mp4',
      'Sine 1kHz Right Channel.mp4',
      'Sine1 kHz.mp4',
      'Stepped Sweep 20Hz - 20kHz, 3rd oct, 1s.mp4',
      'Stepped Sweep 20Hz - 20kHz, 3rd oct, 3s.mp4',
      'STIPA Speech Intelligibility ed5.mp4',
      'White Noise Stereo.mp4',
      'White Noise.mp4',
    ]
  }
  // Add more samples for brainwave, tones...

  const handleInputChange = (e) => {
    updateInterviewDetails(e.target.name, e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Assuming `loadAudio` handles a File object
      // and `setSelectedSound` handles a string name.
      // You may need to adjust this logic.
      loadAudio(file); 
      setSelectedSound(file.name);
      setActiveTab('upload');
    }
  };
  
  const handleNextClick = (e) => {
    if (!isFormValid) {
      e.preventDefault(); // Stop navigation
      alert("Please fill in all fields in Child's Information.");
    }
  };

  return (
    // 1. The Full-Screen Page Container (NO max-w)
    // This container just centers its child
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-8">
      
      {/* 2. The Main Card (with max-w-7xl) - THIS IS THE KEY */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden mx-auto">
        
        {/* 3. Left Column (Form) */}
        <div className="p-10 md:p-12 border-r border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Child's Information</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Today's Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={interviewDetails.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            <div>
              <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">Child's Name</label>
              <input
                type="text"
                id="childName"
                name="childName"
                value={interviewDetails.childName}
                onChange={handleInputChange}
                placeholder="Child Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            <div>
              <label htmlFor="childAge" className="block text-sm font-medium text-gray-700 mb-2">Child's Age</label>
              <input
                type="number"
                id="childAge"
                name="childAge"
                value={interviewDetails.childAge}
                onChange={handleInputChange}
                placeholder="Child Age"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            <div>
              <label htmlFor="assessorName" className="block text-sm font-medium text-gray-700 mb-2">Assessor's Name</label>
              <input
                type="text"
                id="assessorName"
                name="assessorName"
                value={interviewDetails.assessorName}
                onChange={handleInputChange}
                placeholder="Assessor Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            
            <div className="flex justify-end pt-6">
              <Link
                to="/intensity"
                onClick={handleNextClick} // Add onClick for validation check
                aria-disabled={!isFormValid}
                tabIndex={!isFormValid ? -1 : undefined}
                className={`
                  py-3 px-8 rounded-xl text-white font-bold text-lg shadow-lg transition-all
                  ${!isFormValid
                    ? 'bg-gray-400 opacity-70 cursor-not-allowed'
                    : 'bg-gradient-to-br from-blue-500 to-green-400 hover:shadow-xl'
                  }
                `}
              >
                Next Page
              </Link>
            </div>
          </form>
        </div>
        
        {/* 4. Right Column (Sound Select) */}
        <div className="bg-gray-50 p-10 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Select Sound</h2>
          
          {/* Tab Headers */}
          <div className="flex border-b-2 border-gray-200 mb-6">
            {['Music', 'Brain Wave', 'Tones', 'Upload'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`py-3 px-5 font-medium whitespace-nowrap ${
                  activeTab === tab.toLowerCase()
                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Tab Panels */}
          <div className="space-y-3">
            {activeTab === 'music' && (
              <>
                {presetFolders.music.map((f) => {
                  const isSelected = selectedSound === f
                  const isLoading = loadingPreset === f
                  return (
                    <button
                      key={f}
                      onClick={async () => {
                        try {
                          setLoadError('')
                          setLoadingPreset(f)
                          const url = `/presets/music/${encodeURIComponent(f)}`
                          const ok = await loadAudio(url)
                          if (ok) {
                            setSelectedSound(f)
                          } else {
                            setLoadError(`Failed to load ${f}`)
                          }
                        } catch (err) {
                          console.error(err)
                          setLoadError(err?.message || 'Unknown error')
                        } finally {
                          setLoadingPreset('')
                        }
                      }}
                      disabled={isLoading}
                      className={`w-full p-4 rounded-lg text-left border border-gray-200 transition-colors mb-2 ${isSelected ? 'bg-blue-50 text-blue-700 border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100'} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      {isLoading ? `Loading ${f}...` : f}
                    </button>
                  )
                })}
                {loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
                {/* only show presets from public/presets */}
              </>
            )}
            {activeTab === 'brain wave' && (
               <>
                 {presetFolders['brain wave'].map((f) => {
                   const isSelected = selectedSound === f
                   const isLoading = loadingPreset === f
                   return (
                     <button
                       key={f}
                       onClick={async () => {
                         try {
                           setLoadError('')
                           setLoadingPreset(f)
                           const url = `/presets/brainwaves/${encodeURIComponent(f)}`
                           const ok = await loadAudio(url)
                           if (ok) setSelectedSound(f)
                           else setLoadError(`Failed to load ${f}`)
                         } catch (err) {
                           console.error(err)
                           setLoadError(err?.message || 'Unknown error')
                         } finally {
                           setLoadingPreset('')
                         }
                       }}
                       disabled={isLoading}
                       className={`w-full p-4 rounded-lg text-left border border-gray-200 transition-colors mb-2 ${isSelected ? 'bg-blue-50 text-blue-700 border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100'} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                     >
                       {isLoading ? `Loading ${f}...` : f}
                     </button>
                   )
                 })}
               </>
            )}
            {activeTab === 'tones' && (
               <>
                 {presetFolders.tones.map((f) => {
                   const isSelected = selectedSound === f
                   const isLoading = loadingPreset === f
                   return (
                     <button
                       key={f}
                       onClick={async () => {
                         try {
                           setLoadError('')
                           setLoadingPreset(f)
                           const url = `/presets/tones/${encodeURIComponent(f)}`
                           const ok = await loadAudio(url)
                           if (ok) setSelectedSound(f)
                           else setLoadError(`Failed to load ${f}`)
                         } catch (err) {
                           console.error(err)
                           setLoadError(err?.message || 'Unknown error')
                         } finally {
                           setLoadingPreset('')
                         }
                       }}
                       disabled={isLoading}
                       className={`w-full p-4 rounded-lg text-left border border-gray-200 transition-colors mb-2 ${isSelected ? 'bg-blue-50 text-blue-700 border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100'} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                     >
                       {isLoading ? `Loading ${f}...` : f}
                     </button>
                   )
                 })}
                 {loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
               </>
            )}
            {activeTab === 'upload' && (
              <div>
                {selectedSound === '' ? (
                  // 1. The Dropzone (when no file is selected)
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all">
                    <input 
                      type="file" 
                      id="audioUpload" 
                      className="hidden" 
                      onChange={handleFileChange}
                      accept="audio/*"
                    />
                    <label htmlFor="audioUpload" className="cursor-pointer py-2 px-6 rounded-lg bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600">
                      Select File
                    </label>
                    <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
                  </div>
                ) : (
                  // 2. The Feedback (when a file IS selected)
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-solid border-green-300 rounded-xl bg-green-50">
                    <p className="text-lg font-semibold text-green-700">File Selected:</p>
                    <p className="text-gray-700 mb-4">{selectedSound}</p>
                    <button
                      onClick={() => {
                        clearAudio(); // Call the new store function
                      }}
                      className="py-2 px-6 rounded-lg bg-red-500 text-white font-semibold shadow-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
