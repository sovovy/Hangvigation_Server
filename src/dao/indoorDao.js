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
async function selectPlaceByQuery(str, num) {
    let sql = `
    SELECT indoor_place_idx, name, building, num
    FROM INDOOR_PLACE
    WHERE ( name LIKE '%${str}%'
    OR building LIKE '%${str}%'
    OR tag1 LIKE '%${str}%'
    OR tag2 LIKE '%${str}%'
    OR tag3 LIKE '%${str}%' )
    `;

    if (num!=null)
        sql += `AND num LIKE '%${num}%'`;

    const result = await mysql.query(sql, [str, str, str, str, str]);

    return result
}

module.exports = {
    selectParentIdx,
    selectPlaceByDivisionIdx,
    selectPlaceInfo,
    selectPlaceByQuery,
};