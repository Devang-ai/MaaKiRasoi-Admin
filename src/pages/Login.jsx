import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChefHat, ShieldCheck, Zap, Globe } from "lucide-react";
import "../styles/login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const result = await login(email, password);
        if (result.success) {
            navigate("/");
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="login-portal">
            {/* Left Side: Hero Section (Desktop Only) */}
            <div className="login-hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-logo">
                        <ChefHat size={48} />
                        <span>Maa Ki Rasoi</span>
                    </div>
                    
                    <h1>Manage Your Food Empire with Precision.</h1>
                    <p>The ultimate control center for real-time order tracking, restaurant management, and rider coordination.</p>
                    
                    <div className="feature-grid">
                        <div className="feature-item">
                            <Zap size={20} />
                            <span>Real-time Analytics</span>
                        </div>
                        <div className="feature-item">
                            <ShieldCheck size={20} />
                            <span>Secure Transactions</span>
                        </div>
                        <div className="feature-item">
                            <Globe size={20} />
                            <span>Fleet Command</span>
                        </div>
                    </div>
                </div>
                <div className="hero-footer">
                    <p>© 2026 Maa Ki Rasoi Technologies Private Limited.</p>
                </div>
            </div>

            {/* Right Side: Form Section */}
            <div className="login-form-area">
                <div className="login-card-wrapper">
                    <div className="login-mobile-header">
                        <ChefHat size={32} />
                        <h2>Maa Ki Rasoi</h2>
                    </div>

                    <div className="form-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your administrator account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="modern-form">
                        <div className="form-group">
                            <label>Official Email</label>
                            <input
                                type="email"
                                placeholder="e.g. admin@maakirasoi.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Secret Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="error-pill">
                                <span>{error}</span>
                            </div>
                        )}

                        <button type="submit" className="portal-login-btn">
                            Enter Dashboard
                        </button>
                    </form>

                    <div className="portal-footer">
                        <p>Authorized personnel only. Access is monitored and logged.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
