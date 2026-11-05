import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api, { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ErrorBox, FieldError } from '../components/ui';

const schema = Yup.object({
  name: Yup.string().trim().min(2, 'Name is too short').max(80).required('Name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(8, 'At least 8 characters').required('Password is required'),
  confirm: Yup.string().oneOf([Yup.ref('password')], 'Passwords do not match').required('Confirm your password'),
});

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const f = useFormik({
    initialValues: { name: '', email: '', password: '', confirm: '' },
    validationSchema: schema,
    onSubmit: async (v, { setSubmitting }) => {
      setError('');
      try {
        await api.post('/auth/register', { name: v.name, email: v.email, password: v.password });
        await login(v.email, v.password);
        navigate('/', { replace: true });
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="card narrow">
      <h1>Create account</h1>
      <ErrorBox message={error} />
      <form onSubmit={f.handleSubmit} noValidate>
        {['name', 'email', 'password', 'confirm'].map((field) => (
          <div key={field}>
            <label htmlFor={field}>
              {{ name: 'Full name', email: 'Email', password: 'Password', confirm: 'Confirm password' }[field]}
            </label>
            <input
              id={field}
              type={field === 'email' ? 'email' : field === 'name' ? 'text' : 'password'}
              {...f.getFieldProps(field)}
            />
            <FieldError>{f.touched[field] && f.errors[field]}</FieldError>
          </div>
        ))}
        <button type="submit" className="btn" disabled={f.isSubmitting}>
          {f.isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
