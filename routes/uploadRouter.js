const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');//multer processes the uploaded files

const storage = multer.diskStorage({
    destination: (req, file, cb) => {//cb is callback
        cb(null, 'public/images');//error is null, destination is specified
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname)//error is null, filename is specified so that same name is retained after uploading
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {//regular expressions
        return cb(new Error('You can upload only image files!'), false);//false because it returns nothing due to error
    }
    cb(null, true);//true as files get filtered due to no error
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {//uploads imageFile from Postman (from form-data key in body)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);//output from Postman on uploading file
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;