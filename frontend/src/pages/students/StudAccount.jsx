import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import { toast } from "react-toastify";

const StudAccount = () => {
  const { currentUser, updateProfile, loading: authLoading } = useContext(AuthContext);

  // Editable form state
  const [formData, setFormData] = useState({
    student_id: currentUser?.student_id || "",
    first_name: currentUser?.first_name || "",
    middle_name: currentUser?.middle_name || "",
    last_name: currentUser?.last_name || "",
    email: currentUser?.email || "",
    phone_number: currentUser?.phone_number || "",
    address: currentUser?.address || "",
    birthday: currentUser?.birthday || "",
    age: currentUser?.age || "",
    college: currentUser?.college || "",
    course: currentUser?.course || "",
    year_level: currentUser?.year_level || "",
    section: currentUser?.section || "",
    guardian_name: currentUser?.guardian_name || "",
    guardian_contact: currentUser?.guardian_contact || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Sync formData with currentUser when it changes
  const formatDateForInput = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date)) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    if (currentUser) {
      setFormData({
        student_id: currentUser.student_id || "",
        first_name: currentUser.first_name || "",
        middle_name: currentUser.middle_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
        phone_number: currentUser.phone_number || "",
        address: currentUser.address || "",
        birthday: formatDateForInput(currentUser.birthday) || "",
        age: currentUser.age || "",
        college: currentUser.college || "",
        course: currentUser.course || "",
        year_level: currentUser.year_level || "",
        section: currentUser.section || "",
        guardian_name: currentUser.guardian_name || "",
        guardian_contact: currentUser.guardian_contact || "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name?.trim())
      newErrors.first_name = "First name is required";
    if (!formData.middle_name?.trim())
      newErrors.middle_name = "Middle name is required";
    if (!formData.last_name?.trim())
      newErrors.last_name = "Last name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phone_number?.trim())
      newErrors.phone_number = "Phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaveLoading(true);
    try {
      // Call updateProfile from AuthContext (handles API call and context update)
      await updateProfile({
        student_id: formData.student_id,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        birthday: formData.birthday,
        age: formData.age,
        college: formData.college,
        course: formData.course,
        year_level: formData.year_level,
        section: formData.section,
        guardian_name: formData.guardian_name,
        guardian_contact: formData.guardian_contact,
      });
      setIsEditing(false);
      setErrors({});
    } catch (err) {
      // Error is already displayed by toast in updateProfile
      console.error("Save error:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to current database values
    if (currentUser) {
      setFormData({
        student_id: currentUser.student_id || "",
        first_name: currentUser.first_name || "",
        middle_name: currentUser.middle_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
        phone_number: currentUser.phone_number || "",
        address: currentUser.address || "",
        birthday: currentUser.birthday || "",
        age: currentUser.age || "",
        college: currentUser.college || "",
        course: currentUser.course || "",
        year_level: currentUser.year_level || "",
        section: currentUser.section || "",
        guardian_name: currentUser.guardian_name || "",
        guardian_contact: currentUser.guardian_contact || "",
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPasswords((p) => ({ ...p, [name]: value }));
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setPwLoading(true);
    try {
      const res = await api.put("/api/users/change-password", { currentPassword, newPassword });
      toast.success(res.data?.message || "Password updated successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Change password error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Alert severity="error">Please log in to view your profile.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={700} color="#0F172A">
        My Profile
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mt: 2 }}>
        {saveLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* === HEADER: Photo + Name + ID === */}
            <Box display="flex" alignItems="center" gap={3} mb={4}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: 36,
                  bgcolor: "primary.main",
                  boxShadow: 3,
                  textTransform: "uppercase",
                }}
              >
                {currentUser?.first_name?.[0]}
                {currentUser?.middle_name?.[0]}
                {currentUser?.last_name?.[0]}
              </Avatar>
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ textTransform: "capitalize" }}
                >
                  {formData.first_name} {formData.last_name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Student ID: <strong>{currentUser?.student_id || "N/A"}</strong>
                </Typography>
                <Chip
                  label="Active Student"
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

             {/* Academic Info */}
              <Grid xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  color="#0F172A"
                  fontWeight={600}
                >
                 Personal Information
                </Typography>
              </Grid>

            {/* === EDITABLE FORM === */}
            <Grid container spacing={3}>
              {/* Student ID */}
              <Grid xs={12} md={6}>
                <TextField
                  label="Student ID"
                  name="student_id"
                  fullWidth
                  value={formData.student_id}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={!!errors.student_id}
                  helperText={errors.student_id}
                  sx={{ mb: 2 }}
                />
              </Grid>
              {/* Personal Info */}
              <Grid xs={12} md={6}>
                <TextField
                  label="First Name"
                  name="first_name"
                  fullWidth
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={!!errors.first_name}
                  helperText={errors.first_name}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Middle Name"
                  name="middle_name"
                  fullWidth
                  value={formData.middle_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={!!errors.middle_name}
                  helperText={errors.middle_name}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Last Name"
                  name="last_name"
                  fullWidth
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={!!errors.last_name}
                  helperText={errors.last_name}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Phone Number"
                  name="phone_number"
                  fullWidth
                  value={formData.phone_number}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  label="Address"
                  name="address"
                  fullWidth
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  label="Birthday"
                  name="birthday"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.birthday}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Age"
                  name="age"
                  type="number"
                  fullWidth
                  value={formData.age}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid xs={12} md={4}>
                <TextField
                  label="College"
                  name="college"
                  fullWidth
                  value={formData.college}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  label="Course & Program"
                  name="course"
                  fullWidth
                  value={formData.course}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid xs={12} md={2}>
                <TextField
                  label="Year Level"
                  name="year_level"
                  fullWidth
                  value={formData.year_level}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid xs={12} md={2}>
                <TextField
                  label="Section"
                  name="section"
                  fullWidth
                  value={formData.section}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid container spacing={3}>
              {/* Guardian Info */}
              <Grid xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  color="#0F172A"
                  fontWeight={600}
                >
                  Guardian / Emergency Contact
                </Typography>
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  label="Guardian Name"
                  name="guardian_name"
                  fullWidth
                  value={formData.guardian_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Guardian Contact"
                  name="guardian_contact"
                  fullWidth
                  value={formData.guardian_contact}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                  {isEditing ? (
                    <>
                      <Button
                        variant="outlined"
                        onClick={handleCancel}
                        disabled={saveLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={saveLoading}
                      >
                        {saveLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
            </Grid>
          </>
        )}
      </Paper>

      {/* Settings: Change Password */}
      <Paper elevation={3} sx={{ p: 3, mt: 3, borderRadius: 1 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Settings
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={4}>
            <TextField
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={handlePwChange}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              label="New Password"
              name="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={handlePwChange}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={handlePwChange}
              fullWidth
            />
          </Grid>
          <Grid xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={pwLoading}
              >
                {pwLoading ? "Updating..." : "Change Password"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

    </Box>
  );
};

export default StudAccount;
