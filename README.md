# ParcelMap Backend

This is the backend API for the ParcelMap application, built with Express.js and PostgreSQL.

## How to Run the System

### Prerequisites

- Ensure you have Node.js and npm installed
- Ensure you have PostgreSQL running and the required databases set up

### Steps to Run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the system:

   ```bash
   npm start
   ```

   This will start the server on the port `3001` as default

3. For development mode with hot-reloading:

   ```bash
   npm run dev
   ```

   This uses `nodemon` to automatically restart the server on file changes

### Environment Variables

Ensure the following environment variables are set in the `.env` file:

- `SOURCE_DATABASE_URL`: Connection string for the source database
- `DEV_UPDATE_DATABASE_URL`: Connection string for the development update database

### Logs

Audit logs are stored in the `logs/audit_log.txt` file
