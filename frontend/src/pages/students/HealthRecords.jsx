import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import { Button as AntButton } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import HealingIcon from "@mui/icons-material/Healing";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

const HealthRecords = ({ records = [] }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      !searchTerm ||
      record.record_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.chief_complaint?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "examination" &&
        record.chief_complaint === "Physical/Medical Examination") ||
      (filterType === "other" &&
        record.chief_complaint !== "Physical/Medical Examination");

    return matchesSearch && matchesFilter;
  });

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  const parseNotes = (notes) => {
    if (!notes) return { physical: {}, medical: {} };
    try {
      return typeof notes === "string" ? JSON.parse(notes) : notes;
    } catch {
      return { physical: {}, medical: {} };
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">My Health Records</Typography>
      </Box>

      {/* Search and Filter */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid xs={12} md={6}>
          <TextField
            select
            fullWidth
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              ),
            }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="all">All Records</option>
            <option value="examination">Physical/Medical Examinations</option>
            <option value="other">Other Records</option>
          </TextField>
        </Grid>
      </Grid>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell>
                <strong>Type</strong>
              </TableCell>
              <TableCell>
                <strong>Details</strong>
              </TableCell>
              <TableCell>
                <strong>Record Type</strong>
              </TableCell>
              <TableCell align="center">
                <strong>View</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">
                    {records.length === 0
                      ? "No health records available."
                      : "No records match your search criteria."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => {
                const isExamination =
                  record.chief_complaint === "Physical/Medical Examination";
                const notes = parseNotes(record.notes);
                const physical = notes.physical || {};
                const medical = notes.medical || {};

                return (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      {record.date_of_visit
                        ? new Date(record.date_of_visit).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <HealingIcon fontSize="small" color="primary" />
                        {isExamination
                          ? "Physical/Medical Exam"
                          : record.record_type || "Health Record"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {isExamination ? (
                        <Box>
                          {physical.height && (
                            <Typography variant="caption" display="block">
                              Height: {physical.height} cm
                            </Typography>
                          )}
                          {physical.weight && (
                            <Typography variant="caption" display="block">
                              Weight: {physical.weight} kg
                            </Typography>
                          )}
                          {physical.bloodPressure && (
                            <Typography variant="caption" display="block">
                              BP: {physical.bloodPressure}
                            </Typography>
                          )}
                          {medical.findings && (
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ color: "primary.main", fontWeight: "bold" }}
                            >
                              Findings: {medical.findings.substring(0, 50)}
                              {medical.findings.length > 50 ? "..." : ""}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2">
                          {record.diagnosis || record.chief_complaint || "N/A"}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.record_type || "Health Record"}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <AntButton
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewRecord(record)}
                      >

                      </AntButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Record Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Health Record Details -{" "}
          {selectedRecord?.date_of_visit
            ? new Date(selectedRecord.date_of_visit).toLocaleDateString()
            : "N/A"}
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Record Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.record_type || "Health Record"}
                  </Typography>
                </Grid>
                <Grid xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date of Visit
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.date_of_visit
                      ? new Date(selectedRecord.date_of_visit).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </Grid>
                {selectedRecord.chief_complaint ===
                  "Physical/Medical Examination" && (
                    <>
                      <Divider sx={{ my: 2, width: "100%" }} />
                      <Grid xs={12}>
                        <Typography variant="h6" gutterBottom>
                          Physical Examination
                        </Typography>
                        <Grid container spacing={2}>
                          {selectedRecord.vital_height && (
                            <Grid xs={6} md={3}>
                              <Typography variant="caption" color="text.secondary">
                                Height
                              </Typography>
                              <Typography variant="body2">
                                {selectedRecord.vital_height} cm
                              </Typography>
                            </Grid>
                          )}
                          {selectedRecord.vital_weight && (
                            <Grid xs={6} md={3}>
                              <Typography variant="caption" color="text.secondary">
                                Weight
                              </Typography>
                              <Typography variant="body2">
                                {selectedRecord.vital_weight} kg
                              </Typography>
                            </Grid>
                          )}
                          {selectedRecord.vital_blood_pressure && (
                            <Grid xs={6} md={3}>
                              <Typography variant="caption" color="text.secondary">
                                Blood Pressure
                              </Typography>
                              <Typography variant="body2">
                                {selectedRecord.vital_blood_pressure}
                              </Typography>
                            </Grid>
                          )}
                          {selectedRecord.vital_heart_rate && (
                            <Grid xs={6} md={3}>
                              <Typography variant="caption" color="text.secondary">
                                Heart Rate
                              </Typography>
                              <Typography variant="body2">
                                {selectedRecord.vital_heart_rate} bpm
                              </Typography>
                            </Grid>
                          )}
                          {selectedRecord.vital_respiratory_rate && (
                            <Grid xs={6} md={3}>
                              <Typography variant="caption" color="text.secondary">
                                Respiratory Rate
                              </Typography>
                              <Typography variant="body2">
                                {selectedRecord.vital_respiratory_rate} breaths/min
                              </Typography>
                            </Grid>
                          )}
                          {selectedRecord.vital_temperature && (
                            <Grid xs={6} md={3}>
                              <Typography variant="caption" color="text.secondary">
                                Temperature
                              </Typography>
                              <Typography variant="body2">
                                {selectedRecord.vital_temperature} °C
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Grid>
                      <Divider sx={{ my: 2, width: "100%" }} />
                      <Grid xs={12}>
                        <Typography variant="h6" gutterBottom>
                          Medical Examination
                        </Typography>
                        {(() => {
                          const notes = parseNotes(selectedRecord.notes);
                          return (
                            <>
                              {notes.medical?.findings && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography
                                    variant="subtitle2"
                                    color="primary"
                                    gutterBottom
                                  >
                                    Findings:
                                  </Typography>
                                  <Typography variant="body2" sx={{ pl: 2 }}>
                                    {notes.medical.findings}
                                  </Typography>
                                </Box>
                              )}
                              {notes.medical?.recommendation && (
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    color="success.main"
                                    gutterBottom
                                  >
                                    Recommendation:
                                  </Typography>
                                  <Typography variant="body2" sx={{ pl: 2 }}>
                                    {notes.medical.recommendation}
                                  </Typography>
                                </Box>
                              )}
                            </>
                          );
                        })()}
                      </Grid>
                    </>
                  )}
                {selectedRecord.diagnosis && (
                  <>
                    <Divider sx={{ my: 2, width: "100%" }} />
                    <Grid xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Diagnosis
                      </Typography>
                      <Typography variant="body1">
                        {selectedRecord.diagnosis}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {selectedRecord && (
            <Button
              onClick={() => window.open(`/print/student/${selectedRecord.id}`, "_blank")}
              variant="outlined"
            >
              Print
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HealthRecords;

