import React, { useState } from 'react';
import axios from 'axios';

const AuthPage = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
        
        try {
            const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
            
            if (isLogin) {
                // Save token and tell the App we are logged in
                localStorage.setItem('token', res.data.token);
                onLoginSuccess(res.data.username);
            } else {
                setMessage("Signup successful! Please login.");
                setIsLogin(true);
            }
        } catch (err) {
            setMessage(err.response?.data?.error || "An error occurred");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input 
                        type="text" 
                        placeholder="Username" 
                        required
                        style={styles.input}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        required
                        style={styles.input}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button type="submit" style={styles.button}>
                        {isLogin ? 'Enter System' : 'Create Account'}
                    </button>
                </form>
                
                <p style={styles.toggleText} onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                </p>
                {message && <p style={styles.message}>{message}</p>}
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
    card: { padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    input: { padding: '10px', borderRadius: '4px', border: '1px solid #ddd' },
    button: { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    toggleText: { marginTop: '1rem', color: '#007bff', cursor: 'pointer', fontSize: '0.9rem' },
    message: { marginTop: '1rem', color: 'red', fontSize: '0.8rem' }
};

export default AuthPage;