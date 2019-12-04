const express = require('express');
const router = express.Router();
const indoorService = require('../service/indoorService');
const { response, errorResponse } = require('../library/response');

router.get('/division/:divisionIdx', async (req, res)=>{
    try {
      const { divisionIdx } = req.params;

      const result = await indoorService.getDivision(divisionIdx); 

      response('Success', result, res, 200);

  } catch (error) {
      console.log(error);
      errorResponse(error.message, res, error.statusCode);
      
  }
});

router.get('/info/:indoorPlaceIdx', async (req, res)=>{
  try {
    const { indoorPlaceIdx } = req.params;

    const result = await indoorService.getInfo(indoorPlaceIdx); 

    response('Success', result, res, 200);

} catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
    
}
});

module.exports = router;