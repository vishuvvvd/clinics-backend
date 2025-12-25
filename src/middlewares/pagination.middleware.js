module.exports = function pagination(req, _res, next) {
  req.pagination = {
    page: Math.max(parseInt(req.query.page || '1', 10), 1),
    limit: Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50)
  };
  next();
};
