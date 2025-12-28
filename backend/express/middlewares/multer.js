const multer = require('multer');

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
        return callback(null, true);
    }
    const err = new Error('Only image files are allowed (jpeg, png, webp, gif)');
    err.code = 'INVALID_FILE_TYPE';
    return callback(err, false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

module.exports = upload;