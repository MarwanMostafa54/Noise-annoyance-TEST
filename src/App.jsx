import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAppStore from './store/useAppStore'
import { VerificationPage } from './pages/VerificationPage'
import DetailsPage from './pages/DetailsPage'
import IntensityPage from './pages/IntensityPage'
import FrequencyPage from './pages/FrequencyPage'
import ReportPage from './pages/ReportPage'
// NEW: Import the Layout component
import Layout from './Layout'

// 1. Create a Protected Route component
const ProtectedRoute = ({ children }) => {
  const isVerified = useAppStore((state) => state.isVerified);
  return isVerified ? children : <Navigate to="/" replace />;
};

export default function App() {
  const isVerified = useAppStore((state) => state.isVerified)

  return (
    <Routes>
      {/* Public Route (Verification Page) - No header here */}
      <Route
        path="/"
        element={
          isVerified ? <Navigate to="/details" replace /> : <VerificationPage />
        }
      />
      
      {/* Protected Routes (These will all have the Layout/Header) */}
      <Route element={<Layout />}>
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
      </Route>
      
      {/* A catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
