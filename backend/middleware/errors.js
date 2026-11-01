export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `That ${field} is already in use.` });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map(item => item.message).join(' ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'The requested record ID is invalid.' });
  res.status(err.status || 500).json({ message: process.env.NODE_ENV === 'production' ? 'Something went wrong. Please try again.' : (err.message || 'Internal server error.') });
}
