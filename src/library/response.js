const response = (message, obj, res, status) => {
  res
    .status(status)
    .json({
      message,
      data: (obj) || {},
    });
};

const errorResponse = (message, res, status) => {
  res
    .status(status)
    .json({
      message,
    });
};

module.exports = {
  response,
  errorResponse,
};
