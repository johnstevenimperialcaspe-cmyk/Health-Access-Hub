import React, { useContext, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import Login from "./pages/Login";
import Admin from "./pages/admin/Admin";
import Faculty from "./pages/faculty/Faculty";
import NonAcademic from "./pages/nonacademic/NonAcademic";
import Student from "./pages/students/Student";
import PrintExam from "./pages/PrintExam";
import PrintExamStudent from "./pages/PrintExamStudent";
import PrintExamFaculty from "./pages/PrintExamFaculty";
import PrintExamNonAcademic from "./pages/PrintExamNonAcademic";
import PrintExamAdmin from "./pages/PrintExamAdmin";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/faculty" element={<Faculty />} />
      <Route path="/non-academic" element={<NonAcademic />} />
      <Route path="/student" element={<Student />} />
      <Route path="/print/exam/:id" element={<PrintExam />} />
      <Route path="/print/student/:id" element={<PrintExamStudent />} />
      <Route path="/print/faculty/:id" element={<PrintExamFaculty />} />
      <Route path="/print/non-academic/:id" element={<PrintExamNonAcademic />} />
      <Route path="/print/admin/:id" element={<PrintExamAdmin />} />
      <Route path="*" element={<SmartRedirect />} />
    </Routes>
  );
}

/*  Smart redirect – runs once after auth is ready   */
function SmartRedirect() {
  const { currentUser, loading, isInitialising } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || isInitialising) {
      console.log("🔄 SmartRedirect: Still loading/initialising...");
      return; // still checking token
    }

    console.log("🔄 SmartRedirect: Auth ready. currentUser:", currentUser);

    if (currentUser) {
      const map = {
        admin: "/admin",
        faculty: "/faculty",
        student: "/student",
        non_academic: "/non-academic",
      };
      
      console.log("👤 User role:", currentUser.role);
      console.log("🗺️  Available mappings:", Object.keys(map));
      
      const targetPath = map[currentUser.role] ?? "/";
      console.log("📍 Navigating to:", targetPath);
      
      navigate(targetPath, { replace: true });
    } else {
      console.log("❌ No currentUser, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [currentUser, loading, isInitialising, navigate]);

  return null;
}

export default App;
