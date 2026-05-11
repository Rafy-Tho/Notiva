export const ok = (res, data, message = "ok", status = 200) =>
  res.status(status).json({ success: true, data, error: null, message });

export const fail = (res, error, status = 400, message = "fail") =>
  res.status(status).json({ success: false, data: null, error, message });

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
