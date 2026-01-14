import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import api from "../utils/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialising, setIsInitialising] = useState(true);

  // Initialise – read token from localStorage & verify it
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("authToken");
      const saved = localStorage.getItem("currentUser");

      if (token && saved) {
        // put token in every request (for both axios and api)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          // Use api instance which has automatic token injection
          const res = await api.get("/api/users/profile");
          setAuthToken(token);
          setCurrentUser(res.data);
        } catch (err) {
          // token invalid → wipe everything
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          delete axios.defaults.headers.common["Authorization"];
          delete api.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
      setIsInitialising(false);
    };

    initAuth();
  }, []);

  //  LOGIN - Use api instance instead of hardcoded URL
  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log("🔵 Logging in with api instance...");
      
      // ✅ FIX: Use api instance which automatically detects mobile/desktop
      const res = await api.post("/api/auth/login", { 
        email, 
        password 
      });
      const { token, user } = res.data;

      console.log("✅ Backend returned user object:", user);
      console.log("👤 User role from backend:", user.role);
      console.log("🆔 User ID:", user.id);
      console.log("📧 User email:", user.email);

      localStorage.setItem("authToken", token);
      localStorage.setItem("currentUser", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setAuthToken(token);
      // Keep login flow simple: trust login payload as current user
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      console.log("✅ Auth state updated. Returning role:", user.role);
      toast.success("Login successful");
      return user.role;
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  //  LOGOUT
  const logout = (navigate) => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("adminCurrentSection");
    localStorage.removeItem("studentCurrentSection");
    setAuthToken(null);
    setCurrentUser(null);
    delete axios.defaults.headers.common["Authorization"];
    delete api.defaults.headers.common["Authorization"];
    toast.success("Logged out");
    navigate?.("/login");
  };

  // REGISTER
  const register = async (formData) => {
    setLoading(true);
    try {
      // Public registration is disabled. Admins must create accounts.
      toast.error("Registration is disabled. Please contact your administrator to create an account.");
      throw new Error("Registration disabled");
    } catch (err) {
      console.error("❌ Registration error:", err.response?.data || err.message);
      // bubble up
      toast.error(err.response?.data?.message || err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile after edit (syncs currentUser with latest data)
  const updateProfile = async (updatedData) => {
    setLoading(true);
    try {
      // Use api instance with automatic token injection
      const res = await api.put("/api/users/profile", updatedData);
      const updatedUser = res.data;
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully");
      return updatedUser;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        authToken,
        loading,
        isInitialising, 
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};