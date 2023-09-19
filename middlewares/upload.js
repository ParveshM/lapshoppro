const multer = require('multer');     /**** Multer setup ****/
const path = require('path');         /*********************/

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/admin/uploads'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

module.exports = {upload};
