const express = require('express');
const router = express.Router();
const mainService = require('../service/mainService');
const { response, errorResponse } = require('../library/response');

// (rssi) => {좌표}
router.post('/coord', async (req, res)=>{
    try {
      let result = await mainService.postCoord(req.body); 
      const res2 = await mainService.postCoordBefore(req.body);
      result.x2 = res2.x; 
      result.y2 = res2.y; 
      response('Success', result, res, 200);

  } catch (error) {
      console.log(error);
      errorResponse(error.message, res, error.statusCode);
      
  }
});

module.exports = router;