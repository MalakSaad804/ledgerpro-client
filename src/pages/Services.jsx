import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ErrorBox, Spinner } from '../components/ui';

export default function Services() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/services');
      setServices(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h1>Our services</h1>
      <p className="muted">Pick a service to see open times and book an appointment.</p>
      {loading && <Spinner label="Loading services..." />}
      <ErrorBox message={error} onRetry={load} />
      {!loading && !error && services.length === 0 && <p>No services are available right now.</p>}
      <div className="grid">
        {services.map((s) => (
          <article key={s._id} className="card service-card">
            <h3>{s.name}</h3>
            <p>{s.description}</p>
            <p className="muted">{s.durationMins} minutes</p>
            {user?.role === 'customer' ? (
              <Link to={`/book/${s._id}`} className="btn">Book now</Link>
            ) : (
              <span className="muted">Log in as a customer to book</span>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
