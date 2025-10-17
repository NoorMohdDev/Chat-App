import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const response = await api.post('/users/login', data);
            
            // Assuming the API response is wrapped in our ApiResponse format
            const { user, accessToken } = response.data.data;

            login(user, accessToken);
            toast.success('Welcome back!');
            navigate('/'); // Redirect to the main chat dashboard
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    // --- Style Objects ---
    const pageStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
    };

    const formContainerStyle = {
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        backgroundColor: 'var(--surface-1)',
        borderRadius: '12px',
        border: '1px solid var(--surface-2)',
    };

    const inputStyle = {
        width: '100%',
        boxSizing: 'border-box',
        padding: '12px 15px',
        marginBottom: '20px',
        borderRadius: '8px',
        border: '1px solid var(--surface-2)',
        backgroundColor: 'var(--background)',
        color: 'var(--text-primary)',
        fontSize: '16px',
    };
    
    const errorStyle = {
        color: '#EF4444',
        fontSize: '14px',
        marginTop: '-15px',
        marginBottom: '10px',
    };

    return (
        <div style={pageStyle}>
            <div style={formContainerStyle}>
                <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Welcome Back</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '30px' }}>Sign in to continue</p>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input
                        type="email"
                        placeholder="Email"
                        style={inputStyle}
                        {...register("email", { required: "Email is required" })}
                    />
                    {errors.email && <p style={errorStyle}>{errors.email.message}</p>}

                    <input
                        type="password"
                        placeholder="Password"
                        style={inputStyle}
                        {...register("password", { required: "Password is required" })}
                    />
                    {errors.password && <p style={errorStyle}>{errors.password.message}</p>}

                    <button type="submit" className="button-primary" style={{ width: '100%', padding: '12px' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;