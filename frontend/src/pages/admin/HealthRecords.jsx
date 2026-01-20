// src/pages/admin/HealthRecords.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Pagination,
  Skeleton,
  Stack,
  useTheme,
  useMediaQuery,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Button as AntButton, Space } from "antd";
import { PrinterOutlined, EditOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { Search as SearchIcon } from "@mui/icons-material";

/* -------------------------------------------------------------------------- */
/*                               NOTE                                         */
/* -------------------------------------------------------------------------- */
// Removed hard-coded demo health records. Records should be loaded from the
// backend. The component initializes with an empty list and will render a
// friendly empty state when no records are available.


/* Export removed — Health Records page focuses on Physical & Medical exams */

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */
const HealthRecords = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /* ------------------------------- Filters ------------------------------- */
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [page, setPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedRecords, setArchivedRecords] = useState([]);
  // Default sort: newest first by date
  const [order, setOrder] = useState("desc"); // "asc" | "desc"
  const [orderBy, setOrderBy] = useState("date_of_visit");
  const [records, setRecords] = useState([]);

  /* --------------------------- Edit Modal State ------------------------- */
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  /* --------------------------- Debounced Search -------------------------- */
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  /* ------------------------------ Sorting ------------------------------ */
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sorted = useMemo(() => {
    const comparator = (a, b) => {
      let aVal;
      let bVal;

      if (orderBy === "student_first_name") {
        aVal = `${a.student_first_name || ""} ${a.student_last_name || ""}`.trim().toLowerCase();
        bVal = `${b.student_first_name || ""} ${b.student_last_name || ""}`.trim().toLowerCase();
      } else if (orderBy === "date_of_visit") {
        const aDate = a.date_of_visit || a.created_at || "1970-01-01";
        const bDate = b.date_of_visit || b.created_at || "1970-01-01";
        const aTime = new Date(aDate).getTime();
        const bTime = new Date(bDate).getTime();
        aVal = Number.isNaN(aTime) ? 0 : aTime;
        bVal = Number.isNaN(bTime) ? 0 : bTime;
      } else {
        aVal = a[orderBy];
        bVal = b[orderBy];
      }

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    };
    // Use archived or active records based on toggle
    const dataSource = showArchived ? archivedRecords : records;
    return [...dataSource].sort(comparator);
  }, [orderBy, order, records, archivedRecords, showArchived]);

  /* ------------------------------ Filtering ----------------------------- */
  const filtered = useMemo(() => {
    return sorted.filter((r) => {
      const fullName = `${r.first_name || r.student_first_name || ""} ${r.last_name || r.student_last_name || ""}`.toLowerCase();
      const matchesSearch = fullName.includes(debouncedSearch.toLowerCase());
      const matchesType = filterType ? r.record_type === filterType : true;
      return matchesSearch && matchesType;
    });
  }, [sorted, debouncedSearch, filterType]);

  /* ------------------------------ Pagination --------------------------- */
  const ROWS_PER_PAGE = 10;
  const paginated = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filtered.slice(start, start + ROWS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));

  const resetPage = useCallback(() => setPage(1), []);

  useEffect(() => {
    resetPage();
  }, [debouncedSearch, resetPage]);

  const loadHealthRecords = useCallback(async () => {
    try {
      const response = await api
        .get("/api/health-records", { params: { limit: 1000 } })
        .then((r) => r.data)
        .catch(() => ({ healthRecords: [] }));

      const parsedRecords = (response.healthRecords || []).map((record) => {
        let parsedNotes = record.notes;
        if (typeof record.notes === "string") {
          try {
            parsedNotes = JSON.parse(record.notes);
          } catch {
            parsedNotes = record.notes;
          }
        }
        return { ...record, notes: parsedNotes };
      });

      setRecords(parsedRecords);
    } catch (err) {
      console.error("Failed to load health records", err);
    }
  }, []);

  // Load combined health records (examinations + logbook visits)
  useEffect(() => {
    loadHealthRecords();
  }, [loadHealthRecords]);





  const handleArchive = async (id) => {
    if (!window.confirm("Are you sure you want to archive this record?")) return;
    try {
      // Find the record before archiving
      const recordToArchive = records.find(r => r.id === id);
      
      // Archive the record
      await api.put(`/api/health-records/${id}/archive`);
      
      // Add to archived list and remove from active list
      if (recordToArchive) {
        setArchivedRecords(prev => [...prev, { ...recordToArchive, archived_at: new Date().toISOString() }]);
        setRecords(prev => prev.filter(r => r.id !== id));
      }
      
      toast.success("Health record archived successfully");
    } catch (err) {
      console.error("Failed to archive record", err);
      toast.error(err.response?.data?.message || "Failed to archive record");
    }
  };

  const handleUnarchive = (id) => {
    if (!window.confirm("Are you sure you want to restore this record?")) return;
    
    // Find the archived record
    const recordToRestore = archivedRecords.find(r => r.id === id);
    
    if (recordToRestore) {
      // Remove archived_at and restore to active records
      const { archived_at, ...restoredRecord } = recordToRestore;
      setRecords(prev => [...prev, restoredRecord]);
      setArchivedRecords(prev => prev.filter(r => r.id !== id));
      toast.success("Health record restored successfully");
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    
    // Parse notes if it's a JSON string
    let parsedNotes = record.notes;
    if (typeof record.notes === 'string') {
      try {
        parsedNotes = JSON.parse(record.notes);
      } catch (e) {
        parsedNotes = {};
      }
    }
    
    // Initialize form data based on record type
    if (record.record_type === "examination") {
      const physical = parsedNotes?.physical || {};
      const medical = parsedNotes?.medical || {};
      
      setEditFormData({
        date_of_visit: record.date_of_visit || "",
        chief_complaint: record.chief_complaint || "",
        diagnosis: medical.findings || record.diagnosis || "",
        treatment: medical.recommendation || record.treatment || "",
        vital_blood_pressure: physical.bloodPressure || record.vital_blood_pressure || "",
        vital_heart_rate: physical.heartRate || record.vital_heart_rate || "",
        vital_respiratory_rate: physical.respiratoryRate || record.vital_respiratory_rate || "",
        vital_temperature: physical.temperature || record.vital_temperature || "",
        vital_weight: physical.weight || record.vital_weight || "",
        vital_height: physical.height || record.vital_height || "",
      });
    } else {
      // Logbook visit
      setEditFormData({
        date_of_visit: record.date_of_visit || "",
        chief_complaint: record.chief_complaint || "",
        diagnosis: record.diagnosis || "",
        treatment: record.treatment || "",
      });
    }
    
    setEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    
    try {
      // Prepare update payload
      const updates = { ...editFormData };
      
      // For examination records, rebuild the notes JSON structure
      if (editingRecord.record_type === "examination") {
        updates.notes = JSON.stringify({
          physical: {
            height: updates.vital_height,
            weight: updates.vital_weight,
            bloodPressure: updates.vital_blood_pressure,
            heartRate: updates.vital_heart_rate,
            respiratoryRate: updates.vital_respiratory_rate,
            temperature: updates.vital_temperature,
          },
          medical: {
            findings: updates.diagnosis,
            recommendation: updates.treatment,
          }
        });
      }
      
      await api.put(`/api/health-records/${editingRecord.id}`, updates);
      toast.success("Health record updated successfully");
      setEditModalOpen(false);
      setEditingRecord(null);
      setEditFormData({});
      await loadHealthRecords();
    } catch (err) {
      console.error("Failed to update record", err);
      toast.error(err.response?.data?.message || "Failed to update health record");
    }
  };

  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setEditingRecord(null);
    setEditFormData({});
  };

  const handlePrint = (record) => {
    // Only allow printing for examination records
    if (record.record_type === "examination") {
      navigate(`/print/admin/${record.id}`);
    } else {
      alert("Print functionality is only available for Physical & Medical Examination records.");
    }
  };

  /* ------------------------------- Export ------------------------------ */
  const handleExport = () => { }; // disabled per requirements

  // derive stats from records
  // stats removed — page focuses only on examinations

  /* ------------------------------- UI ----------------------------------- */
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "background.default" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Health Records Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Comprehensive view & control of all patients' medical records.
          </Typography>
        </Box>

        {/* Archive Toggle Button */}
        <Button
          variant={showArchived ? "contained" : "outlined"}
          color={showArchived ? "secondary" : "primary"}
          onClick={() => {
            setShowArchived(!showArchived);
            setPage(1);
          }}
          startIcon={<FolderOpenOutlined />}
          sx={{ minWidth: 150 }}
        >
          {showArchived ? `Archived (${archivedRecords.length})` : `View Archive (${archivedRecords.length})`}
        </Button>
      </Box>

      {/* Stats removed - page focuses on Physical & Medical Examinations */}

      {/* Filters */}
      {/* Filters: only keep patient name search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Record Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="examination">Physical & Medical Exam</MenuItem>
              <MenuItem value="visit">Logbook Visit</MenuItem>
            </TextField>
          </Grid>
          {/* Combined sorting: choose field + direction in one select */}
          <Grid xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Sort"
              value={`${orderBy}:${order}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split(":");
                setOrderBy(by);
                setOrder(dir);
                resetPage();
              }}
            >
              <MenuItem value="date_of_visit:desc">Date — Newest → Oldest</MenuItem>
              <MenuItem value="date_of_visit:asc">Date — Oldest → Newest</MenuItem>
              <MenuItem value="student_first_name:asc">Name — A → Z</MenuItem>
              <MenuItem value="student_first_name:desc">Name — Z → A</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={2}>
            <Button
              fullWidth
              variant="text"
              color="primary"
              onClick={() => {
                setSearch("");
                setFilterType("");
                // Reset to default: newest first by date
                setOrderBy("date_of_visit");
                setOrder("desc");
                resetPage();
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>



      {/* Table */}
      <Paper sx={{ overflow: "hidden" }}>
        <TableContainer>
          <Table
            stickyHeader
            aria-label="health records table"
            sx={{
              "& th, & td": { whiteSpace: "normal", wordBreak: "break-word" },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Record Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      No health records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((row) => {
                  // Trim names to handle trailing spaces
                  const firstName = (row.first_name || row.student_first_name || "").trim();
                  const lastName = (row.last_name || row.student_last_name || "").trim();
                  const userName = `${firstName} ${lastName}`.trim();
                  
                  const typeLabel = row.record_type === "visit" ? "Logbook Visit" : "Physical/Medical Exam";
                  const isExam = row.record_type === "examination";
                  
                  // Determine role and ID based on user_role from the joined users table
                  let role = "Student";
                  let userId = "";
                  
                  if (row.user_role === "student") {
                    role = "Student";
                    userId = row.user_student_id || "";
                  } else if (row.user_role === "faculty") {
                    role = "Faculty";
                    userId = row.user_employee_id || "";
                  } else if (row.user_role === "non_academic") {
                    role = "Non-Academic";
                    userId = row.user_employee_id || "";
                  } else if (row.user_role === "admin") {
                    role = "Admin";
                    userId = row.user_employee_id || "";
                  } else {
                    // Fallback: try to determine from IDs
                    if (row.user_student_id) {
                      role = "Student";
                      userId = row.user_student_id;
                    } else if (row.user_employee_id) {
                      // If has employee_id, default to Faculty
                      role = "Faculty";
                      userId = row.user_employee_id;
                    }
                  }

                  return (
                    <TableRow key={row.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell>{userId || "-"}</TableCell>
                      <TableCell>{role}</TableCell>
                      <TableCell>{userName || "-"}</TableCell>
                      <TableCell>{typeLabel}</TableCell>
                      <TableCell>
                        <Space>
                          {isExam && (
                            <AntButton
                              size="small"
                              icon={<PrinterOutlined />}
                              onClick={() => handlePrint(row)}
                            >
                              Print
                            </AntButton>
                          )}
                          {!showArchived && (
                            <>
                              <AntButton
                                size="small"
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(row)}
                              >
                                Edit
                              </AntButton>
                              <AntButton
                                size="small"
                                icon={<FolderOpenOutlined />}
                                onClick={() => handleArchive(row.id)}
                              >
                                Archive
                              </AntButton>
                            </>
                          )}
                          {showArchived && (
                            <AntButton
                              size="small"
                              type="primary"
                              onClick={() => handleUnarchive(row.id)}
                            >
                              Restore
                            </AntButton>
                          )}
                        </Space>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            size={isMobile ? "small" : "medium"}
            showFirstButton
            showLastButton
          />
        </Box>
      </Paper>

      {/* Edit Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={handleCancelEdit}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Health Record
          {editingRecord && (
            <Typography variant="caption" display="block" color="text.secondary">
              {editingRecord.record_type === "examination" ? "Physical & Medical Examination" : "Logbook Visit"}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* Date of Visit */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Visit"
                name="date_of_visit"
                type="date"
                value={editFormData.date_of_visit || ""}
                onChange={handleEditFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Chief Complaint */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chief Complaint"
                name="chief_complaint"
                value={editFormData.chief_complaint || ""}
                onChange={handleEditFormChange}
              />
            </Grid>

            {/* Examination-specific fields */}
            {editingRecord?.record_type === "examination" && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                    Vital Signs
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Blood Pressure"
                    name="vital_blood_pressure"
                    value={editFormData.vital_blood_pressure || ""}
                    onChange={handleEditFormChange}
                    placeholder="e.g., 120/80"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Heart Rate (bpm)"
                    name="vital_heart_rate"
                    type="number"
                    value={editFormData.vital_heart_rate || ""}
                    onChange={handleEditFormChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Respiratory Rate (breaths/min)"
                    name="vital_respiratory_rate"
                    type="number"
                    value={editFormData.vital_respiratory_rate || ""}
                    onChange={handleEditFormChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Temperature (°C)"
                    name="vital_temperature"
                    type="number"
                    inputProps={{ step: "0.1" }}
                    value={editFormData.vital_temperature || ""}
                    onChange={handleEditFormChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Weight (kg)"
                    name="vital_weight"
                    type="number"
                    inputProps={{ step: "0.01" }}
                    value={editFormData.vital_weight || ""}
                    onChange={handleEditFormChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Height (cm)"
                    name="vital_height"
                    type="number"
                    inputProps={{ step: "0.01" }}
                    value={editFormData.vital_height || ""}
                    onChange={handleEditFormChange}
                  />
                </Grid>
              </>
            )}

            {/* Diagnosis and Treatment */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={editingRecord?.record_type === "examination" ? "Findings" : "Diagnosis"}
                name="diagnosis"
                value={editFormData.diagnosis || ""}
                onChange={handleEditFormChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={editingRecord?.record_type === "examination" ? "Recommendation" : "Treatment"}
                name="treatment"
                value={editFormData.treatment || ""}
                onChange={handleEditFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HealthRecords;
