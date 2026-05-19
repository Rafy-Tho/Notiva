export const ok = (res, data, message = "ok", status = 200) =>
  res.status(status).json({ success: true, data, code: null, message });

export const fail = (res, message = "fail", status = 400, code = null) =>
  res.status(status).json({ success: false, data: null, message, code });

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
