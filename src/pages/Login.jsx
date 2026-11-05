import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import { ErrorBox, FieldError } from '../components/ui';

const schema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      try {
        await login(values.email, values.password);
        navigate(location.state?.from || '/', { replace: true });
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const f = formik;
  return (
    <div className="card narrow">
      <h1>Log in</h1>
      <ErrorBox message={error} />
      <form onSubmit={f.handleSubmit} noValidate>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...f.getFieldProps('email')} />
        <FieldError>{f.touched.email && f.errors.email}</FieldError>

        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...f.getFieldProps('password')} />
        <FieldError>{f.touched.password && f.errors.password}</FieldError>

        <button type="submit" className="btn" disabled={f.isSubmitting}>
          {f.isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="muted">No account? <Link to="/register">Register</Link></p>
    </div>
  );
}
