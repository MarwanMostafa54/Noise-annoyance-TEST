// Layout.jsx
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAppStore from './store/useAppStore'; // Adjust path if needed

// Assume your logo image is here. Adjust path if different.
const APP_LOGO = '/assets/logo.jpg'; 

const Layout = () => {
  const location = useLocation(); // To get the current path for conditional rendering
  const isVerified = useAppStore((state) => state.isVerified); // Use this to hide header on verification page
  const navigate = useNavigate();
  const retakeTest = useAppStore((state) => state.retakeTest);

  // Do not render the header/layout on the verification page or if not verified
  if (location.pathname === '/' && !isVerified) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Fixed Header */}
      <header className="bg-white shadow-md py-4 px-8 flex items-center justify-between z-20">
        <div className="flex items-center space-x-4">
          <img src={APP_LOGO} alt="App Logo" className="h-16 w-auto" /> {/* Increased from h-12 to h-16 */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Noise Annoyance Assessment</h1>
            <p className="text-sm text-gray-600">Powered by Enosh Science Center</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="py-2 px-3 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={async () => {
              try {
                await retakeTest()
                navigate('/details')
              } catch (e) {
                console.error('retakeTest failed', e)
              }
            }}
            className="py-2 px-3 rounded-md bg-red-500 text-white hover:bg-red-600"
          >
            Retake Test
          </button>
        </div>
      </header>

      {/* Main content area. Outlet renders the specific page content. */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Optional: Add a Footer here if needed */}
      {/* <footer className="bg-gray-800 text-white p-4 text-center">
        &copy; 2024 Enosh Science Center
      </footer> */}
    </div>
  );
};

export default Layout;