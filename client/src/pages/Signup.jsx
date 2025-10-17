import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { FiCamera } from 'react-icons/fi';

const Signup = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const [avatarPreview, setAvatarPreview] = useState(null);
    const navigate = useNavigate();

    const handleAvatarChange = (e) => {

        const file = e.target.files[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        // FormData is necessary for sending files
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("password", data.password);
        console.log(data);

        if (data.avatar[0]) {
            formData.append("avatar", data.avatar[0]);
        }
        console.log(data);

        try {
            await api.post('/users/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Account created successfully! Please log in.');
            navigate('/login'); // Redirect to login page after successful signup
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
        }
    };

    // --- Style Objects ---

    const pageStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' };

    const formContainerStyle = { width: '100%', maxWidth: '420px', padding: '40px', backgroundColor: 'var(--surface-1)', borderRadius: '12px', border: '1px solid var(--surface-2)' };

    const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 15px', marginBottom: '20px', borderRadius: '8px', border: '1px solid var(--surface-2)', backgroundColor: 'var(--background)', color: 'var(--text-primary)', fontSize: '16px' };

    const errorStyle = { color: '#EF4444', fontSize: '14px', marginTop: '-15px', marginBottom: '10px' };

    const avatarContainerStyle = { display: 'flex', justifyContent: 'center', marginBottom: '20px' };

    const avatarLabelStyle = { position: 'relative', cursor: 'pointer' };

    const avatarImageStyle = { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--surface-2)' };

    const avatarOverlayStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease' };

    return (
        <div style={pageStyle}>
            <div style={formContainerStyle}>
                <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Create an Account</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '30px' }}>Join the conversation</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={avatarContainerStyle}>
                        <label
                            htmlFor="avatar-upload"
                            style={avatarLabelStyle}
                            onMouseEnter={(e) => { e.currentTarget.querySelector('div').style.opacity = 1; }}
                            onMouseLeave={(e) => { e.currentTarget.querySelector('div').style.opacity = 0; }}
                        >
                            <img src={avatarPreview || `https://ui-avatars.com/api/?name=?&background=2A2A2A&color=EAEAEA`} alt="Avatar Preview" style={avatarImageStyle} />
                            <div style={avatarOverlayStyle}>
                                <FiCamera style={{ color: 'white', fontSize: '24px' }} />
                            </div>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                {...register("avatar", {
                                    required: "Avatar is required",
                                    onChange: (e) => handleAvatarChange(e) // merge with RHF
                                })}
                            />
                        </label>
                    </div>
                    {errors.avatar && !avatarPreview && <p style={errorStyle}>{errors.avatar.message}</p>}

                    <input placeholder="Full Name" style={inputStyle} {...register("name", { required: "Name is required" })} />
                    {errors.name && <p style={errorStyle}>{errors.name.message}</p>}

                    <input type="email" placeholder="Email" style={inputStyle} {...register("email", { required: "Email is required" })} />
                    {errors.email && <p style={errorStyle}>{errors.email.message}</p>}

                    <input type="password" placeholder="Password" style={inputStyle} {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} />
                    {errors.password && <p style={errorStyle}>{errors.password.message}</p>}

                    <button type="submit" className="button-primary" style={{ width: '100%', padding: '12px' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;