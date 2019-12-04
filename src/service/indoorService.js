const indoorDao = require('../dao/indoorDao');

async function getDivision(divisionIdx) {
    const divisions = await indoorDao.selectParentIdx(divisionIdx);

    if (divisions.length != 0) {
        return divisions;
        // [{idx, name }, ]
    } else {
        return await indoorDao.selectPlaceByDivisionIdx(divisionIdx);
        // [{idx, name, building, num호 }, ]
    }
}

async function getInfo(indoorPlaceIdx) {
    const info = await indoorDao.selectPlaceInfo(indoorPlaceIdx);
    
    return info[0];
}

module.exports = {
    getDivision,
    getInfo,
};