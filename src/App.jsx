import React from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import useAppStore from './store/useAppStore'
import { VerificationPage } from './pages/VerificationPage'
import DetailsPage from './pages/DetailsPage'
import IntensityPage from './pages/IntensityPage'
import FrequencyPage from './pages/FrequencyPage'
import ReportPage from './pages/ReportPage'

// 1. Create a Protected Route component
const ProtectedRoute = ({ children }) => {
  const isVerified = useAppStore((state) => state.isVerified);
  return isVerified ? children : <Navigate to="/" replace />;
};

export default function App() {
  const isVerified = useAppStore((state) => state.isVerified)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 text-slate-900">
      <main className="p-6">
        <Routes>
          {/* 2. Public Route (Verification) */}
          <Route
            path="/"
            element={
              isVerified ? <Navigate to="/details" replace /> : <VerificationPage />
            }
          />
          
          {/* 3. Protected App Routes */}
          <Route
            path="/details"
            element={
              <ProtectedRoute>
                <DetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intensity"
            element={
              <ProtectedRoute>
                <IntensityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/frequency"
            element={
              <ProtectedRoute>
                <FrequencyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            }
          />
          
          {/* 4. A catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
