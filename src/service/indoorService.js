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

module.exports = {
    getDivision,
};