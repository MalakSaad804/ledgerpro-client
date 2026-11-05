import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api, { errorMessage } from '../api/client';
import SlotPicker from '../components/SlotPicker';
import { ErrorBox, FieldError, Spinner } from '../components/ui';

const TZ = import.meta.env.VITE_TIME_ZONE || 'Asia/Karachi';
const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
const plusDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-CA');
};

const schema = Yup.object({
  date: Yup.string().required('Choose a date').test('future', 'Date cannot be in the past', (v) => !v || v >= today()),
  slotStart: Yup.string().required('Pick a time slot'),
  notes: Yup.string().max(300, 'Keep notes under 300 characters'),
});

export default function Book() {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  const [submitError, setSubmitError] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  // load the service itself
  useEffect(() => {
    setPageLoading(true);
    api
      .get('/services')
      .then(({ data }) => {
        const found = data.find((s) => s._id === serviceId);
        if (found) setService(found);
        else setPageError('That service was not found.');
      })
      .catch((err) => setPageError(errorMessage(err)))
      .finally(() => setPageLoading(false));
  }, [serviceId]);

  const formik = useFormik({
    initialValues: { date: '', slotStart: '', notes: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError('');
      try {
        const { data } = await api.post('/customer/bookings', {
          serviceId,
          slotStart: values.slotStart,
          notes: values.notes || undefined,
        });
        setConfirmed(data);
      } catch (err) {
        setSubmitError(errorMessage(err));
        // someone may have taken the slot: refresh the list and clear the choice
        if (err.response?.status === 409) {
          formik.setFieldValue('slotStart', '');
          loadSlots(values.date);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const loadSlots = useCallback(
    async (date) => {
      if (!date) return;
      setSlotsLoading(true);
      setSlotsError('');
      try {
        const { data } = await api.get(`/services/${serviceId}/slots`, { params: { date } });
        setSlots(data.slots);
      } catch (err) {
        setSlots([]);
        setSlotsError(errorMessage(err));
      } finally {
        setSlotsLoading(false);
      }
    },
    [serviceId]
  );

  const onDateChange = (e) => {
    const date = e.target.value;
    formik.setFieldValue('date', date);
    formik.setFieldValue('slotStart', '');
    setSlots([]);
    if (date && date >= today()) loadSlots(date);
  };

  if (pageLoading) return <Spinner label="Loading service..." />;
  if (pageError) return <div><ErrorBox message={pageError} /><Link to="/">Back to services</Link></div>;

  if (confirmed) {
    const when = new Date(confirmed.slotStart).toLocaleString('en-GB', {
      dateStyle: 'full', timeStyle: 'short', timeZone: TZ,
    });
    return (
      <div className="card narrow">
        <div className="alert alert-success">Booking confirmed</div>
        <h2>{service.name}</h2>
        <p>{when}</p>
        <div className="row">
          <Link to="/my-bookings" className="btn">View my bookings</Link>
          <Link to="/" className="btn btn-ghost">Book another</Link>
        </div>
      </div>
    );
  }

  const f = formik;
  return (
    <div className="card">
      <Link to="/" className="muted">&larr; All services</Link>
      <h1>{service.name}</h1>
      <p>{service.description} <span className="muted">({service.durationMins} min)</span></p>

      <ErrorBox message={submitError} />
      <form onSubmit={f.handleSubmit} noValidate>
        <label htmlFor="date">Date</label>
        <input
          id="date" type="date" name="date" min={today()} max={plusDays(30)}
          value={f.values.date} onChange={onDateChange} onBlur={f.handleBlur}
        />
        <FieldError>{f.touched.date && f.errors.date}</FieldError>

        <label>Time slot</label>
        {!f.values.date && <p className="muted">Choose a date to see open times.</p>}
        {slotsLoading && <Spinner label="Checking availability..." />}
        <ErrorBox message={slotsError} onRetry={() => loadSlots(f.values.date)} />
        {f.values.date && !slotsLoading && !slotsError && (
          <SlotPicker
            slots={slots}
            value={f.values.slotStart}
            onChange={(v) => { f.setFieldValue('slotStart', v); f.setFieldTouched('slotStart', true, false); }}
          />
        )}
        <FieldError>{f.touched.slotStart && f.errors.slotStart}</FieldError>

        <label htmlFor="notes">Notes (optional)</label>
        <textarea id="notes" rows="3" placeholder="Anything we should know?" {...f.getFieldProps('notes')} />
        <FieldError>{f.touched.notes && f.errors.notes}</FieldError>

        <button type="submit" className="btn" disabled={f.isSubmitting || slotsLoading}>
          {f.isSubmitting ? 'Booking...' : 'Confirm booking'}
        </button>
      </form>
    </div>
  );
}
