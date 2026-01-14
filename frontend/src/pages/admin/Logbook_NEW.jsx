import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  message,
  Space,
  Tag,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import api from "../../utils/axios";
import moment from "moment";

const { Option } = Select;

const roles = [
  { value: "student", label: "Student", color: "blue" },
  { value: "faculty", label: "Faculty", color: "green" },
  { value: "non_academic", label: "Non-Academic", color: "orange" },
];

const Logbook = () => {
  const [form] = Form.useForm();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadVisits = async () => {
    try {
      const res = await api.get("/api/logbook");
      setVisits(res.data.visits || []);
    } catch (e) {
      console.error(e);
      message.error("Failed to load logbook entries");
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        idValue: values.idValue.trim(),
        role: values.role,
        date: values.date.format("YYYY-MM-DD"),
        time: values.time.format("HH:mm"),
        purpose: values.purpose.trim(),
        name: values.name?.trim() || null,
      };
      await api.post("/api/logbook", payload);
      message.success("Visit recorded successfully");
      form.resetFields();
      // Reset to default values
      form.setFieldsValue({
        date: moment(),
        time: moment(),
        role: "student",
      });
      await loadVisits();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to record visit";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date_of_visit",
      key: "date",
      render: (date) => moment(date).format("MMM DD, YYYY"),
    },
    {
      title: "Time",
      key: "time",
      render: (_, record) => record.notes?.time || "N/A",
    },
    {
      title: "ID",
      key: "id",
      render: (_, record) => record.student_id || record.employee_id || "N/A",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const roleConfig = roles.find((r) => r.value === role) || {};
        return (
          <Tag color={roleConfig.color || "default"}>
            {roleConfig.label || role?.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) =>
        `${record.first_name || ""} ${record.middle_name || ""} ${
          record.last_name || ""
        }`.trim() || "N/A",
    },
    {
      title: "Purpose",
      dataIndex: "chief_complaint",
      key: "purpose",
      render: (purpose) => purpose || "N/A",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ marginBottom: "24px" }}>
        <CalendarOutlined style={{ marginRight: "8px" }} />
        Logbook - Clinic Visits
      </h2>

      <Card style={{ marginBottom: "24px" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            date: moment(),
            time: moment(),
            role: "student",
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Date"
                name="date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  placeholder="Select date"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Time"
                name="time"
                rules={[{ required: true, message: "Please select time" }]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  placeholder="Select time"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Student ID / Employee ID"
                name="idValue"
                rules={[{ required: true, message: "Please enter ID" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter ID"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select placeholder="Select role">
                  {roles.map((r) => (
                    <Option key={r.value} value={r.value}>
                      {r.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Name" name="name">
                <Input placeholder="Enter name (optional)" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Purpose"
                name="purpose"
                rules={[{ required: true, message: "Please enter purpose" }]}
              >
                <Input placeholder="Enter purpose of visit" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<PlusOutlined />}
                    size="large"
                  >
                    Record Visit
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="Recent Visits">
        <Table
          columns={columns}
          dataSource={visits}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} visits`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default Logbook;
