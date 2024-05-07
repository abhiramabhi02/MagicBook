const multer = require("multer");
const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../public/productImages"));
//   },
//   filename: function (req, file, cb) {
//     const name = Date.now() + "-" + file.originalname;
//     cb(null, name);
//   },
// });

// const upload = multer({ storage: storage });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/productImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
  fileFilter: function (req, file, cb) {
    // Accept only jpg, png, and webp files
    if (!file.originalname.match(/\.(jpg|png|webp)$/)) {
      return cb(new Error("Only jpg, png, and webp files are allowed!"), false);
    }
    cb(null, true);
  },
});

const upload = multer({ storage: storage });


module.exports = upload;
