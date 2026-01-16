import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Rate,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Progress,
  Empty,
  Space,
  Divider,
  List,
  message,
} from "antd";
import {
  StarOutlined,
  SmileOutlined,
  UserOutlined,
  TrophyOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import api from "../../utils/axios";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

const Evaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [filters, setFilters] = useState({
    patientType: null,
    dateRange: [moment().subtract(30, "days"), moment()],
    minRating: null,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        patientType: filters.patientType,
        startDate: filters.dateRange?.[0]?.format("YYYY-MM-DD"),
        endDate: filters.dateRange?.[1]?.format("YYYY-MM-DD"),
        minRating: filters.minRating,
        limit: 100,
      };

      const [evaluationsRes, statsRes] = await Promise.all([
        api.get("/api/evaluations", { params }),
        api.get("/api/evaluations/stats", {
          params: { period: "month" },
        }),
      ]);

      setEvaluations(evaluationsRes.data.evaluations || []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error("Failed to fetch evaluations:", error);
      message.error("Failed to load evaluations");
    } finally {
      setLoading(false);
    }
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
        };
        return <Tag color={colors[type]}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Appointment ID",
      dataIndex: "appointment_id",
      key: "appointment_id",
      render: (id) => id ? `#${id}` : <span style={{ color: "#999" }}>-</span>,
    },
    {
      title: "Visit Date",
      dataIndex: "visit_date",
      key: "visit_date",
      render: (date) => moment(date).format("MMM DD, YYYY"),
    },
    {
      title: "Overall Rating",
      dataIndex: "rating_overall",
      key: "rating_overall",
      render: (rating) => (
        <div>
          <Rate disabled value={parseFloat(rating)} allowHalf />
          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            {parseFloat(rating).toFixed(2)} / 5.00
          </div>
        </div>
      ),
      sorter: (a, b) => parseFloat(a.rating_overall) - parseFloat(b.rating_overall),
    },
    {
      title: "Staff",
      dataIndex: "rating_staff_courtesy",
      key: "staff",
      render: (rating) => <Rate disabled value={rating} />,
    },
    {
      title: "Waiting",
      dataIndex: "rating_waiting_time",
      key: "waiting",
      render: (rating) => <Rate disabled value={rating} />,
    },
    {
      title: "Cleanliness",
      dataIndex: "rating_facility_cleanliness",
      key: "cleanliness",
      render: (rating) => <Rate disabled value={rating} />,
    },
    {
      title: "Service",
      dataIndex: "rating_service_quality",
      key: "service",
      render: (rating) => <Rate disabled value={rating} />,
    },
    {
      title: "Recommend",
      dataIndex: "would_recommend",
      key: "recommend",
      render: (recommend) =>
        recommend ? (
          <Tag color="success">Yes</Tag>
        ) : (
          <Tag color="error">No</Tag>
        ),
    },
    {
      title: "Submitted",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (date) => moment(date).format("MMM DD, YYYY HH:mm"),
    },
  ];

  const expandedRowRender = (record) => (
    <div style={{ padding: "16px 24px", background: "#fafafa" }}>
      <Row gutter={16}>
        <Col span={12}>
          <h4>Comments</h4>
          <p style={{ fontSize: 14 }}>
            {record.comments || <span style={{ color: "#999" }}>No comments</span>}
          </p>
        </Col>
        <Col span={12}>
          <h4>Suggestions</h4>
          <p style={{ fontSize: 14 }}>
            {record.suggestions || <span style={{ color: "#999" }}>No suggestions</span>}
          </p>
        </Col>
      </Row>
    </div>
  );

  const overallStats = stats.overall || {};
  const byPatientType = stats.byPatientType || [];
  const recentComments = stats.recentComments || [];

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
      {/* Statistics Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title={<span style={{ fontSize: isMobile ? 11 : 14 }}>Total Evaluations</span>}
              value={overallStats.total_evaluations || 0}
              prefix={<StarOutlined style={{ fontSize: isMobile ? 16 : 20 }} />}
              valueStyle={{ fontSize: isMobile ? 18 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title={<span style={{ fontSize: isMobile ? 11 : 14 }}>Average Rating</span>}
              value={parseFloat(overallStats.avg_rating || 0).toFixed(2)}
              suffix="/ 5.00"
              valueStyle={{ color: "#1890ff", fontSize: isMobile ? 18 : 24 }}
              prefix={<SmileOutlined style={{ fontSize: isMobile ? 16 : 20 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title={<span style={{ fontSize: isMobile ? 11 : 14 }}>Would Recommend</span>}
              value={
                overallStats.total_evaluations
                  ? Math.round(
                      (overallStats.would_recommend_count /
                        overallStats.total_evaluations) *
                        100
                    )
                  : 0
              }
              suffix="%"
              valueStyle={{ color: "#52c41a", fontSize: isMobile ? 18 : 24 }}
              prefix={<TrophyOutlined style={{ fontSize: isMobile ? 16 : 20 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? 11 : 14, color: "#666", marginBottom: 8 }}>
                Service Quality
              </div>
              <Progress
                type="circle"
                percent={Math.round(
                  (parseFloat(overallStats.avg_service_quality || 0) / 5) * 100
                )}
                width={isMobile ? 60 : 80}
                format={() =>
                  parseFloat(overallStats.avg_service_quality || 0).toFixed(1)
                }
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Rating Breakdown by Category */}
      <Row gutter={16} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col span={24}>
          <Card title={<span style={{ fontSize: isMobile ? 14 : 16 }}>Rating Breakdown by Category</span>}>
            <Row gutter={[16, 16]}>
              {[
                { label: "Staff Courtesy", key: "avg_staff_courtesy", color: "#52c41a" },
                { label: "Waiting Time", key: "avg_waiting_time", color: "#1890ff" },
                { label: "Facility Cleanliness", key: "avg_facility_cleanliness", color: "#fa8c16" },
                { label: "Service Quality", key: "avg_service_quality", color: "#eb2f96" },
              ].map((item) => (
                <Col xs={12} sm={12} md={6} key={item.key}>
                  <div style={{ textAlign: "center" }}>
                    <h4 style={{ fontSize: isMobile ? 12 : 14 }}>{item.label}</h4>
                    <Progress
                      percent={Math.round(
                        (parseFloat(overallStats[item.key] || 0) / 5) * 100
                      )}
                      strokeColor={item.color}
                      size={isMobile ? "small" : "default"}
                    />
                    <div style={{ marginTop: 8, fontSize: isMobile ? 14 : 16, fontWeight: 600 }}>
                      {parseFloat(overallStats[item.key] || 0).toFixed(2)} / 5.00
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* By Patient Type */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Ratings by Patient Type">
            <List
              dataSource={byPatientType}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <Tag color={item.patient_type === 'student' ? 'blue' : item.patient_type === 'faculty' ? 'green' : 'orange'}>
                        {item.patient_type.toUpperCase()}
                      </Tag>
                      <span>
                        <Rate disabled value={parseFloat(item.avg_rating)} allowHalf style={{ fontSize: 14 }} />
                        <span style={{ marginLeft: 8 }}>{parseFloat(item.avg_rating).toFixed(2)}</span>
                      </span>
                    </div>
                    <Progress
                      percent={Math.round((parseFloat(item.avg_rating) / 5) * 100)}
                      showInfo={false}
                    />
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      {item.total} evaluations • {item.would_recommend_count} would recommend
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<Space><CommentOutlined /> Recent Comments</Space>}>
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              <List
                dataSource={recentComments}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>{item.first_name} {item.last_name}</span>
                          <Rate disabled value={parseFloat(item.rating_overall)} allowHalf style={{ fontSize: 12 }} />
                        </Space>
                      }
                      description={
                        <div>
                          {item.comments && (
                            <div style={{ marginBottom: 4 }}>
                              <strong>Comment:</strong> {item.comments}
                            </div>
                          )}
                          {item.suggestions && (
                            <div>
                              <strong>Suggestion:</strong> {item.suggestions}
                            </div>
                          )}
                          <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                            {moment(item.visit_date).format("MMM DD, YYYY")}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Filters */}
      <Card 
        style={{ marginBottom: isMobile ? 16 : 24 }}
        title={<span style={{ fontSize: isMobile ? 14 : 16 }}>Filters</span>}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by Patient Type"
              style={{ width: "100%" }}
              allowClear
              value={filters.patientType}
              onChange={(value) => setFilters({ ...filters, patientType: value })}
              size={isMobile ? "middle" : "large"}
            >
              <Option value="student">Student</Option>
              <Option value="faculty">Faculty</Option>
              <Option value="non_academic">Non-Academic</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: "100%" }}
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              format="YYYY-MM-DD"
              size={isMobile ? "middle" : "large"}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Minimum Rating"
              style={{ width: "100%" }}
              allowClear
              value={filters.minRating}
              onChange={(value) => setFilters({ ...filters, minRating: value })}
              size={isMobile ? "middle" : "large"}
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <Option key={rating} value={rating}>
                  {rating} Stars & Above
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Evaluations Table */}
      <Card 
        title={<span style={{ fontSize: isMobile ? 14 : 16 }}>All Evaluations</span>}
      >
        <Table
          columns={columns}
          dataSource={evaluations}
          rowKey="id"
          loading={loading}
          expandable={{ expandedRowRender }}
          pagination={{
            pageSize: isMobile ? 5 : 10,
            showSizeChanger: !isMobile,
            responsive: true,
          }}
          scroll={{ x: isMobile ? 800 : 'auto' }}
          size={isMobile ? "small" : "middle"}
        />
      </Card>
    </div>
  );
};

export default Evaluations;
