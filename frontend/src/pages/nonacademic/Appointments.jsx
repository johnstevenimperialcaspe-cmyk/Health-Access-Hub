import React from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Button as AntButton, Space, Tag } from "antd";
import { EditOutlined, DeleteOutlined, StarOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const Appointments = ({ appointments = [], onAdd, onEdit, onDelete, onEvaluate }) => {
  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">My Appointments</Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => onAdd && onAdd()}
        >
          + Schedule Appointment
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell>
                <strong>Time</strong>
              </TableCell>
              <TableCell>
                <strong>Purpose</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">
                    No appointments found. Schedule one to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appt) => (
                <TableRow key={appt.id} hover>
                  <TableCell>#{appt.id}</TableCell>
                  <TableCell>
                    {appt.appointment_date
                      ? new Date(appt.appointment_date).toLocaleDateString()
                      : appt.appointment_date}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AccessTimeIcon fontSize="small" />
                      {appt.appointment_time}
                    </Box>
                  </TableCell>
                  <TableCell>{appt.purpose}</TableCell>
                  <TableCell>
                    {(() => {
                      const status = (appt.status || "pending").toLowerCase();
                      const config = {
                        pending: { color: "warning", icon: <ClockCircleOutlined /> },
                        scheduled: { color: "processing", icon: <ClockCircleOutlined /> },
                        confirmed: { color: "success", icon: <CheckCircleOutlined /> },
                        in_progress: { color: "processing", icon: <ClockCircleOutlined /> },
                        done: { color: "success", icon: <CheckCircleOutlined /> },
                        cancelled: { color: "error" },
                      };
                      const { color, icon } = config[status] || {};
                      return (
                        <Tag color={color} icon={icon} style={{ textTransform: "uppercase", fontWeight: 600 }}>
                          {(appt.status || "pending").replace("_", " ").toUpperCase()}
                        </Tag>
                      );
                    })()}
                  </TableCell>
                  <TableCell align="center">
                    <Space>
                      {appt.status === "confirmed" || appt.status === "completed" || appt.status === "done" ? (
                        <AntButton
                          size="small"
                          icon={<StarOutlined />}
                          onClick={() => onEvaluate && onEvaluate(appt)}
                        >

                        </AntButton>
                      ) : (
                        <AntButton
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => onEdit && onEdit(appt.id, appt)}
                        >

                        </AntButton>
                      )}
                      <AntButton
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete && onDelete(appt.id)}
                      >

                      </AntButton>
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

export default Appointments;
