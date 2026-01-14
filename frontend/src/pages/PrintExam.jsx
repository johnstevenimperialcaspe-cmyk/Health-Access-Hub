import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
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
`;

const PrintExam = () => {
  const { id } = useParams();
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
        // If the logged-in user is the owner of this exam, fetch their full profile
        try {
          if (res.data && currentUser && res.data.user_id === currentUser.id) {
            const p = await axios.get(`/api/users/profile`);
            if (mounted) setProfile(p.data);
          }
        } catch (profileErr) {
          console.warn("Could not fetch profile for print optimization:", profileErr?.message || profileErr);
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
      // give browser a moment to render then trigger print
      setTimeout(() => {
        window.print();
      }, 250);
    }
  }, [loading, exam]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!exam) return <div style={{ padding: 20 }}>Not found</div>;

  const notes = (() => {
    try { return typeof exam.notes === 'string' ? JSON.parse(exam.notes || '{}') : exam.notes || {}; } catch { return { physical: {}, medical: {} } }
  })();
  const physical = notes.physical || {};
  const medical = notes.medical || {};

  // Fallbacks for user fields (different API shapes may use prefixed names)
  const address = (profile && (profile.address || profile.user_address)) || exam.address || exam.user_address || exam.addr || '';
  const birthday = (profile && (profile.birthday || profile.user_birthday)) || exam.birthday || exam.user_birthday || exam.date_of_birth || '';
  const contact = (profile && (profile.phone_number || profile.user_phone)) || exam.phone_number || exam.user_phone || exam.contact_number || '';

  // Determine identifiers
  const isStudent = !!(exam.user_student_id || exam.student_id);
  const studentId = exam.user_student_id || exam.student_id || '';
  const employeeId = exam.employee_id || exam.user_employee_id || '';
  const identifier = isStudent ? studentId : employeeId;
  const fullName = `${exam.first_name || ''} ${exam.last_name || ''}`.trim();
  // const role = exam.user_role || exam.role || '';  // Unused for now
  const department = (profile && (profile.department || profile.dept)) || exam.department || exam.department_name || '';
  const position = (profile && profile.position) || exam.position || '';
  const course = isStudent ? ((profile && (profile.course || profile.program)) || exam.course || '') : '';
  const yearSec = isStudent ? ((profile && (profile.year_level || profile.section)) || exam.year_level || exam.section || '') : '';
  const doctorName = exam.ms_first_name || exam.ms_last_name ? `${exam.ms_first_name || ''} ${exam.ms_last_name || ''}`.trim() : '';

  return (
    <div className="print-root">
      <style>{pageStyle}</style>
      <div className="container">
        <div className="header">
          <div>
            <strong>EARIST Health Access Hub</strong>
          </div>
          <div>
            <div>Date: {exam.date_of_visit ? new Date(exam.date_of_visit).toLocaleDateString() : ''}</div>
          </div>
        </div>

        {/* Header info per user type */}
        <div className="row">
          <div style={{ flexBasis: '50%' }}>
            <div><span className="label">{isStudent ? 'Student ID' : 'Employee ID'}:</span> {identifier}</div>
            <div><span className="label">Name:</span> {fullName}</div>
            <div><span className="label">Address:</span> {address}</div>
            <div><span className="label">Birthday:</span> {birthday ? new Date(birthday).toLocaleDateString() : ''}</div>
          </div>
          <div style={{ flexBasis: '45%' }}>
            {isStudent ? (
              <>
                <div><span className="label">Course & Program:</span> {course}</div>
                <div><span className="label">Year & Section:</span> {yearSec}</div>
                <div><span className="label">Contact Number:</span> {contact}</div>
              </>
            ) : (
              <>
                <div><span className="label">Contact Number:</span> {contact}</div>
                <div><span className="label">Department:</span> {department}</div>
                <div><span className="label">Position:</span> {position}</div>
              </>
            )}
          </div>
        </div>

        <h1 style={{ textAlign: 'center', marginTop: 18 }}>PHYSICAL EXAMINATION</h1>
        <div className="section">
          <div className="vital">
            <div className="vital-item"><span className="label">Height:</span> {physical.height || ''} cm</div>
            <div className="vital-item"><span className="label">Weight (kg):</span> {physical.weight || ''} kg</div>
            <div className="vital-item"><span className="label">Blood Pressure:</span> {physical.bloodPressure || ''}</div>
          </div>
          <div className="vital" style={{ marginTop: 8 }}>
            <div className="vital-item"><span className="label">Heart Rate:</span> {physical.heartRate || ''} bpm</div>
            <div className="vital-item"><span className="label">Respiratory Rate:</span> {physical.respiratoryRate || exam.vital_respiratory_rate || ''} breaths/min</div>
            <div className="vital-item"><span className="label">Temperature:</span> {physical.temperature || ''} °C</div>
          </div>
        </div>

        <h1 style={{ textAlign: 'center', marginTop: 18 }}>MEDICAL EXAMINATION</h1>
        <div className="section">
          <div>
            <div className="label">Findings:</div>
            <div className="notes">{medical.findings || ''}</div>
          </div>
          <div style={{ marginTop: 12 }}>
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

export default PrintExam;
