import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/login.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            // Mock API call
            setTimeout(() => {
                setSubmitted(true);
            }, 1000);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>Recovery</h1>
                        <p>Reset your password</p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="login-btn">
                                Send Reset Link
                            </button>

                            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                <Link to="/login" className="forgot-password-link" style={{ float: 'none' }}>
                                    ← Back to Login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✉️</div>
                            <h3 style={{ margin: "0 0 0.5rem 0" }}>Check your email</h3>
                            <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
                                We have sent a password reset link to <strong>{email}</strong>
                            </p>
                            <Link to="/login" className="login-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                                Back to Login
                            </Link>
                        </div>
                    )}

                    <div className="login-footer">
                        <p>Admin Portal Support</p>
                        <p>support@maakirasoi.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
