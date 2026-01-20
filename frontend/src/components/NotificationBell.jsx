import React, { useState, useEffect } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Divider,
  Button,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import api from "../config/api";

const NotificationBell = ({ onViewAll }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const open = Boolean(anchorEl);

  // Load notifications
  const loadNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      const notifs = res.data.notifications || [];
      setNotifications(notifs);
      
      // Count unread notifications
      const unread = notifs.filter((n) => !(n.isRead || n.read || n.is_read)).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.put(`/api/notifications/${notifId}/read`);
      await loadNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      await loadNotifications();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleViewAll = () => {
    handleClose();
    if (onViewAll) {
      onViewAll();
    }
  };

  // Get recent notifications (max 5 for preview)
  const recentNotifications = notifications.slice(0, 5);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{
            color: "white",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Box>
          {unreadCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </Typography>
          )}
        </Box>

        {/* Notifications List */}
        {recentNotifications.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <NotificationsIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 320, overflowY: "auto" }}>
            {recentNotifications.map((notif) => {
              const isRead = notif.isRead || notif.read || notif.is_read;
              const createdAt = notif.created_at || notif.createdAt;
              const timeAgo = createdAt
                ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
                : "";

              return (
                <React.Fragment key={notif.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      bgcolor: isRead ? "transparent" : "action.hover",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "action.selected",
                      },
                    }}
                    onClick={() => !isRead && handleMarkAsRead(notif.id)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: isRead ? "grey.400" : "primary.main" }}>
                        {isRead ? <MarkEmailReadIcon /> : <NotificationsActiveIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography
                            variant="body2"
                            fontWeight={isRead ? "normal" : "bold"}
                            sx={{ flex: 1 }}
                          >
                            {notif.title || notif.message}
                          </Typography>
                          {!isRead && (
                            <CircleIcon
                              sx={{ fontSize: 8, color: "primary.main" }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          {notif.message && notif.title && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                mb: 0.5,
                              }}
                            >
                              {notif.message}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {timeAgo}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              );
            })}
          </List>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <Box
            sx={{
              p: 1,
              borderTop: 1,
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Button fullWidth onClick={handleViewAll}>
              View all notifications
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
