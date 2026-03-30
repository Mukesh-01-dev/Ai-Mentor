const validate = (schema) => (req, res, next) => {
  if (!schema) {
    console.error("❌ Validation Error: No schema provided to validate middleware");
    return res.status(500).json({ message: "Internal Server Error: No schema provided" });
  }
try {
    schema.parse(req.body);
    next();
  } catch (error) {
    
const issues = error.issues || error.errors;
if (issues && Array.isArray(issues)) {
      return res.status(400).json({
        message: "Validation failed",
        errors: issues.map((err) => ({
          path: err.path[0],
          message: err.message,
        })),
      });
    }
console.error("❌ Validation Middleware Error:", error.message || error);
    return res.status(500).json({ 
      message: "Internal Server Error during validation",
      details: error.message 
    });
  }
};

export default validate;
