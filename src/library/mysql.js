const mysql = require('promise-mysql');
const { mysqlConfig } = require('../../config/mysqlConfig');
const errorResponseObject = require('../../config/errorResponseObject');

let mysqlPool;

async function getMysqlPool() {
  if (!mysqlPool) {
    mysqlPool = await mysql.createPool(mysqlConfig);
    return mysqlPool;
  }
  return mysqlPool;
}

async function query(...args) {
  const queryText = args[0];
  const data = args[1];

  await getMysqlPool();

  const connection = await mysqlPool.getConnection();
  const result = await connection.query(queryText, data) || null;

  connection.release();

  return result;
}

async function transaction(...args) {
  await getMysqlPool();

  const connection = await mysqlPool.getConnection();

  try {
    await connection.beginTransaction();

    await args[0](connection);
    await connection.commit();
  } catch (error) {
    console.log(error);
    await connection.rollback();

    throw errorResponseObject.transactionError;
  } finally {
    connection.release();
    // mysqlPool.releaseConnection(connection);
  }
}

module.exports = {
  query,
  transaction,
};

/* Transaction 사용 예시
const mysql = require('../library/mysql');

async function insertUserTransaction() {
  await mysql.transaction(async (connection) => {
    await function1(connection);
    await function2(connection);
  });
}
*/
