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

const StudentsRecords = ({ students = [], onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYearLevel, setFilterYearLevel] = useState("");

  // Filter records
  const filteredRecords = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        !searchTerm ||
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse = !filterCourse || student.course === filterCourse;
      const matchesYearLevel = !filterYearLevel || student.year_level === filterYearLevel;

      return matchesSearch && matchesCourse && matchesYearLevel;
    });
  }, [students, searchTerm, filterCourse, filterYearLevel]);

  // Get unique courses and year levels for filters
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

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }} fontWeight="bold">
        Student Records
      </Typography>

      {/* Search and Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, ID, email, or course..."
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
          <Grid xs={12} md={3}>
            <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: 160 }}>
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
          <Grid xs={12} md={3}>
            <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: 160 }}>
              <InputLabel>Year Level</InputLabel>
              <Select
                value={filterYearLevel}
                onChange={(e) => setFilterYearLevel(e.target.value)}
                label="Year Level"
              >
                <MenuItem value="">All Year Levels</MenuItem>
                {uniqueYearLevels.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
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
              <TableCell><strong>Student ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Course</strong></TableCell>
              <TableCell><strong>Year Level</strong></TableCell>
              <TableCell><strong>Section</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {students.length === 0
                      ? "No student records found."
                      : "No records match your search criteria."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>{student.student_id || "N/A"}</TableCell>
                  <TableCell>
                    {student.first_name} {student.last_name}
                  </TableCell>
                  <TableCell>{student.email || "N/A"}</TableCell>
                  <TableCell>{student.course || "N/A"}</TableCell>
                  <TableCell>{student.year_level || "N/A"}</TableCell>
                  <TableCell>{student.section || "N/A"}</TableCell>
                  <TableCell align="center">
                    <Space>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => onEdit && onEdit(student.id, student)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete && onDelete(student.id)}
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

export default StudentsRecords;
