import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  Paper,
  InputAdornment,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import api from "../../utils/axios";

const Account = () => {
  const { currentUser, updateProfile, loading: authLoading } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Sync formData with currentUser
  useEffect(() => {
    if (currentUser) {
      setFormData({
        employee_id: currentUser.employee_id || "",
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
        phone_number: currentUser.phone_number || "",
        address: currentUser.address || "",
        birthday: currentUser.birthday || "",
        department: currentUser.department || "",
        position: currentUser.position || "",
        office_location: currentUser.office_location || "",
      });
    }
  }, [currentUser]);

  const capitalise = (str) =>
    (str ?? "").trim().replace(/\b\w/g, (c) => c.toUpperCase());

  const rawFullName = `${formData.first_name || ""} ${
    formData.last_name || ""
  }`.trim();
  const fullName = rawFullName ? capitalise(rawFullName) : "Non-Academic User";

  const avatarLetters = fullName
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (["first_name", "last_name", "address"].includes(name)) {
      newValue = capitalise(value);
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name?.trim())
      newErrors.first_name = "First name is required";
    if (!formData.last_name?.trim())
      newErrors.last_name = "Last name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!validateForm()) return;

    setSaveLoading(true);
    try {
      await updateProfile({
        employee_id: formData.employee_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        birthday: formData.birthday,
        department: formData.department,
        position: formData.position,
        office_location: formData.office_location,
      });
      setIsEditing(false);
      setErrors({});
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        employee_id: currentUser.employee_id || "",
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
        phone_number: currentUser.phone_number || "",
        address: currentUser.address || "",
        birthday: currentUser.birthday || "",
        department: currentUser.department || "",
        position: currentUser.position || "",
        office_location: currentUser.office_location || "",
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

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        My Profile
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {saveLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={3}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.main",
                    fontSize: 32,
                  }}
                >
                  {avatarLetters}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {capitalise(formData.position || "")}
                  </Typography>
                </Box>
              </Box>

              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={saveLoading}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Employee ID"
                    name="employee_id"
                    value={formData.employee_id ?? ""}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    error={!!errors.employee_id}
                    helperText={errors.employee_id}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="First Name"
                    name="first_name"
                    value={capitalise(formData.first_name ?? "")}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Last Name"
                    name="last_name"
                    value={capitalise(formData.last_name ?? "")}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email ?? ""}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Phone Number"
                    name="phone_number"
                    value={formData.phone_number ?? ""}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Address"
                    name="address"
                    value={formData.address ?? ""}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    sx={{ textTransform: "capitalize" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday ?? ""}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Department"
                    name="department"
                    value={capitalise(formData.department || "")}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SchoolIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Position"
                    name="position"
                    value={capitalise(formData.position || "")}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Office Location"
                    name="office_location"
                    value={formData.office_location ?? ""}
                    onChange={handleChange}
                    fullWidth
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SchoolIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </form>
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

      <Paper
        elevation={2}
        sx={{
          p: 3,
          mt: 3,
          bgcolor: "success.light",
          color: "success.contrastText",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Account Status
            </Typography>
            <Typography variant="body2">
              Your account is active and in good standing.
            </Typography>
          </Box>
          <Chip label="Active" color="success" />
        </Box>
      </Paper>
    </Box>
  );
};


export default Account;
