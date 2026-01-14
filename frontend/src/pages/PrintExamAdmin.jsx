import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";

const pageStyle = `
  @page { size: A4; margin: 20mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #222; }
  .container { max-width: 800px; margin: 0 auto; }
  .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px }
  h1 { font-size:18px; margin:0 }
  .row { display:flex; justify-content:space-between; margin-bottom:8px }
  .label { font-weight:600 }
  .section { margin-top:18px }
  .vital { display:flex; gap:12px; }
  .vital-item { min-width:150px }
  .notes { border:1px solid #ccc; padding:8px; min-height:80px }
  .doctor { margin-top:40px }
  .signature { margin-top:40px; border-top:1px solid #000; width:250px }
  .reminder { margin-top:20px; font-size:12px; color:#555 }
  .back-button { 
    position: fixed; 
    top: 20px; 
    left: 20px; 
    padding: 10px 20px; 
    background: #1976d2; 
    color: white; 
    border: none; 
    border-radius: 4px; 
    cursor: pointer; 
    font-size: 14px;
    z-index: 1000;
  }
  .back-button:hover { background: #1565c0; }
  @media print {
    .back-button { display: none; }
  }
`;

const PrintExamAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Fetch examination data
        const res = await api.get(`/api/examinations/${id}`);
        if (!mounted) return;
        setExam(res.data);
      } catch (err) {
        console.error("Failed to load exam:", err);
        if (!mounted) return;
        // If not found as examination, try health records
        try {
          const hrRes = await api.get(`/api/health-records/${id}`);
          if (hrRes.data && hrRes.data.record_type === "examination") {
            // Convert health record to examination format
            const hr = hrRes.data;
            setExam({
              ...hr,
              user_student_id: hr.user_student_id,
              user_employee_id: hr.user_employee_id,
              user_role: hr.user_role,
              first_name: hr.student_first_name,
              middle_name: hr.student_middle_name,
              last_name: hr.student_last_name,
              course: hr.course,
              year_level: hr.year_level,
              department: hr.department,
              position: hr.position,
              address: hr.address,
              birthday: hr.birthday,
              phone_number: hr.phone_number,
            });
          } else {
            alert("This record is not a physical/medical examination.");
            navigate(-1);
          }
        } catch (hrErr) {
          console.error("Failed to load health record:", hrErr);
          alert("Failed to load examination record.");
          navigate(-1);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, [id, navigate]);

  useEffect(() => {
    if (!loading && exam) {
      setTimeout(() => {
        window.print();
      }, 250);
    }
  }, [loading, exam]);

  if (loading) return <div style={{padding:20}}>Loading...</div>;
  if (!exam) return <div style={{padding:20}}>Exam not found</div>;

  const notes = (() => {
    try { return typeof exam.notes === 'string' ? JSON.parse(exam.notes || '{}') : exam.notes || {}; } catch { return { physical: {}, medical: {} } }
  })();
  const physical = notes.physical || {};
  const medical = notes.medical || {};

  // Determine user type from role or presence of student_id/employee_id
  const userRole = exam.user_role || (exam.user_student_id ? "student" : exam.user_employee_id ? (exam.user_role || "faculty") : "student");
  const isStudent = userRole === "student";
  const isFaculty = userRole === "faculty";
  const isNonAcademic = userRole === "non_academic";

  const studentId = exam.user_student_id || exam.student_id || '';
  const employeeId = exam.user_employee_id || exam.employee_id || '';
  const fullName = `${exam.first_name || exam.student_first_name || ''} ${exam.middle_name || exam.student_middle_name || ''} ${exam.last_name || exam.student_last_name || ''}`.trim().replace(/\s+/g, ' ');
  const address = exam.address || '';
  const birthday = exam.birthday || '';
  const contact = exam.phone_number || '';
  const course = exam.course || '';
  const yearSection = `${exam.year_level || ''} - ${exam.section || ''}`.trim().replace(/^- |- $/g, '');
  const department = exam.department || '';
  const position = exam.position || '';
  const doctorName = exam.ms_first_name || exam.ms_last_name ? `${exam.ms_first_name || ''} ${exam.ms_last_name || ''}`.trim() : '';

  return (
    <div className="print-root">
      <style>{pageStyle}</style>
      <button 
        className="back-button" 
        onClick={() => navigate('/admin/health-records')}
      >
        ← Go Back
      </button>
      <div className="container">
        <div className="header">
          <div>
            <strong>EARIST Health Access Hub</strong>
          </div>
          <div>
            <div>Date: {exam.date_of_visit ? new Date(exam.date_of_visit).toLocaleDateString() : ''}</div>
          </div>
        </div>

        {/* USER INFO HEADER - Different based on role */}
        <div style={{marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '12px'}}>
          {isStudent && (
            <>
              <h2 style={{margin: '0 0 12px 0', fontSize: '16px'}}>STUDENT INFORMATION</h2>
              <div className="row">
                <div><span className="label">Student ID:</span> {studentId}</div>
                <div><span className="label">Name:</span> {fullName}</div>
              </div>
              <div className="row">
                <div><span className="label">Address:</span> {address}</div>
                <div><span className="label">Birthday:</span> {birthday ? new Date(birthday).toLocaleDateString() : ''}</div>
              </div>
              <div className="row">
                <div><span className="label">Contact Number:</span> {contact}</div>
              </div>
              <div className="row">
                <div><span className="label">Course:</span> {course}</div>
                <div><span className="label">Year / Section:</span> {yearSection}</div>
              </div>
            </>
          )}
          {(isFaculty || isNonAcademic) && (
            <>
              <h2 style={{margin: '0 0 12px 0', fontSize: '16px'}}>
                {isFaculty ? 'FACULTY INFORMATION' : 'NON-ACADEMIC STAFF INFORMATION'}
              </h2>
              <div className="row">
                <div><span className="label">Employee ID:</span> {employeeId}</div>
                <div><span className="label">Name:</span> {fullName}</div>
              </div>
              <div className="row">
                <div><span className="label">Address:</span> {address}</div>
                <div><span className="label">Birthday:</span> {birthday ? new Date(birthday).toLocaleDateString() : ''}</div>
              </div>
              <div className="row">
                <div><span className="label">Contact Number:</span> {contact}</div>
              </div>
              <div className="row">
                <div><span className="label">Department:</span> {department}</div>
                <div><span className="label">Position:</span> {position}</div>
              </div>
            </>
          )}
        </div>

        <h1 style={{textAlign:'center', marginTop:18}}>PHYSICAL EXAMINATION</h1>
        <div className="section">
          <div className="vital">
            <div className="vital-item"><span className="label">Height:</span> {physical.height || exam.vital_height || ''} cm</div>
            <div className="vital-item"><span className="label">Weight (kg):</span> {physical.weight || exam.vital_weight || ''} kg</div>
            <div className="vital-item"><span className="label">Blood Pressure:</span> {physical.bloodPressure || exam.vital_blood_pressure || ''}</div>
          </div>
          <div className="vital" style={{marginTop:8}}>
            <div className="vital-item"><span className="label">Heart Rate:</span> {physical.heartRate || exam.vital_heart_rate || ''} bpm</div>
            <div className="vital-item"><span className="label">Respiratory Rate:</span> {physical.respiratoryRate || exam.vital_respiratory_rate || ''} breaths/min</div>
            <div className="vital-item"><span className="label">Temperature:</span> {physical.temperature || exam.vital_temperature || ''} °C</div>
          </div>
        </div>

        <h1 style={{textAlign:'center', marginTop:18}}>MEDICAL EXAMINATION</h1>
        <div className="section">
          <div>
            <div className="label">Findings:</div>
            <div className="notes">{medical.findings || exam.diagnosis || ''}</div>
          </div>
          <div style={{marginTop:12}}>
            <div className="label">Recommendation:</div>
            <div className="notes">{medical.recommendation || exam.treatment || ''}</div>
          </div>
        </div>

        <div className="doctor">
          <div className="label">Doctor: {doctorName}</div>
          <div className="signature" />
          <div className="reminder">*This is not valid if the Doctor does not sign this.</div>
        </div>
      </div>
    </div>
  );
};

export default PrintExamAdmin;

