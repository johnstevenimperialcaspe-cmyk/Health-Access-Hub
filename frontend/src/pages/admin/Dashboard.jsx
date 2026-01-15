import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Badge,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  LocalHospital as HealthIcon,
  Notifications as NotificationIcon,
  Add as AddIcon,
  Description as RecordIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  Announcement as AnnouncementIcon,
} from "@mui/icons-material";
import HealthSlideshow from "../../components/HealthSlideshow";

const Dashboard = ({ data = {}, notifications = [], onViewNotifications, onSectionChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Fallback data if not loaded
  const {
    totalAppointments = 0,
    upcomingAppointments = 0,
    totalHealthRecords = 0,
    totalUsers = 0,
    unreadNotifications = 0,
    recentActivity = [],
  } = data;

  // Filter appointment notifications
  const appointmentNotifications = notifications.filter(
    (notif) => notif.type === "new_appointment" && !notif.is_read && !notif.isRead
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: { xs: 2, md: 3 }, flexWrap: 'wrap', gap: 1 }}
      >
        <Typography 
          variant={isMobile ? "h5" : "h3"} 
          sx={{ fontWeight: "bold" }}
        >
          Dashboard
        </Typography>
      </Box>

      {/* Alert for New Appointments */}
      {appointmentNotifications.length > 0 && (
        <Alert 
          severity="warning" 
          icon={<AnnouncementIcon />}
          sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '0.8rem', md: '0.875rem' } }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={onViewNotifications}
              sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}
            >
              View All
            </Button>
          }
        >
          <Typography variant={isMobile ? "caption" : "body2"} fontWeight="bold">
            You have {appointmentNotifications.length} new appointment request{appointmentNotifications.length !== 1 ? "s" : ""}
          </Typography>
          {appointmentNotifications.slice(0, isMobile ? 2 : 3).map((notif) => (
            <Typography key={notif.id} variant={isMobile ? "caption" : "body2"} sx={{ mt: 0.5 }}>
              • {notif.title}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Stat Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ bgcolor: "info.light", color: "info.contrastText", height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexDirection={{ xs: 'column', sm: 'row' }}
                textAlign={{ xs: 'center', sm: 'left' }}
              >
                <CalendarIcon sx={{ fontSize: { xs: 28, sm: 40 }, opacity: 0.8, mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }} />
                <Box>
                  <Typography variant={isMobile ? "caption" : "body2"} sx={{ fontSize: { xs: '0.65rem', sm: '0.875rem' } }}>
                    Appointments
                  </Typography>
                  <Typography variant={isMobile ? "h6" : "h4"} fontWeight="bold">
                    {totalAppointments}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ bgcolor: "info.light", color: "info.contrastText", height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexDirection={{ xs: 'column', sm: 'row' }}
                textAlign={{ xs: 'center', sm: 'left' }}
              >
                <RecordIcon sx={{ fontSize: { xs: 28, sm: 40 }, opacity: 0.8, mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }} />
                <Box>
                  <Typography variant={isMobile ? "caption" : "body2"} sx={{ fontSize: { xs: '0.65rem', sm: '0.875rem' } }}>
                    Total PME Records
                  </Typography>
                  <Typography variant={isMobile ? "h6" : "h4"} fontWeight="bold">
                    {upcomingAppointments}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ bgcolor: "info.light", color: "info.contrastText", height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexDirection={{ xs: 'column', sm: 'row' }}
                textAlign={{ xs: 'center', sm: 'left' }}
              >
                <HealthIcon sx={{ fontSize: { xs: 28, sm: 40 }, opacity: 0.8, mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }} />
                <Box>
                  <Typography variant={isMobile ? "caption" : "body2"} sx={{ fontSize: { xs: '0.65rem', sm: '0.875rem' } }}>
                    Health Records
                  </Typography>
                  <Typography variant={isMobile ? "h6" : "h4"} fontWeight="bold">
                    {totalHealthRecords}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ bgcolor: "info.light", color: "info.contrastText", height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexDirection={{ xs: 'column', sm: 'row' }}
                textAlign={{ xs: 'center', sm: 'left' }}
              >
                <PeopleIcon sx={{ fontSize: { xs: 28, sm: 40 }, opacity: 0.8, mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }} />
                <Box>
                  <Typography variant={isMobile ? "caption" : "body2"} sx={{ fontSize: { xs: '0.65rem', sm: '0.875rem' } }}>
                    Total Users
                  </Typography>
                  <Typography variant={isMobile ? "h6" : "h4"} fontWeight="bold">
                    {totalUsers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions Card */}
      <Card sx={{ mb: { xs: 3, md: 4 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom fontWeight="bold">
            Quick Actions
          </Typography>
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            <Grid item xs={6} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={!isMobile && <AddIcon />}
                sx={{ 
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
                onClick={() => onSectionChange?.("users")}
              >
                Add User
              </Button>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={!isMobile && <RecordIcon />}
                sx={{ 
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
                onClick={() => onSectionChange?.("health-records")}
              >
                {isMobile ? "Records" : "View Records"}
              </Button>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={!isMobile && <CalendarIcon />}
                sx={{ 
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
                onClick={() => onSectionChange?.("appointments")}
              >
                Appointments
              </Button>
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={!isMobile && <NotificationIcon />}
                sx={{ 
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
                onClick={() => onSectionChange?.("notifications")}
              >
                Notifications
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Health Slideshow */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <HealthSlideshow />
      </Box>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          {recentActivity && recentActivity.length > 0 ? (
            <List disablePadding>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id || index}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: activity.color || "grey.500" }}>
                        {activity.icon || <CalendarIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {activity.subtitle}
                          </Typography>
                          {" — "}
                          {activity.time}
                        </>
                      }
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={3}>
              No recent activity
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
