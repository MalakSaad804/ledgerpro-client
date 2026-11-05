import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">LedgerPro</Link>
      <nav>
        {user && <NavLink to="/">Services</NavLink>}
        {user?.role === 'customer' && <NavLink to="/my-bookings">My bookings</NavLink>}
        {user ? (
          <>
            <span className="nav-user">{user.name}</span>
            <button className="btn btn-small btn-ghost" onClick={() => { logout(); navigate('/login'); }}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
