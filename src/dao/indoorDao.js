const mysql = require('../library/mysql');

async function selectParentIdx(divisionIdx) {
    const sql = `
    SELECT division_idx, name
    FROM DIVISION
    WHERE parent_idx = (?)
    `;

    const result = await mysql.query(sql, [divisionIdx]);

    return result
}

async function selectPlaceByDivisionIdx(divisionIdx) {
    const sql = `
    SELECT indoor_place_idx, name, building, num
    FROM INDOOR_PLACE
    WHERE division_idx = (?)
    `;

    const result = await mysql.query(sql, [divisionIdx]);

    return result
}

async function selectPlaceInfo(indoorPlaceIdx) {
    const sql = `
    SELECT indoor_place_idx, name, building, num, floor, tag1, tag2, tag3, info, x, y, x2, y2
    FROM INDOOR_PLACE
    WHERE indoor_place_idx = (?)
    `;

    const result = await mysql.query(sql, [indoorPlaceIdx]);

    return result

}

module.exports = {
    selectParentIdx,
    selectPlaceByDivisionIdx,
    selectPlaceInfo,
};