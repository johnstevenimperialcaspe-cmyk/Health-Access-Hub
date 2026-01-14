import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { Button as AntButton, Space } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Add as AddIcon,
  CalendarToday,
  Height,
  MonitorWeight,
  Favorite,
  Thermostat,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";
import api from "../../utils/axios";

const Examinations = ({ examinations = [], onAdd, onEdit, onDelete }) => {
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    userType: "",
    userId: "",
    date: new Date().toISOString().split("T")[0],
    physical: {
      height: "",
      weight: "",
      bloodPressure: "",
      heartRate: "",
      temperature: "",
    },
    medical: {
      findings: "",
      recommendation: "",
    },
  });
  const [users, setUsers] = useState({ students: [], faculties: [], nonAcademic: [] });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [studentsRes, facultiesRes, nonAcademicRes] = await Promise.all([
        api.get("/api/users?role=student").catch(() => ({ data: { users: [] } })),
        api.get("/api/users?role=faculty").catch(() => ({ data: { users: [] } })),
        api.get("/api/users?role=non_academic").catch(() => ({ data: { users: [] } })),
      ]);
      setUsers({
        students: studentsRes.data.users || [],
        faculties: facultiesRes.data.users || [],
        nonAcademic: nonAcademicRes.data.users || [],
      });
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      userType: "",
      userId: "",
      date: new Date().toISOString().split("T")[0],
      physical: {
        height: "",
        weight: "",
        bloodPressure: "",
        heartRate: "",
        temperature: "",
      },
      medical: {
        findings: "",
        recommendation: "",
      },
    });
    setExamDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setExamDialogOpen(false);
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

    // Validation
    if (!formData.userType || !formData.userId) {
      toast.error("Please select a user");
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    try {
      const payload = {
        date: formData.date,
        physical: {
            height: parseFloat(formData.physical.height) || null,
            weight: parseFloat(formData.physical.weight) || null,
            bloodPressure: formData.physical.bloodPressure || "",
            heartRate: formData.physical.heartRate || "",
            temperature: formData.physical.temperature || "",
          },
        medical: {
          findings: formData.medical.findings || "",
          recommendation: formData.medical.recommendation || "",
        },
      };

      // Add studentId or employeeId based on user type
      if (formData.userType === "student") {
        payload.studentId = formData.userId;
      } else {
        payload.employeeId = formData.userId;
      }

      await api.post("/api/examinations", payload);
      toast.success("Examination created successfully");
      handleCloseDialog();
      if (onAdd) onAdd(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create examination");
    }
  };

  const getAvailableUsers = () => {
    switch (formData.userType) {
      case "student":
        return users.students;
      case "faculty":
        return users.faculties;
      case "non_academic":
        return users.nonAcademic;
      default:
        return [];
    }
  };

  const getUserDisplayName = (user) => {
    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    if (formData.userType === "student") {
      const id = user.student_id || "";
      return `${name} (${id})`;
    } else {
      const id = user.employee_id || "";
      const department = user.department || user.department_name || "";
      return department ? `${name} (${id}) - ${department}` : `${name} (${id})`;
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Physical & Medical Examination Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Create Examination
        </Button>
      </Box>

      {/* Examinations Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Physical</strong></TableCell>
              <TableCell><strong>Medical</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {examinations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No examinations found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              examinations.map((exam) => {
                const notes = typeof exam.notes === "string" ? JSON.parse(exam.notes || "{}") : exam.notes || {};
                const physical = notes.physical || {};
                const medical = notes.medical || {};
                return (
                  <TableRow key={exam.id} hover>
                    <TableCell>#{exam.id}</TableCell>
                    <TableCell>
                      {exam.first_name} {exam.last_name}
                    </TableCell>
                    <TableCell>
                      {exam.date_of_visit
                        ? new Date(exam.date_of_visit).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {physical.height && physical.weight ? (
                        <Typography variant="caption" display="block">
                          H: {physical.height}cm, W: {physical.weight}kg
                        </Typography>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {medical.findings ? (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {medical.findings}
                        </Typography>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Space>
                        <AntButton
                          size="small"
                          icon={<EyeOutlined />}
                        >
                          View
                        </AntButton>
                        <AntButton
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => onEdit && onEdit(exam.id, exam)}
                        >
                          Edit
                        </AntButton>
                        <AntButton
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => onDelete && onDelete(exam.id)}
                        >
                          Delete
                        </AntButton>
                      </Space>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Examination Dialog */}
      <Dialog
        open={examDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Create Physical & Medical Examination
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              {/* Top Row: User Selection + Examination Date */}
              <Grid xs={12} md={8}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: "text.secondary" }}>
                  USER SELECTION
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="user-type-label">User Type *</InputLabel>
                      <Select
                        labelId="user-type-label"
                        id="user-type"
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                        label="User Type *"
                        sx={{ '& .MuiSelect-select': { padding: '12px 14px' } }}
                      >
                        <MenuItem value="">Select User Type</MenuItem>
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="faculty">Faculty</MenuItem>
                        <MenuItem value="non_academic">Non-Academic Staff</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="user-id-label">User *</InputLabel>
                      <Select
                        labelId="user-id-label"
                        id="user-id"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        disabled={!formData.userType}
                        label="User *"
                        sx={{ '& .MuiSelect-select': { padding: '12px 14px' } }}
                      >
                        <MenuItem value="">Select User</MenuItem>
                        {getAvailableUsers().map((user) => (
                          <MenuItem key={user.id} value={formData.userType === 'student' ? user.student_id : user.employee_id}>
                        {getUserDisplayName(user)}
                      </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              <Grid xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                  EXAMINATION DATE
                </Typography>
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  fullWidth
                  required
                  value={formData.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid xs={12}>
                <Divider />
              </Grid>

              {/* Physical Examination */}
              <Grid xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                  PHYSICAL EXAMINATION
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} sm={6} md={4}>
                    <TextField
                      label="Height (cm)"
                      name="physical.height"
                      type="number"
                      fullWidth
                      value={formData.physical.height}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Height color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={4}>
                    <TextField
                      label="Weight (kg)"
                      name="physical.weight"
                      type="number"
                      fullWidth
                      value={formData.physical.weight}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MonitorWeight color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={4}>
                    <TextField
                      label="Blood Pressure"
                      name="physical.bloodPressure"
                      fullWidth
                      value={formData.physical.bloodPressure}
                      onChange={handleChange}
                      placeholder="e.g., 120/80"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Favorite color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={4}>
                    <TextField
                      label="Heart Rate (bpm)"
                      name="physical.heartRate"
                      type="number"
                      fullWidth
                      value={formData.physical.heartRate}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Favorite color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={4}>
                    <TextField
                      label="Temperature (°C)"
                      name="physical.temperature"
                      type="number"
                      fullWidth
                      value={formData.physical.temperature}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Thermostat color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  {/* Respiratory Rate removed */}
                </Grid>
              </Grid>

              <Grid xs={12}>
                <Divider />
              </Grid>

              {/* Medical Examination */}
              <Grid xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                  MEDICAL EXAMINATION
                </Typography>
                <TextField
                  label="Findings"
                  name="medical.findings"
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.medical.findings}
                  onChange={handleChange}
                  placeholder="Enter medical findings..."
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Recommendation"
                  name="medical.recommendation"
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.medical.recommendation}
                  onChange={handleChange}
                  placeholder="Enter recommendations..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Create Examination
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Examinations;
