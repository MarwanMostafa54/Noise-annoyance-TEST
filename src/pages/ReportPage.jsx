import React, { useEffect, useRef } from 'react';
import useAppStore from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper function to load image as data URI
const loadImageAsDataUri = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.9)); // Use JPEG format with quality
    };
    img.onerror = (error) => {
      console.error('Failed to load image:', imagePath, error);
      reject(error);
    };
    img.src = imagePath;
  });
};

// Assume your template image is here. Adjust path if different.
const PDF_BACKGROUND_IMAGE = '/assets/template.jpg'; 

const ReportPage = () => {
  const navigate = useNavigate();
  const reportRef = useRef(null); // Ref for the content to be printed

  const {
    interviewDetails,
    selectedSound,
    intensityThreshold,
    annoyingFreqRanges,
    pauseAudio,
  } = useAppStore((state) => ({
    interviewDetails: state.interviewDetails,
    selectedSound: state.selectedSound,
    intensityThreshold: state.intensityThreshold,
    annoyingFreqRanges: state.annoyingFreqRanges,
    pauseAudio: state.pauseAudio,
  }));

  // Pause audio when entering the report page
  useEffect(() => {
    pauseAudio();
  }, [pauseAudio]);

  const generatePdfReport = async () => {
    if (!reportRef.current) return;

    try {
      // 1. Define standard A4 dimensions in points (pt)
      const a4Width = 595.28;
      const a4Height = 841.89;

      // 2. Create the PDF document
      const pdf = new jsPDF('p', 'pt', 'a4');

      // 3. Try to add the background image directly (skip if not found)
      try {
        const bgDataUri = await loadImageAsDataUri('/assets/template.jpg');
        pdf.addImage(bgDataUri, 'JPEG', 0, 0, a4Width, a4Height);
      } catch (bgError) {
        console.warn('Background image not found, proceeding without it:', bgError);
        // Continue without background - just create a white PDF
      }

      // 4. Capture the report content
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');

      // 5. Calculate dimensions to fit content onto the PDF
      const contentMargin = 60; 
      const topMargin = 120; // Increased top margin to avoid covering the logo
      const printableWidth = a4Width - (contentMargin * 2);
      const contentHeight = (canvas.height * printableWidth) / canvas.width;

      // 6. Add the captured content with more space from the top
      pdf.addImage(imgData, 'PNG', contentMargin, topMargin, printableWidth, contentHeight);

      // 7. Save the file
      pdf.save('Assessment_Report.pdf');

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-8">
      
      {/* Main Report Card - now with full width/height for capture */}
      <div className="w-full h-full bg-white rounded-3xl shadow-2xl relative">
        
        {/* --- PRINTABLE CONTENT WRAPPER --- */}
        {/* This div is what html2canvas will capture. Its padding creates the safe areas. */}
        <div id="report-content" ref={reportRef} className="p-20 flex flex-col h-full"> {/* Increased padding */}
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Assessment Report</h2>
              <p className="text-gray-600">Summary of interview and marked annoying frequency ranges.</p>
            </div>
          </div>

          {/* Top Summary Section (Two-Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-8 border-b border-gray-200">
            {/* Left Column (Interview Details) */}
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Interview Details</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Date:</strong> {interviewDetails.date || '---'}</p>
                <p><strong>Child:</strong> {interviewDetails.childName || '---'}</p>
                <p><strong>Age:</strong> {interviewDetails.childAge || '---'}</p>
                <p><strong>Assessor:</strong> {interviewDetails.assessorName || '---'}</p>
              </div>
            </div>
            {/* Right Column (Audio & Threshold) */}
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Audio & Threshold</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Selected Sound:</strong> {selectedSound || '---'}</p>
                <p><strong>Intensity Threshold:</strong> {intensityThreshold !== null ? `${intensityThreshold} dB` : '---'}</p>
              </div>
            </div>
          </div>

          {/* Marked Ranges Table */}
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Marked Annoying Frequency Ranges</h3>
          <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm flex-grow"> {/* flex-grow to take remaining space */}
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Intensity</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Frequency Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {annoyingFreqRanges.length > 0 ? (
                  annoyingFreqRanges.map((item, index) => (
                    <tr key={index}>
                      <td className="py-4 px-4 text-gray-600">{index + 1}</td>
                      <td className="py-4 px-4 text-gray-700">{item.intensity} dB</td>
                      <td className="py-4 px-4 text-gray-700">{item.range}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-4 px-4 text-center text-gray-500">No annoying frequencies marked.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div> {/* END OF report-content WRAPPER */}

        {/* Action Buttons - positioned absolutely so they don't interfere with content capture */}
        <div className="absolute bottom-10 right-10 flex gap-4 z-10">
          <button
            onClick={generatePdfReport}
            className="py-3 px-8 rounded-xl bg-gradient-to-br from-blue-500 to-green-400 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Print Report
          </button>
          <button
            onClick={handleBackClick}
            className="py-3 px-8 rounded-xl bg-gray-200 text-gray-700 font-bold text-lg shadow-lg hover:bg-gray-300 transition-all"
          >
            Back
          </button>
        </div>

      </div> {/* END OF Main Report Card */}
    </div>
  );
};

export default ReportPage;
