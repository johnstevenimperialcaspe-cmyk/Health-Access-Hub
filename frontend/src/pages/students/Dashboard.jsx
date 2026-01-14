import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  LocalHospital,
  Medication,
  Notifications,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import HealthSlideshow from "../../components/HealthSlideshow";

const Dashboard = ({
  data = {},
  studentName = "Student",
  studentId = "",
  onViewAllNotifications,
}) => {
  const {
    totalRecords = 0,
    ongoingTreatment = 0,
    unreadNotifications = 0,
    recentNotifications = [],
  } = data;

  return (
    <Box>
      {/* ========== WELCOME BANNER ========== */}
      <Box
        sx={{
          p: 4,
          borderRadius: 1,
          bgcolor: "primary.main",
          color: "#fff",
          mb: 4,
          boxShadow: 2,
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 1, textTransform: "capitalize" }}
        >
          Welcome back, {studentName}!
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Student ID: <strong>{studentId}</strong>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
          Stay healthy and informed!
        </Typography>
      </Box>

      {/* ============ QUICK STATS CARDS ============ */}
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="stretch"
        sx={{ mb: 5 }}
      >
        {[
          {
            icon: <LocalHospital />,
            label: "Health Records",
            value: totalRecords,
            color: "#0F172A",
          },
          {
            icon: <Medication />,
            label: "Ongoing Treatments",
            value: ongoingTreatment,
            color: "#22C55E",
          },
          {
            icon: <Notifications />,
            label: "Unread Notifications",
            value: unreadNotifications,
            color: "#F59E0B",
          },
        ].map((item, i) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={i}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Card
              sx={{
                width: "100%",
                maxWidth: 260,
                p: 2.5,
                textAlign: "center",
                borderRadius: 1,
                boxShadow: 3,
                transition: "0.3s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box sx={{ color: item.color, fontSize: 56, mb: 1 }}>
                {item.icon}
              </Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#1E293B" }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#0F172A" }}
              >
                {item.value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ============= HEALTH FACTS SLIDESHOW ============= */}
      <HealthSlideshow />

      {/* ============= RECENT NOTIFICATIONS ============= */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: 700, color: "#0F172A" }}
        >
          Recent Notifications
        </Typography>

        <Paper elevation={3} sx={{ borderRadius: 1 }}>
          <List>
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notif, idx) => (
                <React.Fragment key={notif.id ?? idx}>
                  <ListItem divider={idx < recentNotifications.length - 1}>
                    <ListItemIcon>
                      <NotificationsIcon
                        color={notif.isRead ? "disabled" : "primary"}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          fontWeight={notif.isRead ? "normal" : "bold"}
                        >
                          {notif.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {notif.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography
                      color="text.secondary"
                      align="center"
                      sx={{ py: 2 }}
                    >
                      No new notifications.
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </Paper>

        <Button
          variant="outlined"
          sx={{ mt: 2, borderRadius: 1 }}
          onClick={onViewAllNotifications}
        >
          View All Notifications
        </Button>
      </Box>

    </Box>
  );
};

export default Dashboard;
