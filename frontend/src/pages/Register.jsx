import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/earist-logo.png";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Alert,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  alpha,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
} from "@mui/material";
import {
  HowToReg as RegisterIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const Register = () => {
  const { register, loading, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (currentUser) {
      const paths = {
        admin: "/admin",
        faculty: "/faculty",
        student: "/student",
        non_academic: "/non-academic",
      };
      navigate(paths[currentUser.role] || "/", { replace: true });
    }
  }, [currentUser, navigate]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    // Optional fields
    address: "",
    birthday: "",
    age: "",
    phoneNumber: "",
    college: "",
    course: "",
    yearLevel: "",
    section: "",
    studentType: "",
    guardianName: "",
    guardianContact: "",
    department: "",
    position: "",
    yearsOfService: "",
    officeLocation: "",
    licenseNumber: "",
    shiftSchedule: "",
    employmentType: "",
    supervisor: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBirthdayChange = (e) => {
    const birthday = e.target.value;
    if (birthday) {
      const birthDate = new Date(birthday);
      const age = Math.floor(
        (new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
      );
      setFormData((prev) => ({ ...prev, birthday, age: age.toString() }));
    } else {
      setFormData((prev) => ({ ...prev, birthday: "", age: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Only require essential fields
    const required = ["firstName", "lastName", "email", "password", "confirmPassword", "role"];

    const missing = required.filter((f) => !formData[f]);
    if (missing.length) {
      setError(`Please fill in required fields: ${missing.join(", ")}`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // Only send fields that have values (remove empty strings)
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== "" && value !== null)
      );
      // Remove confirmPassword before sending
      delete payload.confirmPassword;

      const role = await register(payload);
      const paths = {
        admin: "/admin",
        faculty: "/faculty",
        student: "/student",
        non_academic: "/non-academic",
      };

      if (role) {
        navigate(paths[role] || "/");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const renderRoleFields = () => {
    switch (formData.role) {
      case "student":
        return (
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel>Program (Optional)</InputLabel>
              <Select
                name="course"
                value={formData.course}
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
                  <MenuItem value="CAS">Bachelor of Science in Psychology </MenuItem>
                  <MenuItem value="CAS">Bachelor of Science in Mathematics </MenuItem>
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

            <FormControl fullWidth margin="normal">
              <InputLabel>College (Optional)</InputLabel>
              <Select
                name="college"
                value={formData.college}
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
            
            <TextField
              label="Year Level (Optional)"
              name="yearLevel"
              fullWidth
              margin="normal"
              value={formData.yearLevel}
              onChange={handleChange}
            />
            <TextField
              label="Section (Optional)"
              name="section"
              fullWidth
              margin="normal"
              value={formData.section}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Student Type (Optional)</InputLabel>
              <Select
                name="studentType"
                value={formData.studentType}
                onChange={handleChange}
              >
                <MenuItem value="Regular">Regular</MenuItem>
                <MenuItem value="Irregular">Irregular</MenuItem>
                <MenuItem value="Transferee">Transferee</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Guardian Name (Optional)"
              name="guardianName"
              fullWidth
              margin="normal"
              value={formData.guardianName}
              onChange={handleChange}
            />
            <TextField
              label="Guardian Contact (Optional)"
              name="guardianContact"
              fullWidth
              margin="normal"
              value={formData.guardianContact}
              onChange={handleChange}
            />
          </Box>
        );

      case "faculty":
        return (
          <Box>
            <TextField
              label="Department (Optional)"
              name="department"
              fullWidth
              margin="normal"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Computer Science, English"
            />
            <TextField
              label="Position (Optional)"
              name="position"
              fullWidth
              margin="normal"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g., Assistant Professor, Instructor"
            />
            <TextField
              label="Years of Service (Optional)"
              name="yearsOfService"
              type="number"
              fullWidth
              margin="normal"
              value={formData.yearsOfService}
              onChange={handleChange}
              placeholder="e.g., 5"
            />
            <TextField
              label="Office Location (Optional)"
              name="officeLocation"
              fullWidth
              margin="normal"
              value={formData.officeLocation}
              onChange={handleChange}
              placeholder="e.g., Building A, Room 201"
            />
          </Box>
        );

      case "non_academic":
        return (
          <>
            <TextField
              label="Department (Optional)"
              name="department"
              fullWidth
              margin="normal"
              value={formData.department}
              onChange={handleChange}
            />
            <TextField
              label="Position (Optional)"
              name="position"
              fullWidth
              margin="normal"
              value={formData.position}
              onChange={handleChange}
            />
            <TextField
              label="Employment Type (Optional)"
              name="employmentType"
              fullWidth
              margin="normal"
              value={formData.employmentType}
              onChange={handleChange}
            />
          </>
        );

      case "admin":
        return (
          <TextField
            label="Department (Optional)"
            name="department"
            fullWidth
            margin="normal"
            value={formData.department}
            onChange={handleChange}
          />
        );

      default:
        return null;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      {/* Updated AppBar to match Login.jsx */}
      <AppBar position="static" color="primary">
        <Toolbar sx={{ py: { xs: 0.5, sm: 1 }, px: { xs: 1, sm: 3 } }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid>
              <Box display="flex" alignItems="center" sx={{ py: { xs: 0.5, sm: 1 }, px: { xs: 1, sm: 3 } }}>
                <img
                  src={logo}
                  alt="EARIST Logo"
                  style={{ 
                    height: isMobile ? 35 : 50, 
                    marginRight: isMobile ? 8 : 16 
                  }}
                />
                <Typography 
                  variant={isMobile ? "subtitle1" : "h5"} 
                  sx={{ fontWeight: "bold" }}
                >
                  {isMobile ? "EARIST Hub" : "EARIST Health Access Hub"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      {/* Background gradient similar to Login.jsx */}
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 1, sm: 2 },
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={16}
            sx={{
              p: { xs: 2.5, sm: 4, md: 5 },
              borderRadius: { xs: 2, sm: 4 },
              maxWidth: { xs: '100%', sm: 600 },
              mx: "auto",
              my: { xs: 2, sm: 4 },
              background: theme.palette.background.paper,
              boxShadow: `0 20px 40px ${alpha(
                theme.palette.common.black,
                0.1
              )}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            }}
          >
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{ mb: { xs: 2, sm: 3 }, display: "flex", alignItems: "center", gap: 1 }}
              fontWeight="bold"
            >
              <RegisterIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Create an Account
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                * Required fields
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name *"
                    name="firstName"
                    fullWidth
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Middle Name *"
                    name="middleName"
                    fullWidth
                    required
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name *"
                    name="lastName"
                    fullWidth
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Email *"
                name="email"
                type="email"
                fullWidth
                required
                margin="normal"
                size={isMobile ? "small" : "medium"}
                value={formData.email}
                onChange={handleChange}
              />

              <TextField
                label="Password *"
                name="password"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                margin="normal"
                size={isMobile ? "small" : "medium"}
                value={formData.password}
                onChange={handleChange}
                helperText="At least 6 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Confirm Password *"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                margin="normal"
                size={isMobile ? "small" : "medium"}
                value={formData.confirmPassword}
                onChange={handleChange}
              />

              <FormControl fullWidth margin="normal" required size={isMobile ? "small" : "medium"}>
                <InputLabel>Role *</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role *"
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="non_academic">Non-Academic Staff</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Optional Information
                </Typography>
              </Divider>

              <TextField
                label="Phone Number"
                name="phoneNumber"
                fullWidth
                margin="normal"
                value={formData.phoneNumber}
                onChange={handleChange}
              />

              <TextField
                label="Address"
                name="address"
                fullWidth
                margin="normal"
                value={formData.address}
                onChange={handleChange}
              />

              <TextField
                label="Birthday"
                name="birthday"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={formData.birthday}
                onChange={handleBirthdayChange}
              />

              {formData.birthday && (
                <TextField
                  label="Age"
                  name="age"
                  fullWidth
                  margin="normal"
                  value={formData.age}
                  disabled
                />
              )}

              {renderRoleFields()}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size={isMobile ? "medium" : "large"}
                sx={{
                  mt: { xs: 2, sm: 3 },
                  py: { xs: 1.2, sm: 1.5 },
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  textTransform: "none",
                  borderRadius: 2,
                  boxShadow: 2,
                  "&:hover": {
                    boxShadow: 4,
                  },
                }}
              >
                Register
              </Button>

              <Typography 
                align="center" 
                sx={{ mt: { xs: 2, sm: 3 } }}
                variant={isMobile ? "caption" : "body2"}
              >
                Already have an account?{" "}
                <Box
                  component="span"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                    "&:hover": { color: theme.palette.primary.dark },
                  }}
                  onClick={() => navigate("/login")}
                >
                  Login
                </Box>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default Register;
