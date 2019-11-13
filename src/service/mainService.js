const mainDao = require('../dao/mainDao');

function getListByRow(rssiRow, apNum) {
    let res = [];

    for (let i=0; i<apNum.length; i++) {
        res.push(rssiRow[`ap${apNum[i]}`]);
    }

    return res;
}

function getDistance(mVec, sVec) {
    let sum = 0;

    for (let i=0; i<mVec.length; i++) {
        if (sVec[i]!=null) {
            sum += (mVec[i] - sVec[i])**2;
        }
    }

    return sum;
}

function getSimilarity(mVec, sVec) {
    let sumM = 0;
    let sumS = 0;
    let mul = 0;

    // matrix multiple
    // for(let i=0; i<mVec.length; i++){
    //     // var row = [];
    //     for(let j=0; j<mVec.length; j++){
    //         // let x = 0;
    //         for(let k=0; k<mVec.length; k++) {
    //             if(sVec[k] != null)
    //                 mul += mVec[i][k]*sVec[k][j];
    //         }
    //         // row.push(x);
    //     }
    //     // mul.push(row);
    // }

    for(let i=0; i<mVec.length; i++) {
        if(sVec[i] != null)
            mul = mVec[i] * sVec[i];
    }

    for (let i=0; i<mVec.length; i++) {
        sumM += mVec[i]**2;
    }

    for (let i=0; i<sVec.length; i++) {
        sumM += sVec[i]**2;
    }

    return mul / (Math.sqrt(sumM) * Math.sqrt(sumS));
}

async function postCoord(rssi) {
    // get Server's BSSID 8
    let serverBssid = ['06:09:b4:76:cc:ac',
        '06:09:b4:76:cc:d4',
        '0a:09:b4:76:cc:94',
        '0e:09:b4:76:cc:94',
        '0e:09:b4:76:cc:ac',
        '12:09:b4:76:cc:94',
        '1a:09:b4:76:cc:94',
        '1a:09:b4:76:cc:ac'
    ];
    
    // become select sql attr like "ap0, ap3, ap5, ap7", [0, 3, 5, 7]
    let apStr = '';
    let apNum = [];

    // user's rssi corresponding serverBssid
    let mRssi = [];

    for (let i=0; i<rssi.length; i++) {
        let pos = serverBssid.indexOf(rssi[i].bssid);

        if (pos!=-1) {
            apStr += `ap${pos}, `;
            apNum.push(pos);
            mRssi.push(rssi[i].rssi);
        }
    }

    // delete apStr's last ch (,)
    apStr = apStr.slice(0, -2);
    
    // get Server's rssi
    let serverRssi = await mainDao.selectRssi(apStr);
    
    let mX, mY, min;

    // compare mRssi with serverRssi (Euclidean distance)
    for (let i=0; i<serverRssi.length; i++) {
        // get only ap{n} value by list
        let sRssi = getListByRow(serverRssi[i], apNum);

        // calculate cosine similarity
        let sim = getSimilarity(mRssi, sRssi);

        if(sim >= 0.5) {
            // compare distance
            let dst = getDistance(mRssi, sRssi);

            if (dst < min || i == 0) {
                min = dst;
                mX = serverRssi[i].x;
                mY = serverRssi[i].y;
            }
        }
        
    }

    return {x: mX, y: mY};
}

async function postCoordBefore(rssi){
    // get Server's BSSID 8
    let serverBssid = ['06:09:b4:76:cc:ac',
        '06:09:b4:76:cc:d4',
        '0a:09:b4:76:cc:94',
        '0e:09:b4:76:cc:94',
        '0e:09:b4:76:cc:ac',
        '12:09:b4:76:cc:94',
        '1a:09:b4:76:cc:94',
        '1a:09:b4:76:cc:ac'
    ];
    
    // become select sql attr like "ap0, ap3, ap5, ap7", [0, 3, 5, 7]
    let apStr = '';
    let apNum = [];

    // user's rssi corresponding serverBssid
    let mRssi = [];

    for (let i=0; i<rssi.length; i++) {
        let pos = serverBssid.indexOf(rssi[i].bssid);

        if (pos!=-1) {
            apStr += `ap${pos}, `;
            apNum.push(pos);
            mRssi.push(rssi[i].rssi);
        }
    }

    // delete apStr's last ch (,)
    apStr = apStr.slice(0, -2);
    
    // get Server's rssi
    let serverRssi = await mainDao.selectRssi(apStr);
    
    let mX, mY, min;

    // compare mRssi with serverRssi (Euclidean distance)
    for (let i=0; i<serverRssi.length; i++) {
        // get only ap{n} value by list
        let sRssi = getListByRow(serverRssi[i], apNum);

        // compare distance
        let dst = getDistance(mRssi, sRssi);

        if (dst < min || i == 0) {
            min = dst;
            mX = serverRssi[i].x;
            mY = serverRssi[i].y;
        }
    }

    return {x: mX, y: mY};
}

module.exports = {
    postCoord,
    postCoordBefore,
};
