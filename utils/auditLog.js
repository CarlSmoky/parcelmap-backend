import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../logs');
const logFilePath = path.join(logsDir, 'audit_log.txt');

// Ensure the logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Writes an audit log entry to the log file.
 * @param {string} status - "SUCCESS" or "FAILED"
 * @param {string} method - "GET" or "POST"
 * @param {string} uri - "/api/parcels"
 * @param {string} message 
 * @param {number[]} targetIds - The array of target IDs [1, 2, 3].
 * @param {string} newZoningType - 'Residential', 'Commercial', 'Industrial'
 */
export const writeAuditLog = ({ status, method, uri, message, targetIds = [], newZoningType = '' }) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] | ${status} | ${method} ${uri} | ${message} | Target IDs: ${JSON.stringify(targetIds)} | New Zoning Type: ${newZoningType}\n`;

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to audit log:', err.message);
    }
  });
};