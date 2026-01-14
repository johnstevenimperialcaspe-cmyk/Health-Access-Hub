import React, { useState } from "react";
import { Modal, Form, Button, Rate, Input, Switch, message } from "antd";
import {
  HeartOutlined,
} from "@ant-design/icons";
import api from "../utils/axios";

const { TextArea } = Input;

const EvaluationForm = ({ visible, onClose, visitData, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize for responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        appointmentId: visitData?.appointmentId || null,
        healthRecordId: visitData?.healthRecordId || null,
        visitDate: visitData?.visitDate || new Date().toISOString().split("T")[0],
        ratingStaffCourtesy: parseInt(values.ratingStaffCourtesy),
        ratingWaitingTime: parseInt(values.ratingWaitingTime),
        ratingFacilityCleanliness: parseInt(values.ratingFacilityCleanliness),
        ratingServiceQuality: parseInt(values.ratingServiceQuality),
        comments: values.comments || null,
        suggestions: values.suggestions || null,
        wouldRecommend: values.wouldRecommend !== false,
      };

      await api.post("/api/evaluations", payload);
      message.success("Thank you for your feedback!");
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Evaluation submission error:", error);
      message.error(
        error.response?.data?.message || "Failed to submit evaluation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <HeartOutlined style={{ color: "#1890ff" }} />
          Service Evaluation
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "100%" : 650}
      style={isMobile ? { top: 0, paddingBottom: 0, maxWidth: "100vw" } : {}}
      styles={{
        body: isMobile ? {
          padding: "16px 12px",
          maxHeight: "calc(100vh - 110px)",
          overflowY: "auto"
        } : {}
      }}
      destroyOnHidden
      centered={!isMobile}
    >
      <div style={{
        marginBottom: isMobile ? 12 : 16,
        padding: isMobile ? "10px 12px" : "12px 16px",
        background: "#f0f5ff",
        borderRadius: 8
      }}>
        <p style={{ margin: 0, color: "#1890ff", fontSize: isMobile ? 13 : 14 }}>
          <strong>Your feedback helps us improve our service!</strong>
        </p>
        <p style={{ margin: "4px 0 0", fontSize: isMobile ? 11 : 12, color: "#666" }}>
          Please rate your experience on a scale of 1-5 (1 = Poor, 5 = Excellent)
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          ratingStaffCourtesy: 5,
          ratingWaitingTime: 5,
          ratingFacilityCleanliness: 5,
          ratingServiceQuality: 5,
          wouldRecommend: true,
        }}
      >
        {/* Staff Courtesy */}
        <Form.Item
          label={
            <span style={{ fontSize: isMobile ? 13 : 14 }}>
              Staff Courtesy & Professionalism
            </span>
          }
          name="ratingStaffCourtesy"
          rules={[{ required: true, message: "Please rate staff courtesy" }]}
          style={{ marginBottom: isMobile ? 16 : 24 }}
        >
          <Rate style={{ fontSize: isMobile ? 24 : 32 }} />
        </Form.Item>

        {/* Waiting Time */}
        <Form.Item
          label={
            <span style={{ fontSize: isMobile ? 13 : 14 }}>
              Waiting Time
            </span>
          }
          name="ratingWaitingTime"
          rules={[{ required: true, message: "Please rate waiting time" }]}
          style={{ marginBottom: isMobile ? 16 : 24 }}
        >
          <Rate style={{ fontSize: isMobile ? 24 : 32 }} />
        </Form.Item>

        {/* Facility Cleanliness */}
        <Form.Item
          label={
            <span style={{ fontSize: isMobile ? 13 : 14 }}>
              Facility Cleanliness
            </span>
          }
          name="ratingFacilityCleanliness"
          rules={[{ required: true, message: "Please rate facility cleanliness" }]}
          style={{ marginBottom: isMobile ? 16 : 24 }}
        >
          <Rate style={{ fontSize: isMobile ? 24 : 32 }} />
        </Form.Item>

        {/* Service Quality */}
        <Form.Item
          label={
            <span style={{ fontSize: isMobile ? 13 : 14 }}>
              Overall Service Quality
            </span>
          }
          name="ratingServiceQuality"
          rules={[{ required: true, message: "Please rate service quality" }]}
          style={{ marginBottom: isMobile ? 16 : 24 }}
        >
          <Rate style={{ fontSize: isMobile ? 24 : 32 }} />
        </Form.Item>

        {/* Comments */}
        <Form.Item
          label={
            <span style={{ fontSize: isMobile ? 13 : 14 }}>
              Comments (Optional)
            </span>
          }
          name="comments"
          style={{ marginBottom: isMobile ? 16 : 24 }}
        >
          <TextArea
            rows={isMobile ? 2 : 3}
            placeholder="Share your experience with us..."
            maxLength={500}
            showCount
            style={{ fontSize: isMobile ? 13 : 14 }}
          />
        </Form.Item>

        {/* Suggestions */}
        <Form.Item
          label={
            <span style={{ fontSize: isMobile ? 13 : 14 }}>
              Suggestions for Improvement (Optional)
            </span>
          }
          name="suggestions"
          style={{ marginBottom: isMobile ? 16 : 24 }}
        >
          <TextArea
            rows={isMobile ? 2 : 3}
            placeholder="How can we serve you better?"
            maxLength={500}
            showCount
            style={{ fontSize: isMobile ? 13 : 14 }}
          />
        </Form.Item>

        {/* Would Recommend */}
        <Form.Item
          label={
            <span style={{ fontSize: isMobile ? 13 : 14 }}>
              Would you recommend our service to others?
            </span>
          }
          name="wouldRecommend"
          valuePropName="checked"
          style={{ marginBottom: isMobile ? 16 : 24 }}
        >
          <Switch
            checkedChildren="Yes"
            unCheckedChildren="No"
            defaultChecked
          />
        </Form.Item>

        {/* Submit Buttons */}
        <Form.Item style={{ marginBottom: 0, marginTop: isMobile ? 16 : 24 }}>
          <div style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            flexDirection: isMobile ? "column-reverse" : "row"
          }}>
            <Button
              onClick={onClose}
              block={isMobile}
              size={isMobile ? "large" : "middle"}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block={isMobile}
              size={isMobile ? "large" : "middle"}
            >
              Submit Evaluation
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EvaluationForm;
