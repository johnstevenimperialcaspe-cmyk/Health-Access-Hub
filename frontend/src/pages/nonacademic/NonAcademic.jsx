import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import api from "../../utils/axios";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";
import EvaluationForm from "../../components/EvaluationForm";
import PreAppointmentAssessment from "../../components/PreAppointmentAssessment";

import Dashboard from "./Dashboard";
import HealthRecords from "./HealthRecords";
import Appointments from "./Appointments";
import Notifications from "./Notifications";
import Account from "./Account";
import PhysicalMedicalExam from "./PhysicalMedicalExam";
import VisitHistory from "./VisitHistory";


import {
  Box,
  Container,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  Divider,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotesIcon from "@mui/icons-material/Notes";
import InfoIcon from "@mui/icons-material/Info";

import {
  getAvailableSlotsForDate,
  validateAppointmentTime,
  getMinimumAllowedDate,
  isWeekday,
  isWithinOperatingHours,
} from "../../utils/appointmentSlotHelper";

// AUTH GUARD
const useAuthGuard = () => {
  const { currentUser, loading, isInitialising, logout } =
    useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || isInitialising) return;

    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (currentUser.role !== "non_academic") {
      toast.error("Access denied");
      logout(() => navigate("/login", { replace: true }));
    }
  }, [currentUser, loading, isInitialising, navigate, logout]);

  return {
    ready: !loading && !isInitialising && currentUser?.role === "non_academic",
    user: currentUser,
    logout,
  };
};

// MAIN COMPONENT
const NonAcademic = () => {
  const { ready, user, logout } = useAuthGuard();
  const navigate = useNavigate();

  // Section state (persisted in localStorage)
  const [currentSection, setCurrentSection] = useState(() => {
    return localStorage.getItem("nonAcademicCurrentSection") || "dashboard";
  });
  // 2.1 Mobile sidebar state
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  // Persist section on change
  useEffect(() => {
    if (ready) {
      localStorage.setItem("nonAcademicCurrentSection", currentSection);
    }
  }, [currentSection, ready]);

  // Data state
  const [dashboardData, setDashboardData] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({});
  
  // Evaluation modal state
  const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Pre-appointment assessment modal state
  const [assessmentModalVisible, setAssessmentModalVisible] = useState(false);

  // Appointment slot availability state
  const [slotAvailability, setSlotAvailability] = useState(null);
  const [slotCheckLoading, setSlotCheckLoading] = useState(false);
  const [timeValidationErrors, setTimeValidationErrors] = useState([]);

  // Load data functions
  const loadAppointments = async () => {
    try {
      const res = await api.get("/api/appointments");
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Error loading appointments:", err);
      if (err.response?.status === 403) {
        toast.error(err.response?.data?.message || "Access denied. Please check your permissions.");
        console.error("403 Error details:", err.response?.data);
      } else if (err.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error("Failed to load appointments");
      }
    }
  };

  const loadHealthRecords = async () => {
    try {
      const res = await api.get("/api/health-records");
      setHealthRecords(res.data.healthRecords || []);
    } catch (err) {
      console.error("Error loading health records:", err);
      if (err.response?.status === 403) {
        toast.error(err.response?.data?.message || "Access denied. Please check your permissions.");
        console.error("403 Error details:", err.response?.data);
      } else if (err.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error("Failed to load health records");
      }
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Error loading notifications:", err);
      if (err.response?.status === 403) {
        toast.error(err.response?.data?.message || "Access denied. Please check your permissions.");
        console.error("403 Error details:", err.response?.data);
      } else if (err.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error("Failed to load notifications");
      }
    }
  };

  // Load data from APIs when ready
  useEffect(() => {
    if (!ready) return;
    Promise.all([
      loadAppointments(),
      loadHealthRecords(),
      loadNotifications(),
    ]).catch((err) => {
      console.error("Error loading data:", err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Compute dashboard data from current state when ready or when data changes
  useEffect(() => {
    if (!ready) return;

    setDashboardData({
      totalRecords: healthRecords.length,
      ongoingTreatment: healthRecords.filter((r) => 
        r.chief_complaint === "Physical/Medical Examination" || r.diagnosis
      ).length,
      unreadNotifications: notifications.filter((n) => !n.isRead).length,
      recentNotifications: notifications.slice(0, 5).map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        isRead: !!n.isRead,
      })),
    });
  }, [ready, healthRecords, notifications]);

  // Show spinner while auth resolves
  if (!ready) return <LoadingSpinner />;

  // SECTION CHANGE HANDLER
  const handleSectionChange = (section) => {
    setCurrentSection(section);
  };

  // MODAL HELPERS
  const openModal = (type, id = null, data = {}) => {
    setModalType(type);
    setEditId(id);
    setFormData(data);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time slot availability check when date changes
    if (name === "appointment_date") {
      checkSlotAvailability(value);
    }

    // Real-time time validation when time changes
    if (name === "appointment_time" && formData.appointment_date) {
      validateTimeInput(formData.appointment_date, value);
    } else if (name === "appointment_date" && formData.appointment_time) {
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

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    
    // Check for validation errors
    if (timeValidationErrors.length > 0) {
      toast.error("Please fix appointment scheduling errors: " + timeValidationErrors[0]);
      return;
    }

    // Check if slots are full
    if (slotAvailability?.is_fully_booked) {
      toast.error("All appointment slots for this date are fully booked.");
      return;
    }

    try {
      if (editId) {
        await api.put(`/api/appointments/${editId}`, formData);
        toast.success("Appointment updated successfully");
      } else {
        await api.post("/api/appointments", formData);
        toast.success("Appointment scheduled successfully");
      }
      await loadAppointments();
      await loadNotifications(); // Refresh notifications
      setModalOpen(false);
      setFormData({});
      setEditId(null);
      setSlotAvailability(null);
      setTimeValidationErrors([]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0] || "Failed to save appointment";
      toast.error(errorMsg);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }
    try {
      await api.delete(`/api/appointments/${id}`);
      toast.success("Appointment deleted successfully");
      await loadAppointments();
      await loadNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete appointment");
    }
  };

  const handleEvaluateAppointment = (appointment) => {
    setSelectedAppointment({
      appointmentId: appointment.id,
      visitDate: appointment.appointment_date,
      purpose: appointment.purpose,
    });
    setEvaluationModalVisible(true);
  };

  const handleAssessmentComplete = (assessmentResult) => {
    // Pre-fill the purpose and notes based on assessment
    setFormData({
      purpose: assessmentResult.purpose,
      notes: assessmentResult.assessmentData.concernDetails || "",
    });
    setAssessmentModalVisible(false);
    // Now open the appointment modal
    setModalType("appointments");
    setModalOpen(true);
  };

  const handleExaminationSubmit = async (data) => {
    try {
      if (data.id) {
        await api.put(`/api/examinations/${data.id}`, data);
        toast.success("Examination updated successfully");
      } else {
        // Use employee_id from user object, just like student uses student_id
        await api.post("/api/examinations", {
          employeeId: user.employee_id,
          date: data.date,
          physical: data.physical,
          medical: data.medical,
        });
        toast.success("Examination submitted successfully");
      }
      await loadHealthRecords();
      await loadNotifications();
      setModalOpen(false);
      setFormData({});
      setEditId(null);
    } catch (err) {
      console.error("Examination submission error:", err);
      toast.error(err.response?.data?.message || "Failed to save examination");
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      toast.success("Notification marked as read");
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, read: true } : n
        )
      );
      await loadNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark notification as read");
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      toast.success("All notifications marked as read");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      await loadNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark all notifications as read");
    }
  };

  const handleConfirmedLogout = () => {
    logout(() => navigate("/login", { replace: true }));
  };

  // RENDER
  return (
    <Box sx={{
      overflow: "hidden",
      width: "100%"
    }}>
      <Navbar onMenuClick={handleDrawerToggle} />

      <Box 
        display="flex"
        sx={{
          overflow: "hidden",
          width: "100%"
        }}
      >
        <Sidebar
          role={user.role}
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
          mobileOpen={mobileOpen}
          onMobileClose={handleDrawerToggle}
        />

        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 1, sm: 2, md: 3 }, 
            bgcolor: "#f5f5f5",
            overflow: "auto",
            width: { xs: "100%", md: "calc(100% - 250px)" },
            maxWidth: "100%"
          }}
        >
          <Container 
            maxWidth="lg"
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            {/* DASHBOARD */}
            {currentSection === "dashboard" && (
              <Dashboard
                data={dashboardData}
                staffName={`${user.first_name} ${user.last_name}`}
                staffId={user.non_acad_id || user.employee_id || "N/A"}
                onViewAllNotifications={() =>
                  handleSectionChange("notifications")
                }
              />
            )}

            {/* PROFILE */}
            {currentSection === "account" && <Account currentUser={user} />}

            {/* APPOINTMENTS */}
            {currentSection === "appointments" && (
              <Appointments
                appointments={appointments}
                onAdd={() => {
                  setFormData({});
                  setEditId(null);
                  openModal("appointments");
                }}
                onEdit={(id, data) => {
                  setFormData({
                    appointment_date: data.appointment_date,
                    appointment_time: data.appointment_time,
                    purpose: data.purpose,
                    notes: data.notes || "",
                  });
                  setEditId(id);
                  openModal("appointments");
                }}
                onDelete={handleDeleteAppointment}
                onEvaluate={handleEvaluateAppointment}
              />
            )}

            {/* HEALTH RECORDS */}
            {currentSection === "health-records" && (
              <HealthRecords records={healthRecords} />
            )}

            {/* PHYSICAL & MEDICAL EXAM */}
            {currentSection === "examinations" && (
              <PhysicalMedicalExam
                userId={user.employee_id}
                onSubmit={handleExaminationSubmit}
                onLoadRecords={loadHealthRecords}
              />
            )}
            {/* VISIT HISTORY & EVALUATIONS */}
            {currentSection === "visit-history" && (
              <VisitHistory />
            )}



            {/* NOTIFICATIONS */}
            {currentSection === "notifications" && (
              <Notifications
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              />
            )}
          </Container>
        </Box>
      </Box>

      {/* APPOINTMENT MODAL */}
      <Modal
        isOpen={modalOpen && modalType === "appointments"}
        onClose={() => {
          setModalOpen(false);
          setFormData({});
          setEditId(null);
          setSlotAvailability(null);
          setTimeValidationErrors([]);
        }}
        title={editId ? "Edit Appointment" : "Schedule Appointment"}
      >
        <form onSubmit={handleAppointmentSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
              USER INFORMATION
            </Typography>
            <TextField
              label="Staff ID"
              name="staff_id"
              fullWidth
              value={user.non_acad_id || user.employee_id || ""}
              disabled
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "action.hover",
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Operating Hours Info */}
          <Alert icon={<InfoIcon />} severity="info" sx={{ mb: 3 }}>
            <strong>Operating Hours:</strong> 8:00 AM - 6:00 PM (Monday to Friday only)
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
              APPOINTMENT DETAILS
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  name="appointment_date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.appointment_date || ""}
                  onChange={handleChange}
                  required
                  inputProps={{
                    min: getMinimumAllowedDate(),
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Time"
                  name="appointment_time"
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.appointment_time || ""}
                  onChange={handleChange}
                  required
                  inputProps={{
                    min: "08:00",
                    max: "18:00",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Validation Errors */}
          {timeValidationErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {timeValidationErrors.map((error, idx) => (
                <div key={idx}>{error}</div>
              ))}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
              PURPOSE
            </Typography>
            <FormControl fullWidth required>
              <InputLabel>Purpose</InputLabel>
              <Select
                name="purpose"
                value={formData.purpose || ""}
                onChange={handleChange}
                label="Purpose"
              >
                <MenuItem value="Follow Up">Follow Up</MenuItem>
                <MenuItem value="Consultation">Consultation</MenuItem>
                <MenuItem value="Medical Certificate Request">
                  Medical Certificate Request
                </MenuItem>
                <MenuItem value="Pre-Enrollment">Pre-Enrollment</MenuItem>
                <MenuItem value="Pre-Employment">Pre-Employment</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              label="Notes (Optional)"
              name="notes"
              multiline
              rows={4}
              fullWidth
              value={formData.notes || ""}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              placeholder="Add any additional notes or special requirements..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                    <NotesIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => {
                  setModalOpen(false);
                  setFormData({});
                  setEditId(null);
                  setSlotAvailability(null);
                  setTimeValidationErrors([]);
                }}
                sx={{ py: 1.2 }}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                color="success"
                size="large"
                disabled={
                  timeValidationErrors.length > 0 ||
                  slotAvailability?.is_fully_booked ||
                  slotCheckLoading
                }
                sx={{ py: 1.2, fontWeight: 600 }}
              >
                {editId ? "Update Appointment" : "Schedule Appointment"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Modal>

      {/* EVALUATION MODAL */}
      <EvaluationForm
        visible={evaluationModalVisible}
        onClose={() => {
          setEvaluationModalVisible(false);
          setSelectedAppointment(null);
        }}
        visitData={selectedAppointment}
        onSuccess={() => {
          loadAppointments();

      {/* PRE-APPOINTMENT ASSESSMENT MODAL */}
      <PreAppointmentAssessment
        visible={assessmentModalVisible}
        onClose={() => setAssessmentModalVisible(false)}
        onComplete={handleAssessmentComplete}
      />
        }}
      />
    </Box>
  );
};

export default NonAcademic;
