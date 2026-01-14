import React, { useState } from "react";
import { Modal, Form, Button, Radio, Checkbox, Input, message } from "antd";
import { MedicineBoxOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const PreAppointmentAssessment = ({ visible, onClose, onComplete }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const determinePurpose = (values) => {
    const { visitReason, hasPreviousVisit } = values;

    if (visitReason === "follow-up" || hasPreviousVisit === "yes") {
      return "Follow Up";
    } else if (visitReason === "medical-certificate") {
      return "Medical Certificate Request";
    } else if (visitReason === "pre-employment") {
      return "Pre-Employment";
    } else if (visitReason === "pre-enrollment") {
      return "Pre-Enrollment";
    } else {
      return "Consultation";
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const suggestedPurpose = determinePurpose(values);
      
      onComplete({
        purpose: suggestedPurpose,
        assessmentData: values,
      });

      form.resetFields();
      onClose();
      message.success(`Assessment complete! Purpose: ${suggestedPurpose}`);
    } catch (error) {
      console.error("Assessment error:", error);
      message.error("Failed to complete assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MedicineBoxOutlined style={{ color: "#52c41a" }} />
          Pre-Appointment Health Assessment
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "100%" : 700}
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
        background: "#f6ffed", 
        borderRadius: 8,
        border: "1px solid #b7eb8f"
      }}>
        <p style={{ margin: 0, color: "#52c41a", fontSize: isMobile ? 13 : 14 }}>
          <strong>Help us serve you better!</strong>
        </p>
        <p style={{ margin: "4px 0 0", fontSize: isMobile ? 11 : 12, color: "#666" }}>
          Answer a few questions to determine the best service for your needs.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          hasPreviousVisit: "no",
        }}
      >
        <Form.Item
          label={
            <span style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600 }}>
              What is the main reason for your visit?
            </span>
          }
          name="visitReason"
          rules={[{ required: true, message: "Please select a reason" }]}
          style={{ marginBottom: isMobile ? 16 : 20 }}
        >
          <Radio.Group style={{ width: "100%" }}>
            <Radio value="consultation" style={{ display: "block", marginBottom: 8, fontSize: isMobile ? 13 : 14 }}>
              General Consultation (feeling sick, health concerns)
            </Radio>
            <Radio value="follow-up" style={{ display: "block", marginBottom: 8, fontSize: isMobile ? 13 : 14 }}>
              Follow-up Visit (previous appointment/treatment)
            </Radio>
            <Radio value="medical-certificate" style={{ display: "block", marginBottom: 8, fontSize: isMobile ? 13 : 14 }}>
              Medical Certificate Request
            </Radio>
            <Radio value="pre-enrollment" style={{ display: "block", marginBottom: 8, fontSize: isMobile ? 13 : 14 }}>
              Pre-Enrollment Medical Examination
            </Radio>
            <Radio value="pre-employment" style={{ display: "block", marginBottom: 0, fontSize: isMobile ? 13 : 14 }}>
              Pre-Employment Medical Examination
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600 }}>
              Have you visited the clinic before for this concern?
            </span>
          }
          name="hasPreviousVisit"
          rules={[{ required: true, message: "Please select an option" }]}
          style={{ marginBottom: isMobile ? 16 : 20 }}
        >
          <Radio.Group>
            <Radio value="yes" style={{ fontSize: isMobile ? 13 : 14 }}>Yes</Radio>
            <Radio value="no" style={{ fontSize: isMobile ? 13 : 14 }}>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600 }}>
              Current symptoms? (Check all that apply)
            </span>
          }
          name="symptoms"
          style={{ marginBottom: isMobile ? 16 : 20 }}
        >
          <Checkbox.Group style={{ width: "100%" }}>
            <Checkbox value="fever" style={{ display: "block", marginBottom: 6, fontSize: isMobile ? 13 : 14 }}>Fever</Checkbox>
            <Checkbox value="cough" style={{ display: "block", marginBottom: 6, fontSize: isMobile ? 13 : 14 }}>Cough</Checkbox>
            <Checkbox value="headache" style={{ display: "block", marginBottom: 6, fontSize: isMobile ? 13 : 14 }}>Headache</Checkbox>
            <Checkbox value="body-pain" style={{ display: "block", marginBottom: 6, fontSize: isMobile ? 13 : 14 }}>Body Pain</Checkbox>
            <Checkbox value="stomach-pain" style={{ display: "block", marginBottom: 6, fontSize: isMobile ? 13 : 14 }}>Stomach Pain</Checkbox>
            <Checkbox value="other" style={{ display: "block", marginBottom: 0, fontSize: isMobile ? 13 : 14 }}>Other</Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item 
          label={
            <span style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600 }}>
              Describe your concern in detail
            </span>
          }
          name="concernDetails"
          rules={[{ required: true, message: "Please provide details" }]}
          style={{ marginBottom: isMobile ? 16 : 20 }}
        >
          <TextArea
            rows={isMobile ? 3 : 4}
            placeholder="Describe symptoms, when they started, and any other relevant details..."
            maxLength={500}
            showCount
            style={{ fontSize: isMobile ? 13 : 14 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: isMobile ? 16 : 24 }}>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexDirection: isMobile ? "column-reverse" : "row" }}>
            <Button onClick={onClose} block={isMobile} size={isMobile ? "large" : "middle"}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block={isMobile}
              size={isMobile ? "large" : "middle"}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
            >
              Continue to Schedule
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PreAppointmentAssessment;
