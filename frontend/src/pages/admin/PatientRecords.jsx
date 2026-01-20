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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import { Button, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Search as SearchIcon } from "@mui/icons-material";

const PatientRecords = ({ 
  students = [], 
  faculties = [], 
  nonAcademic = [], 
  onEdit, 
  onDelete 
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYearLevel, setFilterYearLevel] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  // Determine which data to display based on tab
  const getCurrentData = () => {
    switch (currentTab) {
      case 0:
        return students;
      case 1:
        return faculties;
      case 2:
        return nonAcademic;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  // Filter records based on search term and filters
  const filteredRecords = useMemo(() => {
    return currentData.filter((record) => {
      const matchesSearch =
        !searchTerm ||
        `${record.first_name} ${record.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse = !filterCourse || record.course === filterCourse;
      const matchesYearLevel = !filterYearLevel || record.year_level === filterYearLevel;
      const matchesDepartment = !filterDepartment || record.department === filterDepartment;

      return matchesSearch && matchesCourse && matchesYearLevel && matchesDepartment;
    });
  }, [currentData, searchTerm, filterCourse, filterYearLevel, filterDepartment]);

  // Get unique values for filters
  const uniqueCourses = useMemo(() => {
    const courses = new Set();
    students.forEach((student) => {
      if (student.course) courses.add(student.course);
    });
    return Array.from(courses);
  }, [students]);

  const uniqueYearLevels = useMemo(() => {
    const yearLevels = new Set();
    students.forEach((student) => {
      if (student.year_level) yearLevels.add(student.year_level);
    });
    return Array.from(yearLevels).sort();
  }, [students]);

  const uniqueDepartments = useMemo(() => {
    const departments = new Set();
    [...faculties, ...nonAcademic].forEach((record) => {
      if (record.department) departments.add(record.department);
    });
    return Array.from(departments);
  }, [faculties, nonAcademic]);

  // Reset filters when tab changes
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setSearchTerm("");
    setFilterCourse("");
    setFilterYearLevel("");
    setFilterDepartment("");
  };

  // Get role type for edit/delete callbacks
  const getRoleType = () => {
    switch (currentTab) {
      case 0:
        return "student";
      case 1:
        return "faculty";
      case 2:
        return "non_academic";
      default:
        return "student";
    }
  };

  const handleEdit = (record) => {
    const roleType = getRoleType();
    onEdit(roleType, record.id, record);
  };

  const handleDelete = (recordId) => {
    const roleType = getRoleType();
    onDelete(roleType, recordId);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }} fontWeight="bold">
        Patient Records
      </Typography>

      {/* Tabs for Student, Faculty, Non-Academic */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`Students (${students.length})`} />
          <Tab label={`Faculty (${faculties.length})`} />
          <Tab label={`Non-Academic (${nonAcademic.length})`} />
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, ID, email..."
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

          {/* Student-specific filters */}
          {currentTab === 0 && (
            <>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    label="Course"
                  >
                    <MenuItem value="">All Courses</MenuItem>
                    {uniqueCourses.map((course) => (
                      <MenuItem key={course} value={course}>
                        {course}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel>Year Level</InputLabel>
                  <Select
                    value={filterYearLevel}
                    onChange={(e) => setFilterYearLevel(e.target.value)}
                    label="Year Level"
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {uniqueYearLevels.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {/* Faculty and Non-Academic filters */}
          {(currentTab === 1 || currentTab === 2) && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" variant="outlined">
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
          )}
        </Grid>
      </Paper>

      {/* Records Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>
                {currentTab === 0 ? "Student ID" : "Employee ID"}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              {currentTab === 0 && (
                <>
                  <TableCell sx={{ fontWeight: "bold" }}>Course</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Year Level</TableCell>
                </>
              )}
              {(currentTab === 1 || currentTab === 2) && (
                <TableCell sx={{ fontWeight: "bold" }}>Department</TableCell>
              )}
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={currentTab === 0 ? 6 : 5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No records found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>
                    {currentTab === 0 ? record.student_id : record.employee_id}
                  </TableCell>
                  <TableCell>
                    {record.first_name} {record.middle_name ? `${record.middle_name} ` : ""}{record.last_name}
                  </TableCell>
                  <TableCell>{record.email}</TableCell>
                  {currentTab === 0 && (
                    <>
                      <TableCell>{record.course || "-"}</TableCell>
                      <TableCell>{record.year_level || "-"}</TableCell>
                    </>
                  )}
                  {(currentTab === 1 || currentTab === 2) && (
                    <TableCell>{record.department || "-"}</TableCell>
                  )}
                  <TableCell>
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                      >
                        Edit
                      </Button>
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                      >
                        Delete
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

export default PatientRecords;
