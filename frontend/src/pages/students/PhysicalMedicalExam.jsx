import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  Height,
  MonitorWeight,
  Favorite,
  Thermostat,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const PhysicalMedicalExam = ({ studentId, onSubmit, onLoadRecords }) => {
  const [formData, setFormData] = useState({
    studentId: studentId || "",
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
    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    if (!formData.physical.height || !formData.physical.weight) {
      toast.error("Please fill in height and weight");
      return;
    }

    try {
      await onSubmit({
        studentId: formData.studentId,
        date: formData.date,
        physical: {
          height: parseFloat(formData.physical.height) || 0,
          weight: parseFloat(formData.physical.weight) || 0,
          bloodPressure: formData.physical.bloodPressure || "",
          heartRate: formData.physical.heartRate || "",
            respiratoryRate: formData.physical.respiratoryRate || "",
            temperature: formData.physical.temperature || "",
        },
        medical: {
          findings: formData.medical.findings || "",
          recommendation: formData.medical.recommendation || "",
        },
      });

      // Reset form
      setFormData({
        studentId: studentId || "",
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
    } catch (err) {
      console.error("Error submitting examination:", err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Physical & Medical Examinations
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          {/* Student ID and Date */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid xs={12} md={6}>
              <TextField
                label="Student ID"
                name="studentId"
                fullWidth
                value={formData.studentId}
                onChange={handleChange}
                disabled
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTime />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label="Date"
                name="date"
                type="date"
                fullWidth
                value={formData.date}
                onChange={handleChange}
                disabled
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
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Physical Examination Section */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Physical Examination
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid xs={12} sm={6} md={4}>
              <TextField
                label="Height (cm)"
                name="physical.height"
                type="number"
                fullWidth
                value={formData.physical.height}
                onChange={handleChange}
                disabled
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Height />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">cm</InputAdornment>,
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
                disabled
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MonitorWeight />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField
                label="Blood Pressure"
                name="physical.bloodPressure"
                fullWidth
                placeholder="e.g., 120/80"
                value={formData.physical.bloodPressure}
                onChange={handleChange}
                disabled
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Favorite />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField
                label="Heart Rate"
                name="physical.heartRate"
                type="number"
                fullWidth
                placeholder="bpm"
                value={formData.physical.heartRate}
                onChange={handleChange}
                disabled
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Favorite />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">bpm</InputAdornment>,
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField
                label="Respiratory Rate"
                name="physical.respiratoryRate"
                type="number"
                fullWidth
                placeholder="breaths/min"
                value={formData.physical.respiratoryRate}
                onChange={handleChange}
                disabled
                InputLabelProps={{ shrink: true }}
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
            <Grid xs={12} sm={6} md={4}>
              <TextField
                label="Temperature"
                name="physical.temperature"
                type="number"
                fullWidth
                value={formData.physical.temperature}
                onChange={handleChange}
                disabled
                InputLabelProps={{ shrink: true }}
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

          <Divider sx={{ my: 3 }} />

          {/* Medical Examination Section */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Medical Examination
          </Typography>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <TextField
                label="Findings"
                name="medical.findings"
                multiline
                rows={4}
                fullWidth
                value={formData.medical.findings}
                onChange={handleChange}
                disabled
                InputLabelProps={{ shrink: true }}
                placeholder="Enter examination findings..."
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                label="Recommendation"
                name="medical.recommendation"
                multiline
                rows={4}
                fullWidth
                value={formData.medical.recommendation}
                onChange={handleChange}
                disabled
                InputLabelProps={{ shrink: true }}
                placeholder="Enter recommendations..."
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              disabled
              onClick={() => {
                setFormData({
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
              }}
            >
              Clear
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled>
              Submit Examination
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PhysicalMedicalExam;

