const validate = (schema) => (req, res, next) => {
  if (!schema) {
    return res.status(500).json({ message: "Internal Server Error: No schema provided" });
  }

  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      path: err.path[0],
      message: err.message,
    }));
    return res.status(400).json({ message: "Validation failed", errors });
  }

  req.body = result.data;
  next();
};

export default validate;