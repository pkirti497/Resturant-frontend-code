import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RestaurantPOS from './components/RestaurantPOS';
import OrdersPage from './components/OrdersPage';
import RoomsPage from './components/RoomsPage';
import BookingsPage from './components/BookingsPage';
import BillingPage from './components/BillingPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes inside Main Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/RestaurantPOS" element={<RestaurantPOS />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            
            {/* Settings page restricted specifically to Administrator role */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute allowedRoles={['Administrator']}>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
