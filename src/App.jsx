import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Book from './pages/Book';
import MyBookings from './pages/MyBookings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/book/:serviceId" element={<ProtectedRoute roles={['customer']}><Book /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute roles={['customer']}><MyBookings /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
