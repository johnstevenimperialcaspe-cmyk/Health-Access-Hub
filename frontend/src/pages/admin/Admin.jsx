import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import api from "../../utils/axios";

/* UI COMPONENTS */
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";
import Drawer from "@mui/material/Drawer";

import {
  Box,
  Container,
  Button,
  TextField,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InfoIcon from "@mui/icons-material/Info";

import {
  getAvailableSlotsForDate,
  validateAppointmentTime,
  getMinimumAllowedDate,
} from "../../utils/appointmentSlotHelper";

/* PAGE SECTIONS */
import Dashboard from "./Dashboard";
import Account from "./Account";
import HealthRecords from "./HealthRecords";
import Appointments from "./Appointments";
import Notifications from "./Notifications";
import StudentsRecords from "./StudentsRecords";
import FacultiesRecords from "./FacultiesRecords";
import NonAcademicRecords from "./NonAcademicRecords";
import PatientRecords from "./PatientRecords";
import Examinations from "./Examinations";
import PhysicalMedicalExam from "./PhysicalMedicalExam";
import Users from "./Users";
import Reports from "./Reports";
import Logbook from "./Logbook";
import LogbookV2 from "./LogbookV2";
import Evaluations from "./Evaluations";
import AuditLogs from "./AuditLogs";

/*  AUTH GUARD – ensures only an admin can access this page                 */
const useAuthGuard = () => {
  const { currentUser, loading, logout, setCurrentUser } =
    useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // wait for auth init
    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }
    if (currentUser.role !== "admin") {
      toast.error("Access denied");
      logout(() => navigate("/login", { replace: true }));
    }
  }, [currentUser, loading, navigate, logout]);

  return {
    ready: !loading && currentUser?.role === "admin",
    user: currentUser,
    logout,
    setCurrentUser, // needed for profile updates
  };
};

/*  MAIN ADMIN COMPONENT                                                    */
const Admin = () => {
  /* ----  Auth guard & navigation ---- */
  const { ready, user, logout, setCurrentUser } = useAuthGuard();

  /* ----  Sidebar section (persisted) ---- */
  const [currentSection, setCurrentSection] = useState(() => {
    return localStorage.getItem("adminCurrentSection") || "dashboard";
  });

  /* ----  Mobile sidebar state ---- */
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  /* ----  Data containers for every section ---- */
  const [dashboardData, setDashboardData] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [nonAcademic, setNonAcademic] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [pendingAppointmentsCount, setPendingAppointmentsCount] = useState(0);

  /* ----  Modal state (Add / Edit) ---- */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({});

  /* ----  Appointment slot availability state ---- */
  const [slotAvailability, setSlotAvailability] = useState(null);
  const [slotCheckLoading, setSlotCheckLoading] = useState(false);
  const [timeValidationErrors, setTimeValidationErrors] = useState([]);

  /* ----  Drawer state (View health-record details) ---- */
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState({});

  /* ----  Global loading flag (shows spinner overlay) ---- */
  const [loading, setLoading] = useState(false);

  /* Persist the selected section whenever it changes */
  useEffect(() => {
    if (ready) {
      localStorage.setItem("adminCurrentSection", currentSection);
    }
  }, [currentSection, ready]);

  // Initial load for the current section when auth becomes ready
  useEffect(() => {
    if (!ready) return;
    handleSectionChange(currentSection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    setPendingAppointmentsCount(
      appointments.filter(
        (appt) => (appt.status || "").toLowerCase() === "scheduled"
      ).length
    );
  }, [appointments]);

  useEffect(() => {
    setDashboardData((prev) => ({
      ...prev,
      totalAppointments: pendingAppointmentsCount,
    }));
  }, [pendingAppointmentsCount]);

  /*  DATA LOADERS – each runs only when its section becomes active        */
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, apptRes, hrRes, notifRes, hrStatsRes] = await Promise.all([
        api.get("/api/admin/stats/overview").catch(() => ({ data: {} })),
        api
          .get("/api/appointments?limit=10")
          .catch(() => ({ data: { appointments: [] } })),
        api
          .get("/api/health-records?limit=10")
          .catch(() => ({ data: { healthRecords: [] } })),
        api
          .get("/api/notifications")
          .catch(() => ({ data: { notifications: [] } })),
        api
          .get("/api/health-records/stats/overview")
          .catch(() => ({ data: {} })),
      ]);

      const stats = statsRes.data || {};
      const fetchedAppointments = apptRes.data.appointments || [];
      // Keep appointments state in sync so other sections (and dashboard) can reuse the same data
      setAppointments(fetchedAppointments);
      // Count only scheduled appointments for the dashboard card
      const scheduledAppointments = fetchedAppointments.filter(
        (a) => a.status?.toLowerCase() === "scheduled"
      );
      // For recent activity we still filter the fetched appointments page
      const upcomingAppointments = fetchedAppointments.filter((a) =>
        ["confirmed", "pending", "scheduled", "in_progress"].includes(a.status?.toLowerCase())
      );

      // Get recent activity from audit logs if available
      let recentActivity = [];
      try {
        const auditRes = await api.get("/api/audit-logs?limit=10").catch(() => ({ data: { logs: [] } }));
        recentActivity = (auditRes.data.logs || []).map((log) => ({
          id: log.id,
          title: log.summary || `${log.action} ${log.target_model}`,
          subtitle: `By ${log.actor_name || "System"}`,
          time: new Date(log.created_at).toLocaleString(),
          icon: <CalendarTodayIcon />,
          color: "primary.main",
        }));
      } catch (err) {
        // If audit logs not available, use recent appointments/notifications
        recentActivity = [
          ...upcomingAppointments.slice(0, 5).map((a) => ({
            id: a.id,
            title: `Appointment: ${a.purpose}`,
            subtitle: `User ID: ${a.user_id}`,
            time: a.appointment_date,
            icon: <CalendarTodayIcon />,
            color: "primary.main",
          })),
          ...(notifRes.data.notifications || []).slice(0, 5).map((n) => ({
            id: n.id,
            title: n.title,
            subtitle: n.message,
            time: new Date(n.createdAt || n.created_at).toLocaleString(),
            icon: <NotificationsIcon />,
            color: "warning.main",
          })),
        ];
      }

      // Compute total PME records from health records stats (record_type = 'examination')
      const recordsByType = hrStatsRes.data?.recordsByType || [];
      const examinationType = recordsByType.find((t) => String(t._id).toLowerCase() === "examination");
      const totalPMERecords = examinationType?.count || 0;

      setDashboardData({
        totalUsers: stats.totalUsers ?? 0,
        // Always favor live computed count of scheduled appointments
        totalAppointments: scheduledAppointments.length,
        // Replace upcoming with PME records count for dashboard display
        upcomingAppointments: totalPMERecords,
        totalHealthRecords: stats.totalHealthRecords ?? (hrRes.data?.healthRecords?.length || 0),
        unreadNotifications:
          stats.unreadNotifications ?? (notifRes.data.notifications?.filter((n) => !n.isRead).length || 0),
        recentActivity: recentActivity.slice(0, 10),
      });
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadHealthStats = async () => {
    try {
      const res = await api.get("/api/health-records/stats/overview");
      return res.data;
    } catch (err) {
      toast.error("Failed to load health stats");
      return {};
    }
  };

  const loadHealthRecords = async () => {
    setLoading(true);
    try {
      const [recordsRes, statsRes] = await Promise.all([
        api.get("/api/health-records"),
        loadHealthStats(),
      ]);
      setHealthRecords(recordsRes.data.healthRecords || []);
      setDashboardData((prev) => ({ ...prev, healthStats: statsRes }));
    } catch (err) {
      toast.error("Failed to load health records");
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/appointments");
      setAppointments(res.data.appointments || []);
    } catch (err) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users");
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users?role=student");
      setStudents(res.data.users || []);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const loadFaculties = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users?role=faculty");
      setFaculties(res.data.users || []);
    } catch (err) {
      toast.error("Failed to load faculties");
    } finally {
      setLoading(false);
    }
  };

  const loadNonAcademic = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users?role=non_academic");
      setNonAcademic(res.data.users || []);
    } catch (err) {
      toast.error("Failed to load non-academic staff");
    } finally {
      setLoading(false);
    }
  };

  // Load all patient records (students, faculty, non-academic)
  const loadPatientRecords = async () => {
    setLoading(true);
    try {
      const [studentsRes, facultiesRes, nonAcademicRes] = await Promise.all([
        api.get("/api/users?role=student"),
        api.get("/api/users?role=faculty"),
        api.get("/api/users?role=non_academic"),
      ]);
      setStudents(studentsRes.data.users || []);
      setFaculties(facultiesRes.data.users || []);
      setNonAcademic(nonAcademicRes.data.users || []);
    } catch (err) {
      toast.error("Failed to load patient records");
    } finally {
      setLoading(false);
    }
  };

  const loadExaminations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/examinations");
      setExaminations(res.data.examinations || []);
    } catch (err) {
      toast.error("Failed to load examinations");
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const stats = await loadHealthStats();
      setDashboardData((prev) => ({ ...prev, reportStats: stats }));
    } catch (err) {
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  /*  SECTION SWITCH – decides which loader to call                         */
  const handleSectionChange = (section) => {
    setCurrentSection(section);
    switch (section) {
      case "dashboard":
        loadDashboard();
        break;
      case "health-records":
        loadHealthRecords();
        break;
      case "appointments":
        loadAppointments();
        break;
      case "notifications":
        loadNotifications();
        break;
      case "users":
        loadUsers();
        break;
      case "patient-records":
        loadPatientRecords();
        break;
      case "student-records":
        loadStudents();
        break;
      case "faculty-records":
        loadFaculties();
        break;
      case "non-academic-records":
        loadNonAcademic();
        break;
      case "examinations":
        loadExaminations();
        break;
      case "reports":
        loadReports();
        break;
      default:
        break;
    }
  };

  /*  MODAL HELPERS – open / change / submit                                */
  const openModal = (type, id = null, data = {}) => {
    setModalType(type);
    setEditId(id);
    setFormData(data);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time slot availability check when date changes (for appointments)
    if (modalType === "appointments" && name === "appointment_date") {
      checkSlotAvailability(value);
    }

    // Real-time time validation when time changes (for appointments)
    if (modalType === "appointments" && name === "appointment_time" && formData.appointment_date) {
      validateTimeInput(formData.appointment_date, value);
    } else if (modalType === "appointments" && name === "appointment_date" && formData.appointment_time) {
      validateTimeInput(value, formData.appointment_time);
    }
  };

  // Check available slots for selected date
  const checkSlotAvailability = async (date) => {
    if (!date) {
      setSlotAvailability(null);
      return;
    }

    setSlotCheckLoading(true);
    try {
      const availability = await getAvailableSlotsForDate(date);
      setSlotAvailability(availability);
    } catch (error) {
      console.error("Error checking slot availability:", error);
      setSlotAvailability(null);
      toast.error("Could not check slot availability");
    } finally {
      setSlotCheckLoading(false);
    }
  };

  // Validate time input (check weekday and operating hours)
  const validateTimeInput = (date, time) => {
    const validation = validateAppointmentTime(date, time);
    setTimeValidationErrors(validation.errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for validation errors when submitting NEW appointments
    if (modalType === "appointments" && !editId) {
      // When CREATING, check appointment validation
      if (timeValidationErrors.length > 0) {
        toast.error("Please fix appointment scheduling errors: " + timeValidationErrors[0]);
        return;
      }

      // Check if slots are full
      if (slotAvailability?.is_fully_booked) {
        toast.error("All appointment slots for this date are fully booked.");
        return;
      }

      // When creating, require date and time
      if (!formData.appointment_date || !formData.appointment_time || !formData.purpose) {
        toast.error("Please fill in date, time, and purpose for the appointment");
        return;
      }
    }

    setLoading(true);
    try {
      // Prepare payload; avoid sending protected ID fields on user updates
      let payload = { ...formData };
      if (modalType === "users" && editId) {
        delete payload.student_id;
        delete payload.employee_id;
        delete payload.faculty_id;
      }
      let url = `/api/${modalType}`;
      let method = "post";

      // Users: create vs update use different endpoints
      if (modalType === "users") {
        if (editId) {
          // Update existing user
          url = `/api/users/${editId}`;
          method = "put";
        } else {
          // Create new user
          url = "/api/admin/create-user";
          method = "post";
        }
      } else if (editId) {
        // Non-user resources use /api/<type>/<id> for update
        url = `/api/${modalType}/${editId}`;
        method = "put";
      }
      const response = await api[method](url, payload);
      
      // Success toast
      toast.success(
        `${modalType} ${editId ? "updated" : "added"} successfully`
      );
      
      // Update state immediately for appointments (no page reload)
      if (modalType === "appointments") {
        if (editId) {
          // Update existing appointment
          setAppointments((prevAppointments) =>
            prevAppointments.map((appt) =>
              appt.id === editId ? { ...appt, ...formData } : appt
            )
          );
        } else {
          // For new appointments, reload to get the new ID
          handleSectionChange(currentSection);
        }
        // Keep dashboard in sync
        loadDashboard();
      } else {
        // For other types, refresh the view and dashboard metrics
        handleSectionChange(currentSection);
        loadDashboard();
      }
      
      setSlotAvailability(null);
      setTimeValidationErrors([]);
    } catch (err) {
      console.error("Submit error:", err);
      const status = err.response?.status;
      const path = err.response?.config?.url || "unknown";
      const msg = err.response?.data?.message || err.message || "Operation failed";
      toast.error(`${msg}${status ? ` (HTTP ${status})` : ""}${path ? ` → ${path}` : ""}`);
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true);
    try {
      await api.delete(`/api/${type}/${id}`);
      toast.success(`${type} deleted successfully`);
      handleSectionChange(currentSection);
      loadDashboard();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /*  VIEW DRAWER – shows a single health-record in detail                  */
  const handleView = (id, data) => {
    setViewData(data);
    setViewOpen(true);
  };

  /*  PROFILE UPDATE – called from the Account component                    */
  const handleProfileUpdate = async (updatedData) => {
    setLoading(true);
    try {
      await api.put("/api/users/profile", updatedData);
      const res = await api.get("/api/users/profile");
      const freshUser = res.data;
      localStorage.setItem("currentUser", JSON.stringify(freshUser));
      setCurrentUser(freshUser); // update context
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  /*  EARLY RETURN – show spinner while auth resolves                      */
  if (!ready) return <LoadingSpinner />;

  /*  RENDER                                                                */
  return (
    <Box sx={{ 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      width: "100%"
    }}>
      {/* Navbar – shows user name & logout button */}
      <Navbar 
        onMenuClick={handleDrawerToggle} 
        onViewNotifications={() => handleSectionChange("notifications")}
      />

      <Box sx={{ 
        display: "flex", 
        flex: 1,
        overflow: "hidden",
        width: "100%"
      }}>
        {/* Sidebar – navigation between sections */}
        <Sidebar
          role={user.role}
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
          mobileOpen={mobileOpen}
          onMobileClose={handleDrawerToggle}
        />

        {/* Main content area */}
        <Box sx={{ 
          flexGrow: 1,
          overflow: "auto",
          width: { xs: "100%", md: "calc(100% - 250px)" },
          maxWidth: "100%"
        }}>
          <Container 
            maxWidth="xl" 
            sx={{ 
              mt: { xs: 2, md: 4 },
              px: { xs: 1, sm: 2, md: 3 },
              width: "100%",
              maxWidth: "100%"
            }}
          >
            {/* Global loading overlay */}
            {loading && <LoadingSpinner />}

            {/* SECTION ROUTING */}
            {currentSection === "dashboard" && (
              <Dashboard 
                data={dashboardData} 
                notifications={notifications}
                onViewNotifications={() => handleSectionChange("notifications")}
                onSectionChange={handleSectionChange}
              />
            )}
            {currentSection === "account" && (
              <Account currentUser={user} onUpdate={handleProfileUpdate} />
            )}
            {currentSection === "health-records" && (
              <HealthRecords
                records={healthRecords}
                stats={dashboardData.healthStats || {}}
                onAdd={() => openModal("health-records")}
                onEdit={(id, data) => openModal("health-records", id, data)}
                onDelete={(id) => handleDelete("health-records", id)}
                onView={handleView}
              />
            )}
            {currentSection === "appointments" && (
              <Appointments
                appointments={appointments}
                onEdit={(id, data) => openModal("appointments", id, data)}
                onDelete={(id) => handleDelete("appointments", id)}
                onStatusUpdate={async (id, updates) => {
                  try {
                    // Get the current appointment BEFORE updating
                    const currentAppt = appointments.find((a) => a.id === id);
                    if (!currentAppt) {
                      await api.put(`/api/appointments/${id}`, updates);
                      return;
                    }

                    await api.put(`/api/appointments/${id}`, updates);
                    
                    // Update appointments state immediately (no refresh needed)
                    setAppointments((prevAppointments) =>
                      prevAppointments.map((appt) =>
                        appt.id === id ? { ...appt, ...updates } : appt
                      )
                    );
                    toast.success("Appointment status updated successfully");
                    
                    // Create notification for the user
                    await api.post("/api/notifications", {
                      recipientId: currentAppt.user_id,
                      type: "appointment_update",
                      title: "Appointment Status Updated",
                      message: `Your appointment status has been updated to ${updates.status || currentAppt.status}`,
                      relatedAppointmentId: id,
                    });

                    // Refresh dashboard metrics so cards reflect changes
                    loadDashboard();
                  } catch (err) {
                    toast.error(err.response?.data?.message || "Failed to update status");
                  }
                }}
              />
            )}
            {currentSection === "notifications" && (
              <Notifications
                notifications={notifications}
                onAdd={() => openModal("notifications")}
                onEdit={(id, data) => openModal("notifications", id, data)}
                onDelete={(id) => handleDelete("notifications", id)}
              />
            )}
            {currentSection === "patient-records" && (
              <PatientRecords
                students={students}
                faculties={faculties}
                nonAcademic={nonAcademic}
                onEdit={(roleType, id, data) => {
                  // roleType is "student", "faculty", or "non_academic"
                  openModal("users", id, data);
                }}
                onDelete={(roleType, id) => {
                  handleDelete("users", id);
                }}
              />
            )}
            {currentSection === "student-records" && (
              <StudentsRecords
                students={students}
                onEdit={(id, data) => openModal("users", id, data)}
                onDelete={(id) => handleDelete("users", id)}
              />
            )}
            {currentSection === "faculty-records" && (
              <FacultiesRecords
                faculties={faculties}
                onEdit={(id, data) => openModal("users", id, data)}
                onDelete={(id) => handleDelete("users", id)}
              />
            )}
            {currentSection === "non-academic-records" && (
              <NonAcademicRecords
                nonAcademic={nonAcademic}
                onEdit={(id, data) => openModal("users", id, data)}
                onDelete={(id) => handleDelete("users", id)}
              />
            )}
            {currentSection === "examinations" && (
              <PhysicalMedicalExam />
            )}
            {currentSection === "users" && (
              <Users
                users={users}
                onAdd={() => openModal("users")}
                onEdit={(id, data) => openModal("users", id, data)}
                onDelete={(id) => handleDelete("users", id)}
                onToggleActive={async (userId, makeActive) => {
                  try {
                    // Call backend to toggle active status
                    if (makeActive) {
                      await api.put(`/api/users/${userId}/activate`);
                    } else {
                      await api.put(`/api/users/${userId}/deactivate`);
                    }

                    // Update local state to reflect change without full reload
                    setUsers((prev) =>
                      prev.map((u) =>
                        u.id === userId ? { ...u, is_active: makeActive ? 1 : 0 } : u
                      )
                    );

                    // Notify admin and affected user via toast; backend logs audit
                    toast.success(`User ${makeActive ? "activated" : "deactivated"} successfully`);

                    // Refresh dashboard metrics (e.g., totals, recent activity)
                    loadDashboard();
                  } catch (err) {
                    console.error("Toggle active error:", err);
                    toast.error("Failed to update active status");
                  }
                }}
              />
            )}
            {currentSection === "logbook" && (
              <Logbook />
            )}
            {currentSection === "logbook-v2" && (
              <LogbookV2 />
            )}
            {currentSection === "evaluations" && (
              <Evaluations />
            )}
            {currentSection === "audit-logs" && (
              <AuditLogs />
            )}
            {currentSection === "reports" && (
              <Reports stats={dashboardData.reportStats || {}} />
            )}
          </Container>
        </Box>
      </Box>

      {/*  ADD / EDIT MODAL – generic form, content depends on modalType */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? `Edit ${modalType}` : `Add ${modalType}`}
      >
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Prevent Enter key from submitting the form while editing fields like Select/TextField
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          {/* USER FORM – DYNAMIC ROLE-SPECIFIC FIELDS */}
          {modalType === "users" && (
            <>
              {/* Role Selection */}
              <FormControl fullWidth sx={{ mb: 2 }} required>
                <InputLabel>Role *</InputLabel>
                <Select
                  name="role"
                  value={formData.role || ""}
                  onChange={handleChange}
                  label="Role *"
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="non_academic">Non-Academic Staff</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>

              {/* BASIC FIELDS (ALL ROLES) */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name *"
                    name="first_name"
                    value={formData.first_name || ""}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Middle Name"
                    name="middle_name"
                    value={formData.middle_name || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name *"
                    name="last_name"
                    value={formData.last_name || ""}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>

              {/* PASSWORD FIELDS */}
              <TextField
                label="Password (Leave blank for auto-generated)"
                name="password"
                type="password"
                value={formData.password || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2, mb: 2 }}
                helperText="If not provided, a random password will be generated"
              />

              {/* COMMON OPTIONAL FIELDS */}
              <TextField
                label="Birthday"
                name="birthday"
                type="date"
                value={formData.birthday || ""}
                onChange={(e) => {
                  const birthday = e.target.value;
                  handleChange(e);
                  if (birthday) {
                    const birthDate = new Date(birthday);
                    const age = Math.floor(
                      (new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
                    );
                    setFormData((prev) => ({ ...prev, age: age.toString() }));
                  }
                }}
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              {formData.birthday && (
                <TextField
                  label="Age (Auto-calculated)"
                  name="age"
                  value={formData.age || ""}
                  fullWidth
                  sx={{ mb: 2 }}
                  disabled
                />
              )}

              {/* STUDENT-SPECIFIC FIELDS */}
              {formData.role === "student" && (
                <>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Student Information
                    </Typography>
                  </Divider>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>College</InputLabel>
                    <Select
                      name="college"
                      value={formData.college || ""}
                      onChange={handleChange}
                    >
                      <MenuItem value="CAS">CAS</MenuItem>
                      <MenuItem value="CCS">CCS</MenuItem>
                      <MenuItem value="CCJE">CCJE</MenuItem>
                      <MenuItem value="CIT">CIT</MenuItem>
                      <MenuItem value="CED">CED</MenuItem>
                      <MenuItem value="CEN">CEN</MenuItem>
                      <MenuItem value="CHTM">CHTM</MenuItem>
                      <MenuItem value="CBPA">CBPA</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Program</InputLabel>
                    <Select
                      name="course"
                      value={formData.course || ""}
                      onChange={handleChange}
                    >
                      <MenuItem value="CBPA">Bachelor of Science in Business Administration Major in Marketing Management</MenuItem>
                      <MenuItem value="CBPA">Bachelor of Science in Business Administration Major in Human Resource Development Management</MenuItem>
                      <MenuItem value="CBPA">Bachelor of Science in Entrepreneurship</MenuItem>
                      <MenuItem value="CBPA">Bachelor of Science in Office Administration</MenuItem>
                      <MenuItem value="CED">Bachelor in Secondary Education Major in Science</MenuItem>
                      <MenuItem value="CED">Bachelor in Secondary Education Major in Mathematics</MenuItem>
                      <MenuItem value="CED">Bachelor in Secondary Education Major in Filipino</MenuItem>
                      <MenuItem value="CED">Bachelor in Special Needs Education</MenuItem>
                      <MenuItem value="CED">Bachelor in Technology and Livelihood Education Major in Home Economics</MenuItem>
                      <MenuItem value="CED">Bachelor in Technology and Livelihood Education Major in Industrial Arts</MenuItem>
                      <MenuItem value="CED">Bachelor in Professional Education</MenuItem>
                      <MenuItem value="CEN">Bachelor of Science in Chemical Engineering</MenuItem>
                      <MenuItem value="CEN">Bachelor of Science in Civil Engineering</MenuItem>
                      <MenuItem value="CEN">Bachelor of Science in Electrical Engineering</MenuItem>
                      <MenuItem value="CEN">Bachelor of Science in Electronics and Communication Engineering</MenuItem>
                      <MenuItem value="CEN">Bachelor of Science in Mechanical Engineering</MenuItem>
                      <MenuItem value="CEN">Bachelor of Science in Computer Engineering</MenuItem>
                      <MenuItem value="CAS">Bachelor of Science in Applied Physics with Computer Science Emphasis</MenuItem>
                      <MenuItem value="CAS">Bachelor of Science in Psychology</MenuItem>
                      <MenuItem value="CAS">Bachelor of Science in Mathematics</MenuItem>
                      <MenuItem value="CAFA">Bachelor of Science in Architecture</MenuItem>
                      <MenuItem value="CAFA">Bachelor of Science in Interior Design</MenuItem>
                      <MenuItem value="CAFA">Bachelor in Fine Arts Major in Painting</MenuItem>
                      <MenuItem value="CAFA">Bachelor in Fine Arts Major in Visual Communication</MenuItem>
                      <MenuItem value="CIT">Bachelor of Science in Industrial Technology Major in Automotive Technology</MenuItem>
                      <MenuItem value="CIT">Bachelor of Science in Industrial Technology Major in Electrical Technology</MenuItem>
                      <MenuItem value="CIT">Bachelor of Science in Industrial Technology Major in Electronics Technology</MenuItem>
                      <MenuItem value="CIT">Bachelor of Science in Industrial Technology Major in Food Technology</MenuItem>
                      <MenuItem value="CIT">Bachelor of Science in Industrial Technology Major in Fashion and Apparel Technology</MenuItem>
                      <MenuItem value="CIT">Bachelor of Science in Industrial Technology Major in Industrial Chemistry</MenuItem>
                      <MenuItem value="CIT">Bachelor of Science in Industrial Technology Major in Drafting Technology</MenuItem>
                      <MenuItem value="CIT">Bachelor of Science in Industrial Technology Major in Machine Shop Technology</MenuItem>
                      <MenuItem value="CIT">Bachelor of Science in Industrial Technology Major in Refrigeration and Air Conditioning</MenuItem>
                      <MenuItem value="CHTM">Bachelor of Science in Tourism Management</MenuItem>
                      <MenuItem value="CHTM">Bachelor of Science in Hospitality Management</MenuItem>
                      <MenuItem value="CCS">Bachelor of Science in Computer Science</MenuItem>
                      <MenuItem value="CCS">Bachelor of Science in Information Technology</MenuItem>
                      <MenuItem value="CCJE">Bachelor of Science in Criminal Justice Education</MenuItem>
                    </Select>
                  </FormControl>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Year Level"
                        name="year_level"
                        value={formData.year_level || ""}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Section"
                        name="section"
                        value={formData.section || ""}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl variant="outlined" size="small" sx={{ width: 240 }}>
                        <InputLabel id="student-type-label" shrink={Boolean(formData.student_type)}>Student Type</InputLabel>
                        <Select
                          labelId="student-type-label"
                          id="student-type"
                          name="student_type"
                          value={formData.student_type || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({ ...prev, student_type: val }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                            }
                          }}
                          label="Student Type"
                          sx={{ minHeight: 40 }}
                        >
                          <MenuItem value="regular">Regular</MenuItem>
                          <MenuItem value="irregular">Irregular</MenuItem>
                          <MenuItem value="transferee">Transferee</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  
                </>
              )}

              {/* FACULTY-SPECIFIC FIELDS */}
              {formData.role === "faculty" && (
                <>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Faculty Information
                    </Typography>
                  </Divider>

                  <TextField
                    label="Department"
                    name="department"
                    value={formData.department || ""}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    placeholder="e.g., Computer Science, English"
                  />

                  <TextField
                    label="Position"
                    name="position"
                    value={formData.position || ""}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    placeholder="e.g., Assistant Professor, Instructor"
                  />
                </>
              )}

              {/* NON-ACADEMIC STAFF-SPECIFIC FIELDS */}
              {formData.role === "non_academic" && (
                <>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Non-Academic Staff Information
                    </Typography>
                  </Divider>

                  <TextField
                    label="Department"
                    name="department"
                    value={formData.department || ""}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Position"
                    name="position"
                    value={formData.position || ""}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </>
              )}

              {/* ADMIN-SPECIFIC FIELDS */}
              {formData.role === "admin" && (
                <>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Admin Information
                    </Typography>
                  </Divider>

                  <TextField
                    label="Department"
                    name="department"
                    value={formData.department || ""}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </>
              )}
            </>
          )}

          {/* APPOINTMENT FORM */}
          {modalType === "appointments" && (
            <>
              {/* Operating Hours Info */}
              <Alert icon={<InfoIcon />} severity="info" sx={{ mb: 3 }}>
                <strong>Operating Hours:</strong> 8:00 AM - 6:00 PM (Monday to Friday only)
              </Alert>

              <TextField
                label="Date"
                name="appointment_date"
                type="date"
                value={formData.appointment_date || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                inputProps={{
                  min: getMinimumAllowedDate(),
                }}
              />
              <TextField
                label="Time"
                name="appointment_time"
                type="time"
                value={formData.appointment_time || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                inputProps={{
                  min: "08:00",
                  max: "18:00",
                }}
              />
              <TextField
                label="Purpose"
                name="purpose"
                value={formData.purpose || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status || ""}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
                placeholder="Add any notes about this appointment..."
              />

              {/* Validation Errors */}
              {timeValidationErrors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {timeValidationErrors.map((error, idx) => (
                    <div key={idx}>{error}</div>
                  ))}
                </Alert>
              )}
            </>
          )}

          {/* HEALTH-RECORD FORM (most complex) */}
          {modalType === "health-records" && (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Student</InputLabel>
                <Select
                  name="student_id"
                  value={formData.student_id || ""}
                  onChange={handleChange}
                >
                  {students.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.first_name} {s.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Record Type</InputLabel>
                <Select
                  name="record_type"
                  value={formData.record_type || ""}
                  onChange={handleChange}
                >
                  <MenuItem value="consultation">Consultation</MenuItem>
                  <MenuItem value="vaccination">Vaccination</MenuItem>
                  <MenuItem value="medical_clearance">
                    Medical Clearance
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Date of Visit"
                name="date_of_visit"
                type="date"
                value={formData.date_of_visit || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Chief Complaint"
                name="chief_complaint"
                multiline
                rows={3}
                value={formData.chief_complaint || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Diagnosis"
                name="diagnosis"
                multiline
                rows={3}
                value={formData.diagnosis || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Treatment"
                name="treatment"
                multiline
                rows={3}
                value={formData.treatment || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />

              {/* VITAL SIGNS GRID */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {[
                  "vital_blood_pressure",
                  "vital_heart_rate",
                  "vital_temperature",
                  "vital_weight",
                  "vital_height",
                  "vital_bmi",
                ].map((field) => (
                  <Grid xs={6} key={field}>
                    <TextField
                      label={field.replace("vital_", "").toUpperCase()}
                      name={field}
                      value={formData[field] || ""}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                ))}
              </Grid>

              <ToggleButton
                value="follow_up_required"
                selected={!!formData.follow_up_required}
                onChange={() =>
                  setFormData((p) => ({
                    ...p,
                    follow_up_required: !p.follow_up_required,
                  }))
                }
              >
                Follow-Up Required
              </ToggleButton>

              {formData.follow_up_required && (
                <TextField
                  label="Next Visit Date"
                  name="next_visit_date"
                  type="date"
                  value={formData.next_visit_date || ""}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />
              )}

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority || ""}
                  onChange={handleChange}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>

              <TextField
                type="file"
                name="attachments"
                multiple
                sx={{ mb: 2 }}
              />
              <TextField
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes || ""}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
              />
            </>
          )}

          {/* FORM ACTIONS */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid xs={6}>
              <Button
                onClick={() => setModalOpen(false)}
                variant="outlined"
                fullWidth
              >
                Cancel
              </Button>
            </Grid>
            <Grid xs={6}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                disabled={
                  modalType === "appointments" && (
                    timeValidationErrors.length > 0 ||
                    slotAvailability?.is_fully_booked ||
                    slotCheckLoading
                  )
                }
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </form>
      </Modal>

      {/*  DETAIL DRAWER – shows a single health-record                   */}
      <Drawer anchor="right" open={viewOpen} onClose={() => setViewOpen(false)}>
        <Box sx={{ width: 400, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Record Details</Typography>
            <IconButton onClick={() => setViewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 2 }} />
          <List>
            <ListItem>
              <ListItemText
                primary="Student Info"
                secondary={`${viewData.student_first_name} ${
                  viewData.student_last_name
                } | ID: ${viewData.student_id} | Course: ${
                  viewData.course || "N/A"
                } | Contact: ${viewData.phone_number || "N/A"}`}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Record Type"
                secondary={viewData.record_type}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Chief Complaint"
                secondary={viewData.chief_complaint || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Diagnosis"
                secondary={viewData.diagnosis || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Treatment"
                secondary={viewData.treatment || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Vital Signs"
                secondary={`BP: ${
                  viewData.vital_blood_pressure || "N/A"
                } | HR: ${viewData.vital_heart_rate || "N/A"} | RR: ${
                  viewData.vital_respiratory_rate || "N/A"
                } | Temp: ${viewData.vital_temperature || "N/A"} | BMI: ${viewData.vital_bmi || "N/A"}`}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Follow-Up Required"
                secondary={viewData.follow_up_required ? "Yes" : "No"}
              />
            </ListItem>
            {viewData.follow_up_required && (
              <ListItem>
                <ListItemText
                  primary="Next Visit Date"
                  secondary={viewData.next_visit_date || "N/A"}
                />
              </ListItem>
            )}
            <ListItem>
              <ListItemText primary="Attachments" secondary="List files here" />
            </ListItem>
            <ListItem>
              <ToggleButton
                value="confidential"
                selected={viewData.confidential}
              >
                Mark as Confidential
              </ToggleButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Admin;
