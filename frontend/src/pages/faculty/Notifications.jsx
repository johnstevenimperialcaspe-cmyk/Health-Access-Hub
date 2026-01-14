 import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Paper,
  Button,
  Tooltip,
} from "@mui/material";
import { Button as AntButton } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneAllIcon from "@mui/icons-material/DoneAll";

const Notifications = ({ notifications = [], onMarkAsRead, onMarkAllAsRead }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = notifications.filter((n) => !(n.isRead || n.read)).length;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Notifications</Typography>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DoneAllIcon />}
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      <Paper
        elevation={2}
        sx={{ maxHeight: 600, overflow: "auto", borderRadius: 2 }}
      >
        <List>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="No notifications" />
            </ListItem>
          ) : (
            notifications.map((notif, index) => {
              const isRead = notif.isRead || notif.read || false;
              return (
                <React.Fragment key={notif.id || index}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      !isRead && (
                        <AntButton
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={() => onMarkAsRead && onMarkAsRead(notif.id)}
                        >
                          
                        </AntButton>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{ bgcolor: isRead ? "grey.400" : "primary.main" }}
                      >
                        {isRead ? <MarkEmailReadIcon /> : <NotificationsActiveIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight={isRead ? "normal" : "bold"}
                          >
                            {notif.title}
                          </Typography>
                          <Chip
                            label={isRead ? "Read" : "New"}
                            size="small"
                            color={isRead ? "default" : "error"}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {notif.message}
                          </Typography>
                          <br />
                          <Typography component="span" variant="caption" color="text.secondary">
                            {formatDate(notif.createdAt || notif.created_at || notif.time)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              );
            })
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Notifications;
