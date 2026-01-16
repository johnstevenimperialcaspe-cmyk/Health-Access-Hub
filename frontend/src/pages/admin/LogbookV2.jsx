import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  message,
  Statistic,
  Row,
  Col,
  Empty,
} from "antd";
import {
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import api from "../../utils/axios";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

const LogbookV2 = () => {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [checkOutModalVisible, setCheckOutModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [form] = Form.useForm();
  const [checkOutForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entriesRes, statsRes] = await Promise.all([
        api.get("/api/logbook-v2", {
          params: {
            startDate: moment().subtract(7, "days").format("YYYY-MM-DD"),
            page: 1,
            limit: 100,
          },
        }),
        api.get("/api/logbook-v2/stats"),
      ]);

      setEntries(entriesRes.data.entries || []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error("Failed to fetch logbook data:", error);
      message.error("Failed to load logbook");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users");
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleCheckIn = async (values) => {
    try {
      await api.post("/api/logbook-v2/check-in", {
        patientId: values.patientId,
        patientType: values.patientType,
        visitDate: values.visitDate.format("YYYY-MM-DD"),
        checkInTime: values.checkInTime.format("HH:mm:ss"),
        purpose: values.purpose,
        notes: values.notes,
      });

      message.success("Patient checked in successfully");
      setCheckInModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error("Check-in error:", error);
      message.error(error.response?.data?.message || "Failed to check in patient");
    }
  };

  const handleCheckOut = async (values) => {
    try {
      await api.post(`/api/logbook-v2/check-out/${selectedEntry.id}`, {
        checkOutTime: values.checkOutTime.format("HH:mm:ss"),
        notes: values.notes,
      });

      message.success("Patient checked out successfully");
      setCheckOutModalVisible(false);
      setSelectedEntry(null);
      checkOutForm.resetFields();
      fetchData();
    } catch (error) {
      console.error("Check-out error:", error);
      message.error(error.response?.data?.message || "Failed to check out patient");
    }
  };

  const openCheckOutModal = (entry) => {
    setSelectedEntry(entry);
    checkOutForm.setFieldsValue({
      checkOutTime: moment(),
    });
    setCheckOutModalVisible(true);
  };

  const openEditModal = (entry) => {
    setSelectedEntry(entry);
    editForm.setFieldsValue({
      purpose: entry.purpose,
      notes: entry.notes,
      visitDate: moment(entry.visit_date),
      checkInTime: moment(entry.check_in_time, "HH:mm:ss"),
    });
    setEditModalVisible(true);
  };

  const handleEdit = async (values) => {
    try {
      await api.put(`/api/logbook-v2/${selectedEntry.id}`, {
        purpose: values.purpose,
        notes: values.notes,
        visitDate: values.visitDate.format("YYYY-MM-DD"),
        checkInTime: values.checkInTime.format("HH:mm:ss"),
      });

      message.success("Entry updated successfully");
      setEditModalVisible(false);
      setSelectedEntry(null);
      editForm.resetFields();
      fetchData();
    } catch (error) {
      console.error("Edit error:", error);
      message.error(error.response?.data?.message || "Failed to update entry");
    }
  };

  const handleDelete = (entry) => {
    Modal.confirm({
      title: "Delete Entry",
      content: `Are you sure you want to delete this logbook entry for ${entry.first_name} ${entry.last_name}?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/api/logbook-v2/${entry.id}`);
          message.success("Entry deleted successfully");
          fetchData();
        } catch (error) {
          console.error("Delete error:", error);
          message.error(error.response?.data?.message || "Failed to delete entry");
        }
      },
    });
  };

  const columns = [
    {
      title: "Patient",
      key: "patient",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.first_name} {record.middle_name} {record.last_name}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.student_id || record.employee_id}
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "patient_type",
      key: "patient_type",
      render: (type) => {
        const colors = {
          student: "blue",
          faculty: "green",
          non_academic: "orange",
          admin: "purple",
        };
        return <Tag color={colors[type]}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Visit Date",
      dataIndex: "visit_date",
      key: "visit_date",
      render: (date) => moment(date).format("MMM DD, YYYY"),
    },
    {
      title: "Check-in",
      dataIndex: "check_in_time",
      key: "check_in_time",
      render: (time) => moment(time, "HH:mm:ss").format("hh:mm A"),
    },
    {
      title: "Check-out",
      dataIndex: "check_out_time",
      key: "check_out_time",
      render: (time) =>
        time ? (
          moment(time, "HH:mm:ss").format("hh:mm A")
        ) : (
          <Tag icon={<ClockCircleOutlined />} color="processing">
            In Progress
          </Tag>
        ),
    },
    {
      title: "Purpose",
      dataIndex: "purpose",
      key: "purpose",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (text) => {
        if (!text) return <span style={{ color: "#999" }}>-</span>;
        return (
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedNotes(text);
              setNotesModalVisible(true);
            }}
          >
            View Notes
          </Button>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      
      render: (status) => {
        const config = {
          checked_in: { color: "blue", icon: <ClockCircleOutlined /> },
          in_progress: { color: "orange", icon: <ClockCircleOutlined /> },
          completed: { color: "green", icon: <CheckCircleOutlined /> },
          cancelled: { color: "red" },
        };
        const { color, icon } = config[status] || {};
        return (
          <Tag color={color} icon={icon}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Acknowledged",
      dataIndex: "patient_acknowledged_at",
      key: "acknowledged",
      render: (acknowledged) =>
        acknowledged ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Yes
          </Tag>
        ) : (
          <Tag color="warning">Pending</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.status !== "completed" && record.status !== "cancelled" && (
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => openCheckOutModal(record)}
            >
              Check Out
            </Button>
          )}
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px 8px" }}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <Card styles={{ body: { padding: "16px 12px" } }}>
            <Statistic
              title="Total Today"
              value={stats.today?.total_today || 0}
              prefix={<UserOutlined />}
              valueStyle={{ fontSize: "20px" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card styles={{ body: { padding: "16px 12px" } }}>
            <Statistic
              title="Currently In"
              value={stats.today?.currently_in || 0}
              valueStyle={{ color: "#1890ff", fontSize: "20px" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card styles={{ body: { padding: "16px 12px" } }}>
            <Statistic
              title="Completed Today"
              value={stats.today?.completed_today || 0}
              valueStyle={{ color: "#52c41a", fontSize: "20px" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card styles={{ body: { padding: "16px 12px" } }}>
            <Statistic
              title="Acknowledged"
              value={stats.today?.acknowledged_today || 0}
              valueStyle={{ color: "#52c41a", fontSize: "20px" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title={<span style={{ fontSize: "16px" }}>Logbook Entries (Last 7 Days)</span>}
        styles={{ body: { padding: "12px", overflowX: "auto" } }}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCheckInModalVisible(true)}
            size="small"
          >
            Check In
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={entries}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: <Empty description="No logbook entries found" />,
          }}
        />
      </Card>

      {/* Check-In Modal */}
      <Modal
        title="Check In Patient"
        open={checkInModalVisible}
        onCancel={() => {
          setCheckInModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCheckIn}
          initialValues={{
            visitDate: moment(),
            checkInTime: moment(),
          }}
        >
          <Form.Item
            label="Patient"
            name="patientId"
            rules={[{ required: true, message: "Please select a patient" }]}
          >
            <Select
              showSearch
              placeholder="Select patient"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.student_id || user.employee_id}) - {user.role}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Patient Type"
            name="patientType"
            rules={[{ required: true, message: "Please select patient type" }]}
          >
            <Select placeholder="Select type">
              <Option value="student">Student</Option>
              <Option value="faculty">Faculty</Option>
              <Option value="non_academic">Non-Academic</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Visit Date"
                name="visitDate"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Check-in Time"
                name="checkInTime"
                rules={[{ required: true, message: "Please select time" }]}
              >
                <TimePicker style={{ width: "100%" }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Purpose"
            name="purpose"
            rules={[{ required: true, message: "Please enter purpose" }]}
          >
            <Select placeholder="Select purpose">
              <Option value="Pre-Enrollment">Pre-Enrollment</Option>
              <Option value="Medical Consultation">Medical Consultation</Option>
              <Option value="Follow Up">Follow Up</Option>
              <Option value="Emergency">Emergency</Option>
              <Option value="Physical Examination">Physical Examination</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <TextArea rows={3} placeholder="Additional notes..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setCheckInModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Check In
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Check-Out Modal */}
      <Modal
        title="Check Out Patient"
        open={checkOutModalVisible}
        onCancel={() => {
          setCheckOutModalVisible(false);
          setSelectedEntry(null);
          checkOutForm.resetFields();
        }}
        footer={null}
      >
        <Form form={checkOutForm} layout="vertical" onFinish={handleCheckOut}>
          <Form.Item
            label="Check-out Time"
            name="checkOutTime"
            rules={[{ required: true, message: "Please select time" }]}
          >
            <TimePicker style={{ width: "100%" }} format="HH:mm" />
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <TextArea rows={3} placeholder="Additional notes..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setCheckOutModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Check Out
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Logbook Entry"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedEntry(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Visit Date"
                name="visitDate"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Check-in Time"
                name="checkInTime"
                rules={[{ required: true, message: "Please select time" }]}
              >
                <TimePicker style={{ width: "100%" }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Purpose"
            name="purpose"
            rules={[{ required: true, message: "Please enter purpose" }]}
          >
            <Select placeholder="Select purpose">
              <Option value="Pre-Enrollment">Pre-Enrollment</Option>
              <Option value="Medical Consultation">Medical Consultation</Option>
              <Option value="Follow Up">Follow Up</Option>
              <Option value="Emergency">Emergency</Option>
              <Option value="Physical Examination">Physical Examination</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <TextArea rows={3} placeholder="Additional notes..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Notes View Modal */}
      <Modal
        title="Notes"
        open={notesModalVisible}
        onCancel={() => setNotesModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setNotesModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{selectedNotes}</p>
      </Modal>
    </div>
  );
};

export default LogbookV2;
