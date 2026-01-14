import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Space, message, Empty, Rate, Modal } from "antd";
import { HistoryOutlined, StarOutlined, CheckCircleOutlined, EyeOutlined } from "@ant-design/icons";
import api from "../../utils/axios";
import EvaluationForm from "../../components/EvaluationForm";

const VisitHistory = () => {
  const [visits, setVisits] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [pendingAcknowledgments, setPendingAcknowledgments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedComments, setSelectedComments] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [visitsRes, evaluationsRes, pendingRes] = await Promise.all([
        api.get("/api/logbook-v2/my-visits"),
        api.get("/api/evaluations/my-evaluations"),
        api.get("/api/logbook-v2/pending-acknowledgments"),
      ]);

      setVisits(visitsRes.data.entries || []);
      setEvaluations(evaluationsRes.data.evaluations || []);
      setPendingAcknowledgments(pendingRes.data.pendingEntries || []);
    } catch (error) {
      console.error("Failed to fetch visit history:", error);
      message.error("Failed to load visit history");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (visitId) => {
    try {
      await api.post(`/api/logbook-v2/acknowledge/${visitId}`, {
        signature: "Acknowledged via web portal",
      });
      message.success("Visit acknowledged successfully");
      fetchData();
    } catch (error) {
      console.error("Acknowledgment error:", error);
      message.error(error.response?.data?.message || "Failed to acknowledge visit");
    }
  };

  const openEvaluationForm = (visit) => {
    setSelectedVisit({
      visitDate: visit.visit_date,
      appointmentId: visit.appointment_id,
    });
    setEvaluationModalVisible(true);
  };

  const visitColumns = [
    {
      title: "Visit Date",
      dataIndex: "visit_date",
      key: "visit_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Check-in Time",
      dataIndex: "check_in_time",
      key: "check_in_time",
    },
    {
      title: "Check-out Time",
      dataIndex: "check_out_time",
      key: "check_out_time",
      render: (time) => time || <Tag color="processing">In Progress</Tag>,
    },
    {
      title: "Purpose",
      dataIndex: "purpose",
      key: "purpose",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          checked_in: "blue",
          in_progress: "orange",
          completed: "green",
          cancelled: "red",
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
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
          {!record.patient_acknowledged_at && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleAcknowledge(record.id)}
            >
              Acknowledge
            </Button>
          )}
          {record.status === "completed" && (
            <Button
              size="small"
              icon={<StarOutlined />}
              onClick={() => openEvaluationForm(record)}
            >
              Rate
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const evaluationColumns = [
    {
      title: "Visit Date",
      dataIndex: "visit_date",
      key: "visit_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Overall Rating",
      dataIndex: "rating_overall",
      key: "rating_overall",
      render: (rating) => (
        <div>
          <Rate disabled value={parseFloat(rating)} allowHalf />
          <span style={{ marginLeft: 8 }}>{parseFloat(rating).toFixed(2)}</span>
        </div>
      ),
    },
    {
      title: "Staff Courtesy",
      dataIndex: "rating_staff_courtesy",
      key: "rating_staff_courtesy",
      render: (rating) => <Rate disabled value={rating} />,
    },
    {
      title: "Waiting Time",
      dataIndex: "rating_waiting_time",
      key: "rating_waiting_time",
      render: (rating) => <Rate disabled value={rating} />,
    },
    {
      title: "Comments",
      dataIndex: "comments",
      key: "comments",
      render: (text) => {
        if (!text) return <span style={{ color: "#999" }}>No comments</span>;
        return (
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedComments(text);
              setCommentsModalVisible(true);
            }}
          >
            View Comments
          </Button>
        );
      },
    },
    {
      title: "Submitted",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: "16px 8px" }}>
      {/* Pending Acknowledgments Alert */}
      {pendingAcknowledgments.length > 0 && (
        <Card
          style={{ 
            marginBottom: 16, 
            background: "#fff7e6", 
            borderColor: "#ffa940" 
          }}
          styles={{ body: { padding: "12px" } }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <h3 style={{ margin: 0, color: "#fa8c16", fontSize: "14px" }}>
              ⚠️ You have {pendingAcknowledgments.length} pending visit(s) to acknowledge
            </h3>
            <p style={{ margin: 0, fontSize: "12px" }}>
              Please acknowledge your recent visits to confirm your attendance.
            </p>
          </Space>
        </Card>
      )}

      {/* Visit History */}
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span style={{ fontSize: "16px" }}>Visit History</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: "12px", overflowX: "auto" }}
      >
        <Table
          columns={visitColumns}
          dataSource={visits}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <Empty description="No visit history found" />
            ),
          }}
        />
      </Card>

      {/* My Evaluations */}
      <Card
        title={
          <Space>
            <StarOutlined />
            <span style={{ fontSize: "16px" }}>My Service Evaluations</span>
          </Space>
        }
        styles={{ body: { padding: "12px", overflowX: "auto" } }}
      >
        <Table
          columns={evaluationColumns}
          dataSource={evaluations}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <Empty description="You haven't submitted any evaluations yet" />
            ),
          }}
        />
      </Card>

      {/* Evaluation Form Modal */}
      <EvaluationForm
        visible={evaluationModalVisible}
        onClose={() => {
          setEvaluationModalVisible(false);
          setSelectedVisit(null);
        }}
        visitData={selectedVisit}
        onSuccess={fetchData}
      />

      {/* Comments View Modal */}
      <Modal
        title="Comments"
        open={commentsModalVisible}
        onCancel={() => setCommentsModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setCommentsModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{selectedComments}</p>
      </Modal>
    </div>
  );
};

export default VisitHistory;
