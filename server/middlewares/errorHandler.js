// Global error handler — catches all unhandled errors from controllers
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal server error";

  res.status(statusCode).json({ error: message });
};

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

module.exports = { errorHandler, AppError };
