const mysql = require('../library/mysql');

async function selectRssi(apStr, z) {
    const sql = `
    SELECT ap_rssi_idx, x, y, ${apStr}
    FROM AP_RSSI
    WHERE z = (?)
    `;

    const result = await mysql.query(sql, [z]);

    return result
}

async function selectRoute() {
    const sql = `
    SELECT node_idx, x, y, z, connect_a, connect_b, connect_c, connect_d, weight_a, weight_b, weight_c, weight_d
    FROM NODE
    `;

    const result = await mysql.query(sql, []);

    return result
}

module.exports = {
    selectRssi,
    selectRoute,
};