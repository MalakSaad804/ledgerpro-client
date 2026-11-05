import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api/client';
import { ErrorBox, Spinner } from '../components/ui';

const TZ = import.meta.env.VITE_TIME_ZONE || 'Asia/Karachi';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/customer/bookings');
      setBookings(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setBusyId(id);
    try {
      await api.patch(`/customer/bookings/${id}/cancel`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId('');
    }
  };

  return (
    <div>
      <h1>My bookings</h1>
      {loading && <Spinner label="Loading your bookings..." />}
      <ErrorBox message={error} onRetry={load} />
      {!loading && !error && bookings.length === 0 && (
        <p>You have no bookings yet. <Link to="/">Browse services</Link></p>
      )}
      <div className="grid">
        {bookings.map((b) => (
          <article key={b._id} className="card">
            <h3>{b.service?.name || 'Service'}</h3>
            <p>{new Date(b.slotStart).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: TZ })}</p>
            <span className={`badge badge-${b.status}`}>{b.status}</span>
            {b.status !== 'cancelled' && new Date(b.slotStart) > new Date() && (
              <button className="btn btn-small btn-ghost" disabled={busyId === b._id} onClick={() => cancel(b._id)}>
                {busyId === b._id ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
