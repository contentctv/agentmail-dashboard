/**
 * API utility for fetching email data from FastAPI backend.
 * Handles GET requests to /api/emails endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetch paginated list of email events.
 * 
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} - { total, page, limit, items }
 * @throws {Error} - If API request fails
 */
export async function fetchEmails(page = 1, limit = 50) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/emails?page=${page}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

/**
 * Fetch single email detail with full JSON payload.
 * 
 * @param {number} emailId - Email event ID
 * @returns {Promise<Object>} - Email detail object
 * @throws {Error} - If API request fails or email not found
 */
export async function fetchEmailDetail(emailId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/emails/${emailId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Email not found');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching email ${emailId}:`, error);
    throw error;
  }
}

/**
 * Poll for new emails (useful for auto-refresh).
 * 
 * @param {Function} callback - Called with new emails array
 * @param {number} intervalMs - Polling interval in milliseconds
 * @returns {Function} - Cleanup function to stop polling
 */
export function pollEmails(callback, intervalMs = 5000) {
  const poll = async () => {
    try {
      const data = await fetchEmails(1, 20);
      callback(data.items);
    } catch (error) {
      console.error('Polling error:', error);
    }
  };
  
  // Initial fetch
  poll();
  
  // Set up interval
  const intervalId = setInterval(poll, intervalMs);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}
