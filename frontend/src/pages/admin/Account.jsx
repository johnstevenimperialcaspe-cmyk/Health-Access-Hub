import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  Paper,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
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
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";

/*-------MAIN COMPONENT     */
const Account = () => {
  const { currentUser, updateProfile, loading: authLoading } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Sync formData with currentUser when it changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
        phone_number: currentUser.phone_number || "",
        address: currentUser.address || "",
        department: currentUser.department || "Health Services",
        position: currentUser.position || "",
        role: currentUser.role || "admin",
        // Add other fields from currentUser as needed
      });
    }
  }, [currentUser]);

  // ---------- CAPITALISE HELPERS ----------
  const capitalise = (str) =>
    (str ?? "").trim().replace(/\b\w/g, (c) => c.toUpperCase());

  const toUpper = (str) => (str ?? "").toUpperCase();

  // ---------- DISPLAY NAME ----------
  const rawFullName = `${formData.first_name || ""} ${formData.last_name || ""
    }`.trim();
  const fullName = rawFullName ? capitalise(rawFullName) : "Admin User";

  // ---------- AVATAR ----------
  const avatarLetters = fullName
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ---------- INPUT HANDLER ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Capitalise first/last name & address
    if (["first_name", "last_name", "address"].includes(name)) {
      newValue = capitalise(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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

  // ---------- VALIDATION ----------
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

  // ---------- SUBMIT ----------
  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!validateForm()) return;

    setSaveLoading(true);
    try {
      // Call updateProfile to sync with context
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        department: formData.department,
        position: formData.position,
      });
      setIsEditing(false);
      setErrors({});
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  // ---------- CANCEL ----------
  const handleCancel = () => {
    // Reset to original currentUser data
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
        phone_number: currentUser.phone_number || "",
        address: currentUser.address || "",
        department: currentUser.department || "Health Services",
        position: currentUser.position || "",
        role: currentUser.role || "admin",
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  // No user? Show error or redirect (but for admin, assume logged in)
  if (!currentUser) {
    return <Alert severity="error">Please log in to view your profile.</Alert>;
  }

  return (
    <Box>
      {/* ---------- HEADER ---------- */}
      <Typography variant="h5" gutterBottom fontWeight="bold">
        My Profile
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 1 }}>
        {saveLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* ---------- AVATAR + NAME ---------- */}
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
                    {capitalise(formData.role || "Administrator")}
                  </Typography>
                </Box>
              </Box>

              {/* ---------- EDIT BUTTONS ---------- */}
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

            <Divider sx={{ mb: 3 }} />

            {/* ---------- FORM ---------- */}
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* First Name */}
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

                {/* Last Name */}
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

                {/* Email */}
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

                {/* Phone */}
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

                {/* Address */}
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

                {/* Department */}
                <Grid xs={12} md={6}>
                  <TextField
                    label="Department"
                    name="department"
                    value={formData.department || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value,   // ← no uppercase
                      }))
                    }
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


                {/* Job Position */}
                <Grid xs={12} md={6}>
                  <TextField
                    label="Job Position"
                    name="position"
                    value={formData.position || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
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

      {/* Account Status */}
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
