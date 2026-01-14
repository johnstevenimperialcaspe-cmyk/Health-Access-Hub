import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TablePagination,
  Tooltip,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Button as AntButton, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const Users = ({ users, onAdd, onEdit, onDelete, onToggleActive }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const roles = [
    "student",
    "faculty",
    "admin",
    "non_academic",
  ];

  // Filter users (role + search only)
  const filteredUsers = users.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;

    const fullName = `${user.first_name || ""} ${user.last_name || ""}`
      .toLowerCase()
      .trim();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      (user.email || "").toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await onToggleActive(userId, !isActive);
      toast.success("User active status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <Box sx={{ 
      padding: { xs: "16px 8px", sm: "16px", md: "24px" },
      width: "100%",
      maxWidth: "100%",
      overflow: "hidden"
    }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        fontWeight="bold"
        sx={{ 
          fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
          mb: { xs: 2, md: 3 }
        }}
      >
        Users Management
      </Typography>

      {/* ---------- FILTER BAR ---------- */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 2,
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box 
          display="flex" 
          flexDirection={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={2}
          sx={{ width: { xs: "100%", md: "auto" } }}
        >
          <TextField
            variant="outlined"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: { xs: "100%", sm: 250, md: 300 },
              width: { xs: "100%", sm: "auto" }
            }}
            size={isMobile ? "small" : "medium"}
          />

          <FormControl 
            variant="outlined" 
            sx={{ 
              minWidth: { xs: "100%", sm: 150 },
              width: { xs: "100%", sm: "auto" }
            }}
            size={isMobile ? "small" : "medium"}
          >
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              label="Role"
            >
              <MenuItem value="all">All Roles</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAdd}
          fullWidth={isMobile}
          size={isMobile ? "medium" : "large"}
          sx={{ 
            minWidth: { xs: "100%", md: "auto" },
            mt: { xs: 1, md: 0 }
          }}
        >
          Add User
        </Button>
      </Paper>

      {/* ---------- TABLE ---------- */}
      <TableContainer 
        component={Paper} 
        elevation={3}
        sx={{
          overflowX: "auto",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <Table sx={{ minWidth: { xs: 650, md: 750 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", md: "0.875rem" } }}>ID</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", md: "0.875rem" } }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", md: "0.875rem" } }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", md: "0.875rem" } }}>Role</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", md: "0.875rem" } }}>Active</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", md: "0.875rem" } }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => {
                const displayName =
                  `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                  "Unnamed User";

                return (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{ "&:hover": { bgcolor: "action.hover" } }}
                  >
                    <TableCell sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                      {user.student_id || user.employee_id || user.id}
                    </TableCell>
                    <TableCell sx={{ 
                      textTransform: "capitalize",
                      fontSize: { xs: "0.75rem", md: "0.875rem" }
                    }}>
                      {displayName}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>{user.email}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" }, textTransform: 'capitalize' }}>
                      {user.role ? user.role.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') : ''}
                    </TableCell>

                    {/* Active toggle (still kept – you asked to remove “status” column, not the toggle) */}
                    <TableCell>
                      <Tooltip
                        title={user.is_active === 1 ? "Active" : "Inactive"}
                      >
                        <Switch
                          checked={user.is_active === 1}
                          onChange={() =>
                            handleToggleActive(user.id, user.is_active === 1)
                          }
                          size={isMobile ? "small" : "medium"}
                        />
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Space>
                        <AntButton
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => onEdit(user.id, user)}
                        >
                          Edit
                        </AntButton>
                        {user.role !== "admin" && (
                          <AntButton
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => onDelete(user.id)}
                          >
                            
                          </AntButton>
                        )}
                      </Space>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ---------- PAGINATION ---------- */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          ".MuiTablePagination-toolbar": {
            flexWrap: { xs: "wrap", sm: "nowrap" },
            fontSize: { xs: "0.75rem", md: "0.875rem" }
          },
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
            fontSize: { xs: "0.75rem", md: "0.875rem" },
            mb: { xs: 1, sm: 0 }
          }
        }}
      />
    </Box>
  );
};

export default Users;
