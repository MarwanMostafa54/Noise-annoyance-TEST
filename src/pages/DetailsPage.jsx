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
  
  // (These are just placeholders, you'd load real files)
  const musicSamples = [
    { name: 'Star Wars (sample)', file: 'sample-files/music1.mp3' },
    { name: 'Cantina Band (sample)', file: 'sample-files/music2.mp3' },
  ];
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
                <button className="w-full p-4 rounded-lg text-left text-gray-700 bg-white border border-gray-200 hover:bg-gray-100">Star Wars (sample)</button>
                <button className="w-full p-4 rounded-lg text-left text-gray-700 bg-white border border-gray-200 hover:bg-gray-100">Cantina Band (sample)</button>
              </>
            )}
            {activeTab === 'brain wave' && (
               <button className="w-full p-4 rounded-lg text-left text-gray-700 bg-white border border-gray-200 hover:bg-gray-100">Alpha Wave (sample)</button>
            )}
            {activeTab === 'tones' && (
               <button className="w-full p-4 rounded-lg text-left text-gray-700 bg-white border border-gray-200 hover:bg-gray-100">1000Hz Sine (sample)</button>
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
