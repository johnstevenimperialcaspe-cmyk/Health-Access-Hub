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
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Button as AntButton, Space } from "antd";
import { EyeOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UnreadIcon,
  Drafts as DraftsIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";

const Notifications = ({ notifications = [], onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRead, setFilterRead] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Filter and sort notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications.filter((notif) => {
      const matchesSearch =
        !searchTerm ||
        notif.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${notif.sender_first_name || ""} ${notif.sender_last_name || ""}`.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !filterType || notif.type === filterType;
      const matchesRead =
        filterRead === "" ||
        (filterRead === "read" && (notif.is_read || notif.isRead)) ||
        (filterRead === "unread" && !notif.is_read && !notif.isRead);

      return matchesSearch && matchesType && matchesRead;
    });

    // Sort notifications
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortBy === "date") {
        aValue = new Date(a.created_at || a.createdAt || a.time || 0);
        bValue = new Date(b.created_at || b.createdAt || b.time || 0);
      } else if (sortBy === "type") {
        aValue = a.type || "";
        bValue = b.type || "";
      } else if (sortBy === "sender") {
        aValue = `${a.sender_first_name || ""} ${a.sender_last_name || ""}`.toLowerCase();
        bValue = `${b.sender_first_name || ""} ${b.sender_last_name || ""}`.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [notifications, searchTerm, filterType, filterRead, sortBy, sortOrder]);

  // Get unique types for filter
  const uniqueTypes = useMemo(() => {
    const types = new Set();
    notifications.forEach((notif) => {
      if (notif.type) types.add(notif.type);
    });
    return Array.from(types);
  }, [notifications]);

  const handleMarkAsRead = async (id, isRead) => {
    try {
      if (isRead) {
        // Mark as unread - need to implement if backend supports it
        toast.info("Mark as unread functionality coming soon");
      } else {
        await axios.put(`/api/notifications/${id}/read`);
        toast.success("Notification marked as read");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update notification");
    }
  };

  const handleReadAll = async () => {
    try {
      const unreadCount = notifications.filter(n => !n.is_read && !n.isRead).length;
      if (unreadCount === 0) {
        toast.info("No unread notifications to mark");
        return;
      }
      await axios.put("/api/notifications/read-all");
      toast.success(`All ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''} marked as read`);
      // Trigger a re-fetch by parent component if needed
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark all as read");
    }
  };

  const handleViewDetails = (notif) => {
    setSelectedNotification(notif);
    setDetailDialogOpen(true);
  };

  const getTypeColor = (type) => {
    if (!type) return "default";
    const typeMap = {
      appointment_reminder: "info",
      new_appointment: "warning",
      appointment_confirmed: "success",
      appointment_cancelled: "error",
      health_record: "secondary",
    };
    return typeMap[type] || "default";
  };

  const getTypeLabel = (type) => {
    if (!type) return "N/A";
    const labelMap = {
      appointment_reminder: "Appointment Reminder",
      new_appointment: "New Appointment Request",
      appointment_confirmed: "Appointment Confirmed",
      appointment_cancelled: "Appointment Cancelled",
      health_record: "Health Record Update",
    };
    return labelMap[type] || type.replace(/_/g, " ").toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }} fontWeight="bold">
        Notifications Management
      </Typography>

      {/* Search and Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by title, message, or sender..."
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
          <Grid xs={12} md={2}>
            <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: 140 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {uniqueTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={2}>
            <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="unread">Unread</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={2}>
            <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: 130 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                displayEmpty
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
                renderValue={(selected) => (selected ? selected : <em style={{ color: 'rgba(0,0,0,0.65)' }}>Date</em>)}
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="type">Type</MenuItem>
                <MenuItem value="sender">Sender</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={2}>
            <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: 120 }}>
              <InputLabel>Order</InputLabel>
              <Select
                displayEmpty
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Order"
                renderValue={(selected) => (selected ? selected : <em style={{ color: 'rgba(0,0,0,0.65)' }}>Newest</em>)}
              >
                <MenuItem value="desc">Newest First</MenuItem>
                <MenuItem value="asc">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={2}>
            <Button fullWidth size="small" variant="outlined" sx={{ minWidth: 120 }} onClick={() => { setSearchTerm(""); setFilterType(""); setFilterRead(""); setSortBy("date"); setSortOrder("desc"); }}>
              Clear Filters
            </Button>
          </Grid>
          <Grid xs={12} md={1}>
            <Tooltip title="Mark all unread notifications as read">
              <Button 
                fullWidth 
                size="small" 
                variant="contained" 
                color="primary"
                startIcon={<DraftsIcon />}
                onClick={handleReadAll}
                sx={{ minWidth: 100 }}
              >
                Read All
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>  

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Message</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Sender</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNotifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {notifications.length === 0
                      ? "No notifications found."
                      : "No notifications match your search criteria."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notif) => {
                const isRead = notif.is_read || notif.isRead || false;
                return (
                  <TableRow key={notif.id} hover>
                    <TableCell>#{notif.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={isRead ? "normal" : "bold"}>
                        {notif.title || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {notif.message || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getTypeLabel(notif.type)} 
                        size="small" 
                        color={getTypeColor(notif.type)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {notif.sender_first_name || notif.sender_last_name
                        ? `${notif.sender_first_name || ""} ${notif.sender_last_name || ""}`.trim()
                        : "System"}
                    </TableCell>
                    <TableCell>
                      {formatDate(notif.created_at || notif.createdAt || notif.time)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isRead ? "Read" : "Unread"}
                        color={isRead ? "default" : "primary"}
                        size="small"
                        icon={isRead ? <CheckCircleIcon /> : <UnreadIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Space>
                        <AntButton
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewDetails(notif)}
                        >
                          View
                        </AntButton>
                        <AntButton
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={() => handleMarkAsRead(notif.id, isRead)}
                        >
                          {isRead ? "Unread" : "Read"}
                        </AntButton>
                        <AntButton
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => onDelete && onDelete(notif.id)}
                        >
                          
                        </AntButton>
                      </Space>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Notification Details Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Notification Details</Typography>
            <Chip 
              label={getTypeLabel(selectedNotification?.type)} 
              color={getTypeColor(selectedNotification?.type)}
              variant="outlined"
              size="small"
            />
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {selectedNotification && (
            <List disablePadding>
              <ListItem disableGutters sx={{ display: "block", mb: 1.5 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  ID
                </Typography>
                <Typography variant="body1">#{selectedNotification.id}</Typography>
              </ListItem>

              <ListItem disableGutters sx={{ display: "block", mb: 1.5 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Title
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedNotification.title || "N/A"}
                </Typography>
              </ListItem>

              <ListItem disableGutters sx={{ display: "block", mb: 1.5 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Message
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {selectedNotification.message || "N/A"}
                </Typography>
              </ListItem>

              <Divider sx={{ my: 2 }} />

              <ListItem disableGutters sx={{ display: "block", mb: 1.5 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  From
                </Typography>
                <Typography variant="body1">
                  {selectedNotification.sender_first_name || selectedNotification.sender_last_name
                    ? `${selectedNotification.sender_first_name || ""} ${selectedNotification.sender_last_name || ""}`.trim()
                    : "System"}
                </Typography>
              </ListItem>

              <ListItem disableGutters sx={{ display: "block", mb: 1.5 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Type
                </Typography>
                <Typography variant="body1">{getTypeLabel(selectedNotification.type)}</Typography>
              </ListItem>

              <ListItem disableGutters sx={{ display: "block", mb: 1.5 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={selectedNotification.is_read || selectedNotification.isRead ? "Read" : "Unread"}
                  color={selectedNotification.is_read || selectedNotification.isRead ? "default" : "primary"}
                  size="small"
                  icon={selectedNotification.is_read || selectedNotification.isRead ? <CheckCircleIcon /> : <UnreadIcon />}
                />
              </ListItem>

              <ListItem disableGutters sx={{ display: "block", mb: 1.5 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Date & Time
                </Typography>
                <Typography variant="body2">
                  {formatDate(selectedNotification.created_at || selectedNotification.createdAt || selectedNotification.time)}
                </Typography>
              </ListItem>

              {selectedNotification.priority && (
                <ListItem disableGutters sx={{ display: "block", mb: 1.5 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Priority
                  </Typography>
                  <Chip 
                    label={selectedNotification.priority.toUpperCase()}
                    size="small"
                    color={selectedNotification.priority === "urgent" ? "error" : selectedNotification.priority === "high" ? "warning" : "default"}
                  />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailDialogOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications;
