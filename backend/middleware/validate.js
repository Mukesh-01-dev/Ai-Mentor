const validate = (schema) => (req, res, next) => {
  if (!schema) {
    console.error("❌ Validation Error: No schema provided to validate middleware");
    return res.status(500).json({ message: "Internal Server Error: No schema provided" });
  }
try {
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      console.error("❌ Validation Failed for body:", JSON.stringify(req.body, null, 2));
      console.error("❌ Issues:", JSON.stringify(issues, null, 2));
      
      return res.status(400).json({
        message: "Validation failed",
        errors: issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    next();
  } catch (error) {
    console.error("❌ Validation Middleware Internal Error:", error);
    return res.status(500).json({ 
      message: "Internal Server Error during validation",
      details: error.message || "Unknown error"
    });
  }
};

export default validate;
