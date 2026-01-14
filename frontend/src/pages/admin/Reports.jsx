// src/pages/admin/Reports.jsx
import React, { useState } from "react";
import { Box, Typography, Button, Grid, Tabs, Tab, CircularProgress } from "@mui/material";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import axios from "../../utils/axios";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384"];

/* -------------------------------------------------------------------------- */
/*                               NOTE                                         */
/* -------------------------------------------------------------------------- */
// Removed demo chart data. Charts will render empty until real analytics data
// is provided from the backend. You can pass `stats` as a prop with the same
// shape used previously (recordsByType, recordsByMonth).
const defaultStats = {
  recordsByType: [],
  recordsByMonth: [],
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Reports = ({ stats = defaultStats }) => {
  const [tabValue, setTabValue] = useState(0);
  const [exporting, setExporting] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const exportHealthRecordsToExcel = async () => {
    setExporting(true);
    try {
      // Fetch all health records without pagination
      const response = await axios.get("/api/health-records?limit=10000");
      const records = response.data.healthRecords || [];

      console.log("Total records fetched:", records.length);
      console.log("Sample record:", records[0]);

      if (records.length === 0) {
        toast.info("No health records to export");
        setExporting(false);
        return;
      }

      // Format data according to the specified Excel structure
      const excelData = records.map((record) => {
        // Get user's full name from the record - trim to handle trailing spaces
        const firstName = (record.student_first_name || "").trim();
        const middleName = (record.student_middle_name || "").trim();
        const lastName = (record.student_last_name || "").trim();
        const userName = `${firstName} ${middleName} ${lastName}`.trim() || "-";
        
        // Determine record type
        const recordType = record.record_type === "visit" ? "Logbook Visit" : "Physical/Medical Exam";
        
        // Determine role and ID based on user_role from the joined users table
        let role = "Student";
        let userId = "";
        
        if (record.user_role === "student") {
          role = "Student";
          userId = record.user_student_id || "";
        } else if (record.user_role === "faculty") {
          role = "Faculty";
          userId = record.user_employee_id || "";
        } else if (record.user_role === "non_academic") {
          role = "Non-Academic";
          userId = record.user_employee_id || "";
        } else if (record.user_role === "admin") {
          role = "Admin";
          userId = record.user_employee_id || "";
        } else {
          // Fallback: try to determine from IDs
          if (record.user_student_id) {
            role = "Student";
            userId = record.user_student_id;
          } else if (record.user_employee_id) {
            role = "Faculty";
            userId = record.user_employee_id;
          }
        }
        
        // Use date_of_visit for the date/time, or created_at as fallback
        const dateValue = record.date_of_visit || record.created_at;
        
        console.log(`Record ${record.id}: Role=${record.user_role}, ID=${userId}, Name=${userName}`);
        
        return {
          DATE: formatDate(dateValue),
          TIME: formatTime(dateValue),
          ROLE: role,
          ID: userId,
          NAME: userName,
          "RECORD TYPE": recordType,
        };
      });

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Health Records");

      // Set column widths
      worksheet["!cols"] = [
        { wch: 12 }, // DATE
        { wch: 10 }, // TIME
        { wch: 15 }, // ROLE
        { wch: 15 }, // ID
        { wch: 30 }, // NAME
        { wch: 25 }, // RECORD TYPE
      ];

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `Health_Records_Export_${currentDate}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);
      toast.success(`Exported ${records.length} health records to Excel`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.response?.data?.message || "Failed to export health records");
    } finally {
      setExporting(false);
    }
  };

  const exportUsersToExcel = async () => {
    setExporting(true);
    try {
      // Admin-only endpoint returns paginated users; request large limit
      const response = await axios.get("/api/users?limit=10000");
      const users = response.data.users || [];

      if (users.length === 0) {
        toast.info("No users to export");
        setExporting(false);
        return;
      }

      const excelData = users.map((u) => {
        const first = (u.first_name || "").trim();
        const middle = (u.middle_name || "").trim();
        const last = (u.last_name || "").trim();
        const name = `${first} ${middle} ${last}`.replace(/\s+/g, " ").trim() || "-";

        const roleLabel =
          u.role === "student" ? "Student" :
          u.role === "faculty" ? "Faculty" :
          u.role === "non_academic" ? "Non-Academic" :
          (u.role || "").toString();

        const userId = u.student_id || u.employee_id || "";

        return {
          ROLE: roleLabel,
          ID: userId,
          NAME: name,
          EMAIL: u.email || "",
          DEPARTMENT: u.department || "",
          POSITION: u.position || "",
          COLLEGE: u.college || "",
          COURSE: u.course || "",
          "YEAR LEVEL": u.year_level ?? "",
          ACTIVE: u.is_active === 1 ? "Yes" : u.is_active === 0 ? "No" : "",
          "CREATED AT": u.created_at
            ? new Date(u.created_at).toLocaleString("en-US", { hour12: true })
            : "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      // Column widths
      worksheet["!cols"] = [
        { wch: 14 }, // ROLE
        { wch: 16 }, // ID
        { wch: 28 }, // NAME
        { wch: 26 }, // EMAIL
        { wch: 18 }, // DEPARTMENT
        { wch: 16 }, // POSITION
        { wch: 16 }, // COLLEGE
        { wch: 16 }, // COURSE
        { wch: 12 }, // YEAR LEVEL
        { wch: 10 }, // ACTIVE
        { wch: 22 }, // CREATED AT
      ];

      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `Users_Export_${currentDate}.xlsx`;
      XLSX.writeFile(workbook, filename);
      toast.success(`Exported ${users.length} users to Excel`);
    } catch (error) {
      console.error("Users export error:", error);
      toast.error(error.response?.data?.message || "Failed to export users");
    } finally {
      setExporting(false);
    }
  };

  const exportAppointmentsToExcel = async () => {
    setExporting(true);
    try {
      // Fetch many appointments (admin sees all)
      const response = await axios.get("/api/appointments?limit=10000");
      const appointments = response.data.appointments || [];

      if (appointments.length === 0) {
        toast.info("No appointments to export");
        setExporting(false);
        return;
      }

      // Normalize and format rows for Excel
      const excelData = appointments.map((a) => {
        const first = (a.user_first_name || "").trim();
        const middle = (a.user_middle_name || "").trim();
        const last = (a.user_last_name || "").trim();
        const name = `${first} ${middle} ${last}`.replace(/\s+/g, " ").trim() || "-";

        // appointment_date is a date string (YYYY-MM-DD). Keep time from appointment_time.
        const dateStr = a.appointment_date ? new Date(a.appointment_date) : null;
        const formattedDate = dateStr
          ? dateStr.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
          : "";

        const formattedTime = a.appointment_time || ""; // already HH:mm from DB

        return {
          DATE: formattedDate,
          TIME: formattedTime,
          NAME: name,
          "STUDENT ID": a.student_id || "",
          PURPOSE: a.purpose || "",
          STATUS: a.status || "",
          DURATION: a.duration ?? "",
          NOTES: a.notes || "",
          "CREATED AT": a.created_at
            ? new Date(a.created_at).toLocaleString("en-US", { hour12: true })
            : "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");

      // Column widths
      worksheet["!cols"] = [
        { wch: 12 }, // DATE
        { wch: 10 }, // TIME
        { wch: 28 }, // NAME
        { wch: 16 }, // STUDENT ID
        { wch: 22 }, // PURPOSE
        { wch: 12 }, // STATUS
        { wch: 10 }, // DURATION
        { wch: 35 }, // NOTES
        { wch: 22 }, // CREATED AT
      ];

      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `Appointments_Export_${currentDate}.xlsx`;
      XLSX.writeFile(workbook, filename);
      toast.success(`Exported ${appointments.length} appointments to Excel`);
    } catch (error) {
      console.error("Appointments export error:", error);
      toast.error(error.response?.data?.message || "Failed to export appointments");
    } finally {
      setExporting(false);
    }
  };

  // Ensure all arrays are defined and are actually arrays
  // This prevents "Cannot read properties of undefined (reading 'map')" errors
  const recordsByType = Array.isArray(stats?.recordsByType) ? stats.recordsByType : [];
  const recordsByMonth = Array.isArray(stats?.recordsByMonth) ? stats.recordsByMonth : [];
  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Reports
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="reports tabs"
        sx={{ mb: 3 }}
      >
        <Tab label="Exports" />
        <Tab label="Analytics" />
      </Tabs>

      {/* ==================== EXPORTS TAB ==================== */}
      <TabPanel value={tabValue} index={0}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Download Excel Reports
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={exportHealthRecordsToExcel}
              disabled={exporting}
              startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {exporting ? "Exporting..." : "Export Health Records"}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={exportAppointmentsToExcel}
              disabled={exporting}
              startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {exporting ? "Exporting..." : "Export Appointments"}
            </Button>
            <Button
              variant="outlined"
              onClick={exportUsersToExcel}
              disabled={exporting}
              startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {exporting ? "Exporting..." : "Export Users"}
            </Button>
          </Box>
        </Box>
      </TabPanel>

      {/* ==================== ANALYTICS TAB ==================== */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Health Records Analytics
        </Typography>

        <Grid container spacing={3}>
          {/* ROW 1: Record Types (50% width) */}
          <Grid xs={12} md={6} sx={{ width: "100%" }}>
            <Box
              sx={{
                bgcolor: "background.paper",
                p: 2,
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Record Types
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={recordsByType}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ _id, percent }) =>
                      `${_id}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {recordsByType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* ROW 1: Monthly Activity (50% width) */}
          <Grid xs={12} md={6} sx={{ width: "100%" }}>
            <Box
              sx={{
                bgcolor: "background.paper",
                p: 2,
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Monthly Activity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recordsByMonth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Records" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* ROW 2: Follow-Up Trends (50% width) */}
          <Grid xs={12} md={6} sx={{ width: "100%" }}>
            <Box
              sx={{
                bgcolor: "background.paper",
                p: 2,
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Follow-Up Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={recordsByMonth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#00C49F"
                    strokeWidth={2}
                    dot={{ fill: "#00C49F" }}
                    name="Follow-Ups"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Reports;
