const asyncHandler = (fn) => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch((err) => 
    res.status(err.statusCode || 500).json({ error: err.message }) 
  );
module.exports = asyncHandler; 