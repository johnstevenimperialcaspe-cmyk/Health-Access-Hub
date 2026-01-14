import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

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

const PrintExamStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get(`/api/examinations/${id}`);
        if (!mounted) return;
        setExam(res.data);
        // Always fetch current user's full profile from account page
        try {
          const p = await axios.get(`/api/users/profile`);
          if (mounted) setProfile(p.data);
        } catch (profileErr) {
          console.warn("Could not fetch profile:", profileErr?.message || profileErr);
        }
      } catch (err) {
        console.error("Failed to load exam:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, [id, currentUser]);

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

  const studentId = (profile && profile.student_id) || exam.student_id || exam.user_student_id || '';
  const fullName = (profile && `${profile.first_name || ''} ${profile.last_name || ''}`.trim()) || `${exam.first_name || ''} ${exam.last_name || ''}`.trim();
  const address = (profile && profile.address) || exam.address || '';
  const birthday = (profile && profile.birthday) || exam.birthday || '';
  const contact = (profile && profile.phone_number) || exam.phone_number || '';
  const course = (profile && profile.course) || exam.course || '';
  const yearSection = (profile && `${profile.year_level || ''} - ${profile.section || ''}`.trim().replace(/^- |- $/g, '')) || exam.year_section || '';
  const doctorName = exam.ms_first_name || exam.ms_last_name ? `${exam.ms_first_name || ''} ${exam.ms_last_name || ''}`.trim() : '';

  return (
    <div className="print-root">
      <style>{pageStyle}</style>
      <button 
        className="back-button" 
        onClick={() => navigate('/student/health-records')}
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

        {/* STUDENT INFO HEADER */}
        <div style={{marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '12px'}}>
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
        </div>

        <h1 style={{textAlign:'center', marginTop:18}}>PHYSICAL EXAMINATION</h1>
        <div className="section">
          <div className="vital">
            <div className="vital-item"><span className="label">Height:</span> {physical.height || ''} cm</div>
            <div className="vital-item"><span className="label">Weight (kg):</span> {physical.weight || ''} kg</div>
            <div className="vital-item"><span className="label">Blood Pressure:</span> {physical.bloodPressure || ''}</div>
          </div>
          <div className="vital" style={{marginTop:8}}>
            <div className="vital-item"><span className="label">Heart Rate:</span> {physical.heartRate || ''} bpm</div>
            <div className="vital-item"><span className="label">Respiratory Rate:</span> {physical.respiratoryRate || exam.vital_respiratory_rate || ''} breaths/min</div>
            <div className="vital-item"><span className="label">Temperature:</span> {physical.temperature || ''} °C</div>
          </div>
        </div>

        <h1 style={{textAlign:'center', marginTop:18}}>MEDICAL EXAMINATION</h1>
        <div className="section">
          <div>
            <div className="label">Findings:</div>
            <div className="notes">{medical.findings || ''}</div>
          </div>
          <div style={{marginTop:12}}>
            <div className="label">Recommendation:</div>
            <div className="notes">{medical.recommendation || ''}</div>
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

export default PrintExamStudent;
