const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    const userId = req.body.userId || '0'; //0 is used as a fallback or testing.
    const category = req.body.category || 'other' //Seperate by avatar, feed, forum, etc.
    const uploadPath = `./public/images/${userId}/${categpry}`;

    //Make the directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true })

    callback(null, './public/images');
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;