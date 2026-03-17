import React, { useState } from 'react';
import { loginUser, signupUser } from '../services/api';

const AuthPage = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const res = isLogin
                ? await loginUser(formData)
                : await signupUser(formData);
            
            if (isLogin) {
                localStorage.setItem('token', res.data.token);
                onLoginSuccess(res.data.username);
            } else {
                setMessage("Account created. Please login.");
                setIsLogin(true);
            }
        } catch (err) {
            const apiError = err.response?.data;
            const validationMessage = Array.isArray(apiError?.errors)
                ? apiError.errors[0]?.msg
                : null;

            setMessage(validationMessage || apiError?.error || "An error occurred");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input 
                        type="text" 
                        placeholder="Username" 
                        required
                        className="auth-input"
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        required
                        className="auth-input"
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button type="submit" className="auth-submit">
                        {isLogin ? 'Enter' : 'Create Account'}
                    </button>
                </form>
                
                <p className="auth-toggle" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
                </p>
                {message && <p className="auth-message">{message}</p>}
            </div>
        </div>
    );
};

export default AuthPage;