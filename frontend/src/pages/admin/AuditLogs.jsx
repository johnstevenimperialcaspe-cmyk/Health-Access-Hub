import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Space,
  Empty,
  message,
  Timeline,
  Badge,
  Tabs,
} from "antd";
import {
  AuditOutlined,
  UserOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import api from "../../utils/axios";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    userRole: null,
    action: null,
    targetModel: null,
    dateRange: [moment().subtract(7, "days"), moment()],
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        userRole: filters.userRole,
        action: filters.action,
        targetModel: filters.targetModel,
        startDate: filters.dateRange?.[0]?.format("YYYY-MM-DD"),
        endDate: filters.dateRange?.[1]?.format("YYYY-MM-DD"),
        limit: 200,
      };

      const [logsRes, statsRes] = await Promise.all([
        api.get("/api/audit-logs", { params }),
        api.get("/api/audit-logs/stats", {
          params: { period: "week" },
        }),
      ]);

      setLogs(logsRes.data.logs || []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      message.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      CREATE: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      UPDATE: <EditOutlined style={{ color: "#1890ff" }} />,
      DELETE: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
      VIEW: <EyeOutlined style={{ color: "#722ed1" }} />,
      LOGIN: <UserOutlined style={{ color: "#13c2c2" }} />,
      LOGOUT: <UserOutlined style={{ color: "#999" }} />,
    };
    return icons[action] || <AuditOutlined />;
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: "success",
      UPDATE: "processing",
      DELETE: "error",
      VIEW: "purple",
      LOGIN: "cyan",
      LOGOUT: "default",
    };
    return colors[action] || "default";
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "red",
      student: "blue",
      faculty: "green",
      non_academic: "orange",
    };
    return colors[role] || "default";
  };

  const columns = [
    {
      title: "Time",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date) => (
        <div>
          <div>{moment(date).format("MMM DD, YYYY")}</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {moment(date).format("HH:mm:ss")}
          </div>
        </div>
      ),
      sorter: (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "User",
      key: "user",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.first_name} {record.last_name}
          </div>
          <div style={{ fontSize: 12 }}>
            <Tag color={getRoleColor(record.role)} style={{ marginRight: 4 }}>
              {record.role?.toUpperCase()}
            </Tag>
            {record.student_id || record.employee_id}
          </div>
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (action) => (
        <Tag icon={getActionIcon(action)} color={getActionColor(action)}>
          {action}
        </Tag>
      ),
    },
    {
      title: "Target",
      dataIndex: "target_model",
      key: "target_model",
      width: 150,
      render: (model) => (
        <Tag color="blue">{model}</Tag>
      ),
    },
    {
      title: "Summary",
      dataIndex: "summary",
      key: "summary",
      width: 300,
      ellipsis: true,
      render: (summary) => (
        <span style={{ fontSize: 13 }}>{summary || "—"}</span>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip_address",
      width: 140,
      render: (ip) => (
        <code style={{ fontSize: 12, background: "#f5f5f5", padding: "2px 6px", borderRadius: 3 }}>
          {ip || "—"}
        </code>
      ),
    },
  ];

  const byAction = stats.byAction || [];
  const byRole = stats.byRole || [];
  const topUsers = stats.topUsers || [];
  const dailyActivity = stats.dailyActivity || [];

  return (
    <div style={{ padding: 24 }}>
      {/* Statistics Overview */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Actions (7 Days)"
              value={logs.length}
              prefix={<AuditOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={topUsers.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Activity"
              value={
                dailyActivity.find(
                  (d) => d.date === moment().format("YYYY-MM-DD")
                )?.total_actions || 0
              }
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Daily Actions"
              value={
                dailyActivity.length
                  ? Math.round(
                      dailyActivity.reduce((sum, d) => sum + d.total_actions, 0) /
                        dailyActivity.length
                    )
                  : 0
              }
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs for different views */}
      <Card>
        <Tabs defaultActiveKey="logs">
          <TabPane
            tab={
              <span>
                <AuditOutlined />
                Activity Logs
              </span>
            }
            key="logs"
          >
            {/* Filters */}
            <Card style={{ marginBottom: 16, background: "#fafafa" }}>
              <Space size="large" wrap>
                <div>
                  <label style={{ marginRight: 8 }}>User Role:</label>
                  <Select
                    style={{ width: 150 }}
                    placeholder="All roles"
                    allowClear
                    value={filters.userRole}
                    onChange={(value) => setFilters({ ...filters, userRole: value })}
                  >
                    <Option value="admin">Admin</Option>
                    <Option value="student">Student</Option>
                    <Option value="faculty">Faculty</Option>
                    <Option value="non_academic">Non-Academic</Option>
                  </Select>
                </div>

                <div>
                  <label style={{ marginRight: 8 }}>Action:</label>
                  <Select
                    style={{ width: 150 }}
                    placeholder="All actions"
                    allowClear
                    value={filters.action}
                    onChange={(value) => setFilters({ ...filters, action: value })}
                  >
                    <Option value="CREATE">Create</Option>
                    <Option value="UPDATE">Update</Option>
                    <Option value="DELETE">Delete</Option>
                    <Option value="VIEW">View</Option>
                    <Option value="LOGIN">Login</Option>
                    <Option value="LOGOUT">Logout</Option>
                  </Select>
                </div>

                <div>
                  <label style={{ marginRight: 8 }}>Target:</label>
                  <Select
                    style={{ width: 180 }}
                    placeholder="All models"
                    allowClear
                    value={filters.targetModel}
                    onChange={(value) => setFilters({ ...filters, targetModel: value })}
                  >
                    <Option value="User">User</Option>
                    <Option value="Appointment">Appointment</Option>
                    <Option value="HealthRecord">Health Record</Option>
                    <Option value="Examination">Examination</Option>
                    <Option value="LogbookEntry">Logbook Entry</Option>
                    <Option value="ServiceEvaluation">Service Evaluation</Option>
                  </Select>
                </div>

                <div>
                  <label style={{ marginRight: 8 }}>Date Range:</label>
                  <RangePicker
                    value={filters.dateRange}
                    onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                    presets={[
                      { label: "Today", value: [moment(), moment()] },
                      { label: "Last 7 Days", value: [moment().subtract(7, "days"), moment()] },
                      { label: "Last 30 Days", value: [moment().subtract(30, "days"), moment()] },
                    ]}
                  />
                </div>
              </Space>
            </Card>

            {/* Logs Table */}
            <Table
              columns={columns}
              dataSource={logs}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 50 }}
              locale={{
                emptyText: <Empty description="No activity logs found" />,
              }}
              scroll={{ x: 1000 }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                Statistics
              </span>
            }
            key="stats"
          >
            <Row gutter={16}>
              {/* Actions Breakdown */}
              <Col span={8}>
                <Card title="Actions Breakdown" style={{ height: 400 }}>
                  <Timeline>
                    {byAction.map((item, index) => (
                      <Timeline.Item
                        key={index}
                        dot={getActionIcon(item.action)}
                        color={getActionColor(item.action)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>{item.action}</span>
                          <Badge count={item.count} style={{ backgroundColor: "#52c41a" }} />
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>

              {/* By User Role */}
              <Col span={8}>
                <Card title="Activity by Role" style={{ height: 400 }}>
                  <Timeline>
                    {byRole.map((item, index) => (
                      <Timeline.Item
                        key={index}
                        dot={<UserOutlined />}
                        color={getRoleColor(item.user_role)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Tag color={getRoleColor(item.user_role)}>
                            {item.user_role?.toUpperCase() || "UNKNOWN"}
                          </Tag>
                          <Badge count={item.count} style={{ backgroundColor: "#1890ff" }} />
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>

              {/* Top Active Users */}
              <Col span={8}>
                <Card title="Most Active Users" style={{ height: 400 }}>
                  <Timeline>
                    {topUsers.slice(0, 10).map((user, index) => (
                      <Timeline.Item
                        key={index}
                        color={index < 3 ? "red" : "blue"}
                      >
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {user.first_name} {user.last_name}
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            <Tag color={getRoleColor(user.role)} size="small">
                              {user.role?.toUpperCase()}
                            </Tag>
                            <Badge
                              count={user.action_count}
                              style={{ backgroundColor: "#722ed1", marginLeft: 8 }}
                            />
                          </div>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuditLogs;
