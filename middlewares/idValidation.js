const { validationResult, param } = require('express-validator');
const mongoose = require('mongoose')
const validateID = [
  param('id')
    .isMongoId() // Check if it's a valid MongoDB ObjectID
    .withMessage('Invalid ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('./shop/pages/404');
    }
    next();
  },
];


const adminValidateID = [
  param('id')
    .isMongoId() // Check if it's a valid MongoDB ObjectID
    .withMessage('Invalid ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('./admin/page404', { title: '404' });
    }
    next();
  },
];


module.exports = { validateID, adminValidateID };
