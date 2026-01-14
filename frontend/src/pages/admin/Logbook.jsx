import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import api from "../../utils/axios";
import { toast } from "react-toastify";

const roles = [
  { value: "student", label: "Student" },
  { value: "faculty", label: "Faculty" },
  { value: "non_academic", label: "Non-Academic" },
];

const Logbook = () => {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    idValue: "",
    role: "student",
    name: "",
    purpose: "",
  });
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadVisits = async () => {
    try {
      const res = await api.get("/api/logbook");
      setVisits(res.data.visits || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load logbook entries");
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        idValue: form.idValue.trim(),
        role: form.role,
        date: form.date,
        time: form.time,
        purpose: form.purpose.trim(),
        name: form.name.trim() || null,
      };
      await api.post("/api/logbook", payload);
      toast.success("Visit recorded");
      setForm((s) => ({ ...s, idValue: "", name: "", purpose: "" }));
      await loadVisits();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to record visit";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
        Logbook - Clinic Visits
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Date"
                type="date"
                name="date"
                fullWidth
                value={form.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Time"
                type="time"
                name="time"
                fullWidth
                value={form.time}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Student ID / Employee ID"
                name="idValue"
                fullWidth
                value={form.idValue}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Role"
                name="role"
                fullWidth
                value={form.role}
                onChange={handleChange}
              >
                {roles.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                value={form.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                label="Purpose"
                name="purpose"
                fullWidth
                value={form.purpose}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                Record Visit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: { xs: 1, sm: 2 }, mt: 3, overflow: "auto" }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: "1rem", md: "1.25rem" }, px: { xs: 1, sm: 0 } }}>
          Recent Visits
        </Typography>
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Purpose</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visits.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.date_of_visit}</TableCell>
                <TableCell>{v.notes?.time || ""}</TableCell>
                <TableCell>{v.student_id || v.employee_id || ""}</TableCell>
                <TableCell>{v.role}</TableCell>
                <TableCell>{`${v.first_name || ""} ${v.middle_name || ""} ${v.last_name || ""}`.trim()}</TableCell>
                <TableCell>{v.chief_complaint}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </Box>
      </Paper>
    </Box>
  );
};

export default Logbook;
