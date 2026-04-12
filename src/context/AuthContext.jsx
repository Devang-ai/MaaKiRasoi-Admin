import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on mount
        const storedUser = localStorage.getItem("adminUser");
        const token = localStorage.getItem("token");
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user: userData, admin } = response.data;
            const finalUser = userData || admin;

            setUser(finalUser);
            localStorage.setItem("adminUser", JSON.stringify(finalUser));
            localStorage.setItem("token", token);

            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || "Login failed. Please try again."
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("adminUser");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
