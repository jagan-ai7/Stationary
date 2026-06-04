const errorMiddleware = (err, req, res, next) => {
  console.error("ERROR 💥:", err);

  // Default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message || "Something went wrong",
    silent: err.silent || false,
  });
};

export default errorMiddleware;
