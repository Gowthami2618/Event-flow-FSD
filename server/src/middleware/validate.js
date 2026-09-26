const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const firstErrorMessage = errorList[0]?.msg || 'Validation failed';
    return res.status(422).json({
      success: false,
      message: firstErrorMessage,
      errors: errorList.map((e) => ({ field: e.path || e.param, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
