// Page Access Logger
// Logs page accesses with time, date, and location

(function() {
  'use strict';

  const STORAGE_KEY = 'pageAccessLogs';
  const MAX_LOGS = 1000; // Maximum number of logs to keep

  // Get current date and time in format: HH:MM DD.MM.YYYY
  function getFormattedDateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    return {
      time: `${hours}:${minutes}`,
      date: `${day}.${month}.${year}`,
      timestamp: now.toISOString()
    };
  }

  // Get location using IP-based geolocation (free service)
  async function getLocation() {
    try {
      // Try ip-api.com first (free, no registration needed)
      const response1 = await fetch('https://ip-api.com/json/?fields=status,message,city,country');
      if (response1.ok) {
        const data = await response1.json();
        if (data.status === 'success' && data.city && data.country) {
          return `${data.city}, ${data.country}`;
        } else if (data.status === 'success' && data.country) {
          return data.country;
        }
      }
    } catch (error) {
      console.log('ip-api.com failed, trying alternative...');
    }

    try {
      // Fallback to ipapi.co
      const response2 = await fetch('https://ipapi.co/json/');
      const data = await response2.json();
      
      if (data.city && data.country_name) {
        return `${data.city}, ${data.country_name}`;
      } else if (data.country_name) {
        return data.country_name;
      }
    } catch (error) {
      console.log('ipapi.co failed, using fallback...');
    }

    // Final fallback
    return 'Unknown';
  }

  // Get additional info
  function getAdditionalInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      referrer: document.referrer || 'Direct',
      url: window.location.href,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    };
  }

  // Load existing logs from localStorage
  function loadLogs() {
    try {
      const logsJson = localStorage.getItem(STORAGE_KEY);
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      console.error('Error loading logs:', error);
      return [];
    }
  }

  // Save logs to localStorage
  function saveLogs(logs) {
    try {
      // Keep only the last MAX_LOGS entries
      const logsToSave = logs.slice(-MAX_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Error saving logs:', error);
      // If storage is full, try to clear old logs
      if (error.name === 'QuotaExceededError') {
        const reducedLogs = logs.slice(-Math.floor(MAX_LOGS / 2));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedLogs));
      }
    }
  }

  // Add a new log entry
  async function logPageAccess() {
    const dateTime = getFormattedDateTime();
    const location = await getLocation();
    const additionalInfo = getAdditionalInfo();

    const logEntry = {
      time: dateTime.time,
      date: dateTime.date,
      timestamp: dateTime.timestamp,
      location: location,
      ...additionalInfo
    };

    const logs = loadLogs();
    logs.push(logEntry);
    saveLogs(logs);

    // Log to console for debugging (optional)
    console.log('Page access logged:', logEntry);

    return logEntry;
  }

  // Download logs as JSON file
  function downloadLogs() {
    const logs = loadLogs();
    if (logs.length === 0) {
      alert('Nu există loguri de descărcat.');
      return;
    }

    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `page-access-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Download logs as CSV file (alternative format)
  function downloadLogsAsCSV() {
    const logs = loadLogs();
    if (logs.length === 0) {
      alert('Nu există loguri de descărcat.');
      return;
    }

    // CSV header
    const headers = ['Time', 'Date', 'Location', 'Language', 'Platform', 'Referrer', 'URL'];
    let csv = headers.join(',') + '\n';

    // CSV rows
    logs.forEach(log => {
      const row = [
        log.time || '',
        log.date || '',
        log.location || '',
        log.language || '',
        log.platform || '',
        log.referrer || '',
        log.url || ''
      ];
      csv += row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const dataBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `page-access-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Clear all logs
  function clearLogs() {
    if (confirm('Sigur doriți să ștergeți toate logurile?')) {
      localStorage.removeItem(STORAGE_KEY);
      alert('Logurile au fost șterse.');
    }
  }

  // Get log count
  function getLogCount() {
    return loadLogs().length;
  }

  // Initialize logging when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', logPageAccess);
  } else {
    logPageAccess();
  }

  // Expose functions globally for manual use
  window.pageLogger = {
    downloadLogs: downloadLogs,
    downloadLogsAsCSV: downloadLogsAsCSV,
    clearLogs: clearLogs,
    getLogCount: getLogCount,
    loadLogs: loadLogs
  };
})();
