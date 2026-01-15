import React, { useState, useMemo } from "react";
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
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { Button as AntButton, Tag } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { EyeOutlined } from "@ant-design/icons";
import { DeleteOutlined } from "@ant-design/icons";
import {
  Add as AddIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";

const Appointments = ({ appointments = [], onDelete, onStatusUpdate }) => {
  // Notes modal state
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState("");

  const handleViewNotes = (notes) => {
    setSelectedNotes(notes || "");
    setNotesModalOpen(true);
  };

  const closeNotesModal = () => {
    setNotesModalOpen(false);
    setSelectedNotes("");
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");
  const [filterUserType, setFilterUserType] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const matchesSearch =
        !searchTerm ||
        `${appt.user_first_name || appt.first_name || ""} ${appt.user_last_name || appt.last_name || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appt.user_student_id || appt.student_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appt.purpose || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filterStatus || (appt.status || "").toLowerCase() === filterStatus.toLowerCase();
      const matchesPurpose = !filterPurpose || appt.purpose === filterPurpose;
      const userType = appt.user_student_id || appt.student_id ? "student" : appt.user_role || appt.role || "unknown";
      const matchesUserType = !filterUserType || userType === filterUserType;

      return matchesSearch && matchesStatus && matchesPurpose && matchesUserType;
    });
  }, [appointments, searchTerm, filterStatus, filterPurpose, filterUserType]);

  const uniquePurposes = useMemo(() => {
    const purposes = new Set();
    appointments.forEach((appt) => {
      if (appt.purpose) purposes.add(appt.purpose);
    });
    return Array.from(purposes);
  }, [appointments]);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "confirmed" || statusLower === "done") return "success";
    if (statusLower === "pending" || statusLower === "scheduled") return "warning";
    if (statusLower === "in_progress") return "info";
    if (statusLower === "cancelled") return "error";
    return "default";
  };

  const handleStatusClick = (appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status || "pending");
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedAppointment || !newStatus) return;

    try {
      if (onStatusUpdate) {
        await onStatusUpdate(selectedAppointment.id, { status: newStatus });
      } else {
        await axios.put(`/api/appointments/${selectedAppointment.id}`, { status: newStatus });
        toast.success("Appointment status updated successfully");
      }
      setStatusDialogOpen(false);
      setSelectedAppointment(null);
      setNewStatus(""); // Reset status after update
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  // Mobile Card View for Appointments
  const MobileAppointmentCard = ({ appt }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Name</Typography>
            <Typography variant="body1" fontWeight="bold">
              {`${appt.user_first_name || appt.first_name || ""} ${appt.user_last_name || appt.last_name || ""}`}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
            <Typography variant="body2">{appt.user_student_id || appt.student_id || "N/A"}</Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography variant="subtitle2" color="text.secondary">Date</Typography>
              <Typography variant="body2">{appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString('en-CA') : 'N/A'}</Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle2" color="text.secondary">Time</Typography>
              <Typography variant="body2">{appt.appointment_time}</Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Purpose</Typography>
            <Typography variant="body2">{appt.purpose}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
            <Button variant="text" size="small" onClick={() => handleViewNotes(appt.notes)} sx={{ textTransform: 'none', p: 0 }}>
              {appt.notes ? "View Notes" : "No Notes"}
            </Button>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Chip
              label={appt.status || "pending"}
              color={getStatusColor(appt.status || "pending")}
              size="small"
              onClick={() => handleStatusClick(appt)}
              sx={{ cursor: 'pointer', textTransform: 'capitalize', fontWeight: 600 }}
            />
            <IconButton size="small" color="error" onClick={() => onDelete && onDelete(appt.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        flexWrap: "wrap",
        gap: 2
      }}>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
          Appointment Management
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <FormControl fullWidth size="small" variant="outlined">
              <Select
                displayEmpty
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: 'rgba(0,0,0,0.54)', fontSize: isMobile ? '0.85rem' : '1rem' }}>All Statuses</span>;
                  }
                  return selected.charAt(0).toUpperCase() + selected.slice(1);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <FormControl fullWidth size="small" variant="outlined">
              <Select
                displayEmpty
                value={filterPurpose}
                onChange={(e) => setFilterPurpose(e.target.value)}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: 'rgba(0,0,0,0.54)', fontSize: isMobile ? '0.85rem' : '1rem' }}>All Purposes</span>;
                  }
                  return selected;
                }}
              >
                <MenuItem value="">All Purposes</MenuItem>
                {uniquePurposes.map((purpose) => (
                  <MenuItem key={purpose} value={purpose}>{purpose}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <FormControl fullWidth size="small" variant="outlined">
              <Select
                displayEmpty
                value={filterUserType}
                onChange={(e) => setFilterUserType(e.target.value)}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: 'rgba(0,0,0,0.54)', fontSize: isMobile ? '0.85rem' : '1rem' }}>All Types</span>;
                  }
                  if (selected === "student") return "Student";
                  if (selected === "faculty") return "Faculty";
                  if (selected === "non_academic") return "Non-Academic";
                  return selected;
                }}
              >
                <MenuItem value="">All User Types</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="faculty">Faculty</MenuItem>
                <MenuItem value="non_academic">Non-Academic</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={!isMobile && <FilterIcon />}
              size={isMobile ? "small" : "medium"}
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("");
                setFilterPurpose("");
                setFilterUserType("");
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Mobile View: Cards */}
      {isMobile ? (
        <Box>
          {filteredAppointments.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No appointments found.</Typography>
            </Paper>
          ) : (
            filteredAppointments.map((appt) => (
              <MobileAppointmentCard key={appt.id} appt={appt} />
            ))
          )}
        </Box>
      ) : (
        /* Desktop View: Table */
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>User ID</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell><strong>Purpose</strong></TableCell>
                  <TableCell><strong>Notes</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No appointments found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appt) => (
                    <TableRow key={appt.id} hover>
                      <TableCell>{`${appt.user_first_name || appt.first_name || ""} ${appt.user_last_name || appt.last_name || ""}`}</TableCell>
                      <TableCell>{appt.user_student_id || appt.student_id || "N/A"}</TableCell>
                      <TableCell>{appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString('en-CA') : 'N/A'}</TableCell>
                      <TableCell>{appt.appointment_time}</TableCell>
                      <TableCell>{appt.purpose}</TableCell>
                      <TableCell>
                        {appt.notes ? (
                          <AntButton
                            type="link"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewNotes(appt.notes)}
                          >
                            View Notes
                          </AntButton>
                        ) : (
                          <span style={{ color: "#999" }}>-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {/* LogbookV2-style status UI using Ant Design Tag and icon */}
                        {(() => {
                          const status = appt.status || "pending";
                          const config = {
                            pending: { color: "warning", icon: <ClockCircleOutlined /> },
                            scheduled: { color: "processing", icon: <ClockCircleOutlined /> },
                            confirmed: { color: "success", icon: <CheckCircleOutlined /> },
                            in_progress: { color: "processing", icon: <ClockCircleOutlined /> },
                            cancelled: { color: "error" },
                          };
                          const { color, icon } = config[status.toLowerCase()] || {};
                          return (
                            <Tag
                              color={color}
                              icon={icon}
                              style={{ textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}
                              onClick={() => handleStatusClick(appt)}
                            >
                              {status.replace("_", " ").toUpperCase()}
                            </Tag>
                          );
                        })()}
                      </TableCell>
                      <TableCell align="center">
                        <AntButton
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => onDelete && onDelete(appt.id)}
                        >
                          Delete
                        </AntButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Notes Modal */}
      <Dialog open={notesModalOpen} onClose={closeNotesModal} fullWidth maxWidth="sm">
        <DialogTitle>NOTES</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
            {selectedNotes || "No notes provided."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNotesModal} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false);
          setSelectedAppointment(null);
          setNewStatus("");
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Update Appointment Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} label="Status">
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setStatusDialogOpen(false);
            setSelectedAppointment(null);
            setNewStatus("");
          }}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained" color="primary">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments;
