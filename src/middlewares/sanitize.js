module.exports = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    const sanitize = (obj) => {
      Object.keys(obj).forEach((key) => {
        // Remove MongoDB operators
        if (key.startsWith("$")) {
          delete obj[key];
        }
        // Recursively sanitize nested objects
        else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitize(obj[key]);
        }
        // Basic XSS protection for strings
        else if (typeof obj[key] === "string") {
          obj[key] = obj[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
      });
    };
    sanitize(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    const sanitizeQuery = (query) => {
      Object.keys(query).forEach((key) => {
        if (key.startsWith("$")) {
          delete query[key];
        } else if (typeof query[key] === "string") {
          query[key] = query[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
      });
    };
    sanitizeQuery(req.query);
  }

  next();
};
