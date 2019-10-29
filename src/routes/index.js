const express = require('express');
const router = express.Router();
const mainService = require('../service/mainService');
const { response, errorResponse } = require('../library/response');

// (rssi) => {좌표}
router.post('/coord', async (req, res)=>{
    try {
      const result = await mainService.postCoord(req.body); 
      response('Success', result, res, 200);

  } catch (error) {
      console.log(error);
      errorResponse(error.message, res, error.statusCode);
      
  }
});

module.exports = router;