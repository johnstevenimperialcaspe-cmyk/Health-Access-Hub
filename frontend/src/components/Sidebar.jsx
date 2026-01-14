import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StethoscopeIcon from "@mui/icons-material/LocalHospital";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import HistoryIcon from "@mui/icons-material/History";
import StarIcon from "@mui/icons-material/Star";
import AuditIcon from "@mui/icons-material/Assessment";
import BookIcon from "@mui/icons-material/Book";

const Sidebar = ({ role, currentSection, onSectionChange, mobileOpen, onMobileClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ---------- Base items for all users ----------
  const baseItems = [
    { icon: <DashboardIcon />, label: "Dashboard", section: "dashboard" },
    { icon: <AccountCircleIcon />, label: "Account", section: "account" },
    {
      icon: <MedicalServicesIcon />,
      label: "Health Records",
      section: "health-records",
    },
    {
      icon: <CalendarTodayIcon />,
      label: "Appointments",
      section: "appointments",
    },
    {
      icon: <NotificationsIcon />,
      label: "Notifications",
      section: "notifications",
    },
  ];

  // ---------- Role-specific items ----------
  const roleItems = [];

  // Physical & Medical Exam – faculty, student, non_academic, admin
  if (["faculty", "student", "non_academic", "admin"].includes(role)) {
    roleItems.push({
      icon: <StethoscopeIcon />,
      label: "Physical & Medical Exam",
      section: "examinations",
    });
  }

  // Visit History & Evaluations – students, faculty, non_academic
  if (["student", "faculty", "non_academic"].includes(role)) {
    roleItems.push({
      icon: <HistoryIcon />,
      label: "Visit History",
      section: "visit-history",
    });
  }

  // Activity Log – for non-admin users
  // if (["student", "faculty", "non_academic"].includes(role)) {
  //   roleItems.push({
  //     icon: <AuditIcon />,
  //     label: "Activity Log",
  //     section: "activity-log",
  //   });
  // }

  // Admin-only items
  if (role === "admin") {
    roleItems.push(
      {
        icon: <SchoolIcon />,
        label: "Student Records",
        section: "student-records",
      },
      {
        icon: <PeopleIcon />,
        label: "Faculty Records",
        section: "faculty-records",
      },
      {
        icon: <PeopleIcon />,
        label: "Non-Academic Records",
        section: "non-academic-records",
      },

      {
        icon: <PeopleIcon />,
        label: "Users",
        section: "users",
      },
      // {
      //   icon: <NotesIcon />,
      //   label: "Logbook (Old)",
      //   section: "logbook",
      // },
      {
        icon: <BookIcon />,
        label: "Logbook",
        section: "logbook-v2",
      },
      {
        icon: <StarIcon />,
        label: "Evaluations",
        section: "evaluations",
      },
      {
        icon: <AuditIcon />,
        label: "Audit Logs",
        section: "audit-logs",
      },
      {
        icon: <BarChartIcon />,
        label: "Reports",
        section: "reports",
      }
    );
  }

  // ---------- Final merged list ----------
  const items = [...baseItems, ...roleItems];

  const handleSectionChange = (section) => {
    onSectionChange(section);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <Box
      sx={{
        width: isMobile ? 250 : 250,
        bgcolor: "background.paper",
        height: "100%",
        p: 2,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
      role="presentation"
    >
      <List>
        {items.map((item) => (
          <ListItem key={item.section} disablePadding>
            <ListItemButton
              selected={currentSection === item.section}
              onClick={() => handleSectionChange(item.section)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                  "&:hover": {
                    bgcolor: "primary.main",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color:
                    currentSection === item.section
                      ? "inherit"
                      : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: isMobile ? '0.9rem' : '1rem'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // On mobile, use Drawer. On desktop, show sidebar directly
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
            boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // Desktop: permanent sidebar
  return (
    <Box
      sx={{
        width: 250,
        bgcolor: "background.paper",
        minHeight: "calc(100vh - 64px)",
        p: 2,
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        overflowY: "auto",
        display: { xs: 'none', md: 'flex' },
        flexDirection: "column",
      }}
    >
      <List>
        {items.map((item) => (
          <ListItem key={item.section} disablePadding>
            <ListItemButton
              selected={currentSection === item.section}
              onClick={() => onSectionChange(item.section)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                  "&:hover": {
                    bgcolor: "primary.main",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color:
                    currentSection === item.section
                      ? "inherit"
                      : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
