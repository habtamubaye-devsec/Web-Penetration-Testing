const upload = require('./multer');

const uploadSingleImage = upload.single('image');

const uploadProfileImage = (req, res, next) => {
  uploadSingleImage(req, res, (err) => {
    if (!err) return next();

    if (
      err.code === 'LIMIT_FILE_SIZE' ||
      err.code === 'LIMIT_FILE_COUNT' ||
      err.code === 'LIMIT_UNEXPECTED_FILE'
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Profile image must be a single file up to 5MB',
      });
    }

    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({
        status: 'fail',
        message: err.message,
      });
    }

    return res.status(400).json({
      status: 'fail',
      message: err.message || 'Invalid upload',
    });
  });
};

module.exports = uploadProfileImage;
