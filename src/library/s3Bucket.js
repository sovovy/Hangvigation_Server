const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const moment = require('moment');
const s3Config = require('../../config/s3Config');

aws.config.loadFromPath('./config/s3Location.json');

const s3 = new aws.S3();

function getMulter(folder) {
  const date = {
    YYYY: moment().format('YYYY'),
    MM: moment().format('MM'),
    DD: moment().format('DD'),
  };

  return multer({
    storage: multerS3({
      s3,
      bucket: s3Config.bucket,
      acl: s3Config.acl,
      key(req, file, cb) {
        cb(null, `${folder}/${date.YYYY}/${date.MM}/${date.DD}/${file.originalname}`);
        // cb(null, package + "/" + date.YYYY + "/" + file.originalname);
      },
    }),
  });
}

module.exports = {
  getMulter,
};
