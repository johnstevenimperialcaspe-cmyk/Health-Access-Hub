import React, { useState, useMemo } from "react";
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
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
} from "@mui/material";
import { Button, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Search as SearchIcon,
} from "@mui/icons-material";

const FacultiesRecords = ({ faculties = [], onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  // Filter records
  const filteredRecords = useMemo(() => {
    return faculties.filter((faculty) => {
      const matchesSearch =
        !searchTerm ||
        `${faculty.first_name} ${faculty.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = !filterDepartment || faculty.department === filterDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [faculties, searchTerm, filterDepartment]);

  // Get unique departments for filter
  const uniqueDepartments = useMemo(() => {
    const departments = new Set();
    faculties.forEach((faculty) => {
      if (faculty.department) departments.add(faculty.department);
    });
    return Array.from(departments);
  }, [faculties]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }} fontWeight="bold">
        Faculty Records
      </Typography>

      {/* Search and Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={6}>
              <TextField
              fullWidth
              size="small"
              placeholder="Search by name, ID, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: 180 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                label="Department"
              >
                <MenuItem value="">All Departments</MenuItem>
                {uniqueDepartments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Employee ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              {/* Specialization column removed */}
              <TableCell><strong>Position</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {faculties.length === 0
                      ? "No faculty records found."
                      : "No records match your search criteria."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((faculty) => (
                <TableRow key={faculty.id} hover>
                  <TableCell>{faculty.employee_id || "N/A"}</TableCell>
                  <TableCell>
                    {faculty.first_name} {faculty.last_name}
                  </TableCell>
                  <TableCell>{faculty.email || "N/A"}</TableCell>
                  <TableCell>{faculty.department || "N/A"}</TableCell>
                  {/* specialization removed */}
                  <TableCell>{faculty.position || "N/A"}</TableCell>
                  <TableCell align="center">
                    <Space>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => onEdit && onEdit(faculty.id, faculty)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete && onDelete(faculty.id)}
                      >
                        
                      </Button>
                    </Space>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FacultiesRecords;
