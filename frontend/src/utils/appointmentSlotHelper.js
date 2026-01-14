import api from "./axios";

/**
 * Check available slots for a given date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} - { date, booked_slots, available_slots, is_fully_booked }
 */
export const getAvailableSlotsForDate = async (date) => {
  try {
    const response = await api.get(`/api/appointments/slots/availability/${date}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching slot availability:", error);
    throw error;
  }
};

/**
 * Validate appointment time constraints
 * @param {string} appointmentDate - Date in YYYY-MM-DD format
 * @param {string} appointmentTime - Time in HH:MM format
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateAppointmentTime = (appointmentDate, appointmentTime) => {
  const errors = [];

  if (!appointmentDate || !appointmentTime) {
    return { valid: false, errors: ["Date and time are required"] };
  }

  // Check if date is Monday-Friday (0=Sunday, so 1-5 are Mon-Fri)
  const dateObj = new Date(appointmentDate);
  const dayOfWeek = dateObj.getDay();
  
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    errors.push("Appointments can only be scheduled Monday to Friday.");
  }

  // Check if time is between 7:00 AM and 6:00 PM (18:00)
  const [hours, minutes] = appointmentTime.split(":").map(Number);
  const timeInMinutes = hours * 60 + minutes;
  const minTime = 7 * 60; // 7:00 AM
  const maxTime = 18 * 60; // 6:00 PM
  
  if (timeInMinutes < minTime || timeInMinutes > maxTime) {
    errors.push("Appointments can only be scheduled between 7:00 AM and 6:00 PM.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get minimum allowed date (next Monday if today is weekend, or today if weekday)
 * @returns {string} - Date in YYYY-MM-DD format
 */
export const getMinimumAllowedDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // If today is Saturday (6), add 2 days to get Monday
  // If today is Sunday (0), add 1 day to get Monday
  // Otherwise add 0 days (today is a weekday)
  let daysToAdd = 0;
  if (dayOfWeek === 6) {
    daysToAdd = 2;
  } else if (dayOfWeek === 0) {
    daysToAdd = 1;
  }

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + daysToAdd);
  
  return minDate.toISOString().split("T")[0];
};

/**
 * Check if a date is a weekday (Monday-Friday)
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export const isWeekday = (date) => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5;
};

/**
 * Get operating hours as a formatted string
 * @returns {string}
 */
export const getOperatingHours = () => {
  return "7:00 AM - 6:00 PM (Monday to Friday)";
};

/**
 * Check if time is within operating hours
 * @param {string} time - Time in HH:MM format
 * @returns {boolean}
 */
export const isWithinOperatingHours = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const timeInMinutes = hours * 60 + minutes;
  const minTime = 7 * 60; // 7:00 AM
  const maxTime = 18 * 60; // 6:00 PM
  
  return timeInMinutes >= minTime && timeInMinutes <= maxTime;
};
