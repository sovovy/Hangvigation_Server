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

async function getSearch(query) {
    if (typeof query=='undefined') {
        return ['메이커스페이스', '전산실', '소프트웨어학과', '편의점'];
    }

    let tmp = query.split(' ');
    let str = '';
    let num;

    tmp.forEach(word => {
        if (!isNaN(parseInt(word))) {
            num = parseInt(word);
        } else {
            str += word;
        }
    });

    const places = await indoorDao.selectPlaceByQuery(str, num);
    
    return places;
}

module.exports = {
    getDivision,
    getInfo,
    getSearch,
};