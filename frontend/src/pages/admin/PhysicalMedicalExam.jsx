import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  Height,
  MonitorWeight,
  Favorite,
  Thermostat,
  Search as SearchIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../../utils/axios";

const PhysicalMedicalExam = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    userId: "",
    date: new Date().toISOString().split("T")[0],
    physical: {
      height: "",
      weight: "",
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      temperature: "",
    },
    medical: {
      findings: "",
      recommendation: "",
    },
  });

  // Load all users (students, faculty, non-academic) for selection
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get("/api/users");
      const allUsers = res.data.users || [];
      // Filter to show only students, faculty, and non_academic
      const filteredUsers = allUsers.filter(user => 
        ['student', 'faculty', 'non_academic'].includes(user.role)
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserSelect = (event, value) => {
    setSelectedUser(value);
    if (value) {
      setFormData(prev => ({
        ...prev,
        userId: value.id
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        userId: ""
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("physical.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        physical: { ...prev.physical, [field]: value },
      }));
    } else if (name.startsWith("medical.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        medical: { ...prev.medical, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    if (!formData.physical.height || !formData.physical.weight) {
      toast.error("Please fill in height and weight");
      return;
    }

    try {
      const payload = {
        userId: formData.userId,
        userType: selectedUser.role,
        date: formData.date,
        physical: {
          height: parseFloat(formData.physical.height) || 0,
          weight: parseFloat(formData.physical.weight) || 0,
          bloodPressure: formData.physical.bloodPressure || "",
          heartRate: parseInt(formData.physical.heartRate) || 0,
          respiratoryRate: parseInt(formData.physical.respiratoryRate) || 0,
          temperature: parseFloat(formData.physical.temperature) || 0,
        },
        medical: {
          findings: formData.medical.findings || "",
          recommendation: formData.medical.recommendation || "",
        },
      };

      await api.post("/api/examinations", payload);
      
      toast.success(`Physical and Medical Examination saved successfully for ${selectedUser.first_name} ${selectedUser.last_name}`);

      // Reset form
      setSelectedUser(null);
      setFormData({
        userId: "",
        date: new Date().toISOString().split("T")[0],
        physical: {
          height: "",
          weight: "",
          bloodPressure: "",
          heartRate: "",
          respiratoryRate: "",
          temperature: "",
        },
        medical: {
          findings: "",
          recommendation: "",
        },
      });
    } catch (error) {
      console.error("Error saving examination:", error);
      toast.error(error.response?.data?.error || "Failed to save examination");
    }
  };

  const getUserLabel = (user) => {
    if (!user) return '';
    const id = user.role === 'student' ? user.student_id : user.employee_id;
    return `${user.first_name} ${user.last_name} (${id || 'No ID'}) - ${user.role}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Physical and Medical Examination
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter physical and medical examination data for students, faculty, or non-academic staff
      </Typography>

      {/* User Selection Section - Separate Paper */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} direction="column">
          {/* Make search full-row width */}
          <Grid item xs={12}>
            <Autocomplete
              value={selectedUser}
              onChange={handleUserSelect}
              options={users}
              getOptionLabel={getUserLabel}
              loading={loadingUsers}
              fullWidth
              sx={{ width: '100%' }}
              ListboxProps={{
                style: { maxHeight: '250px' }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search User by Name or ID"
                  variant="outlined"
                  required
                  fullWidth
                  sx={{ width: '100%' }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              filterOptions={(options, { inputValue }) => {
                const input = inputValue.toLowerCase();
                return options.filter(option => {
                  const fullName = `${option.first_name} ${option.last_name}`.toLowerCase();
                  const id = (option.student_id || option.employee_id || '').toLowerCase();
                  return fullName.includes(input) || id.includes(input);
                });
              }}
            />
          </Grid>

          {/* Date */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Examination Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Selected User Info Box */}
          {selectedUser && (
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="body1">
                  <strong>Selected User:</strong> {selectedUser.first_name} {selectedUser.last_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Role:</strong> {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                </Typography>
                <Typography variant="body2">
                  <strong>ID:</strong> {selectedUser.role === 'student' ? selectedUser.student_id : selectedUser.employee_id}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Examination Form - Separate Paper */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Physical and Medical Examination Form */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Physical Examination
              </Typography>
              <Grid container spacing={2}>
                {/* Height */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Height (cm)"
                    name="physical.height"
                    type="number"
                    value={formData.physical.height}
                    onChange={handleChange}
                    required
                    placeholder="cm"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Height />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">cm</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Weight */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Weight (kg)"
                    name="physical.weight"
                    type="number"
                    value={formData.physical.weight}
                    onChange={handleChange}
                    required
                    placeholder="kg"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MonitorWeight />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">kg</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Blood Pressure */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Blood Pressure"
                    name="physical.bloodPressure"
                    value={formData.physical.bloodPressure}
                    onChange={handleChange}
                    placeholder="e.g., 120/80"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Favorite />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Heart Rate */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Heart Rate"
                    name="physical.heartRate"
                    type="number"
                    value={formData.physical.heartRate}
                    onChange={handleChange}
                    placeholder="bpm"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Favorite />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">bpm</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Respiratory Rate */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Respiratory Rate"
                    name="physical.respiratoryRate"
                    type="number"
                    value={formData.physical.respiratoryRate}
                    onChange={handleChange}
                    placeholder="breaths/min"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Favorite />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">breaths/min</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Temperature */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Temperature"
                    name="physical.temperature"
                    type="number"
                    value={formData.physical.temperature}
                    onChange={handleChange}
                    placeholder="°C"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Thermostat />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">°C</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Medical Examination
              </Typography>
              <Grid container spacing={2}>
                {/* Findings */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Findings"
                    name="medical.findings"
                    value={formData.medical.findings}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Enter examination findings..."
                  />
                </Grid>

                {/* Recommendations */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Recommendation"
                    name="medical.recommendation"
                    value={formData.medical.recommendation}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Enter recommendations..."
                  />
                </Grid>

                {/* Action Buttons - Below Recommendations */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="large"
                      onClick={() => {
                        setSelectedUser(null);
                        setFormData({
                          userId: "",
                          date: new Date().toISOString().split("T")[0],
                          physical: {
                            height: "",
                            weight: "",
                            bloodPressure: "",
                            heartRate: "",
                            respiratoryRate: "",
                            temperature: "",
                          },
                          medical: {
                            findings: "",
                            recommendation: "",
                          },
                        });
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={!selectedUser}
                    >
                      Submit Examination
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PhysicalMedicalExam;
