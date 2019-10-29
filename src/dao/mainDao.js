const mysql = require('../library/mysql');

async function selectRssi(apStr) {
    const sql = `
    SELECT ap_rssi_idx, x, y, ${apStr}
    FROM AP_RSSI
    `;

    const result = await mysql.query(sql, []);

    return result
}

module.exports = {
    selectRssi,
};