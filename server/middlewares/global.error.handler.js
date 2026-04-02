export const globalErrorHandler = (err, req, res, next) => {
  const message = err.message || "Internal Server Error";
  const status = err.status || err.statusCode || 500;

  return res.status(status).json({ message });
};
