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

async function postCoord(rssi){
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
            apStr += `ap${pos},`;
            apNum.push(pos);
            mRssi.push(rssi[i].rssi);
        }
    }

    // delete apStr's last ch (,)
    apStr = apStr.slice(0, -1);
    
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

async function postRoute(node){

    // 서버에서 NODE 정보 받아오기
    let serverRoute = await mainDao.selectRoute();

    // 그래프 만들기
    const Graph = require('node-dijkstra');
    const graph = new Map();

    let start, end;
    let distance; // (출발지 좌표 <-> DB 좌표) 거리
    let min = 10000; // (출발지 좌표 - DB 좌표) 최소값

    for(let i=0; i<serverRoute.length; i++) {

        // (좌표 -> 노드)로 변환
        if(serverRoute[i].z == node.z1) {
            // 출발지 좌표 근처의 노드를 찾아 출발지로 설정
            // 출발지 좌표와 DB 좌표를 비교했을때 거리가 가장 작은 좌표 찾기
            distance = (Math.abs(node.x1 - serverRoute[i].x))**2 + (Math.abs(node.y1 - serverRoute[i].y))**2;
            if(min > distance) {
                min = distance;
                start = serverRoute[i].node_idx;
            }
        }
        if(serverRoute[i].x == node.x2 && serverRoute[i].y == node.y2 && serverRoute[i].z == node.z2) {
            end = serverRoute[i].node_idx;
        }

        // 좌표 1개랑 연결된거 한개씩 push
        let temp = new Map();
        
        if(serverRoute[i].connect_a != null) {
            temp.set(String(serverRoute[i].connect_a), serverRoute[i].weight_a);
        }
        if(serverRoute[i].connect_b != null) {
            temp.set(String(serverRoute[i].connect_b), serverRoute[i].weight_b);
        }
        if(serverRoute[i].connect_c != null) {
            temp.set(String(serverRoute[i].connect_c), serverRoute[i].weight_c);
        }
        if(serverRoute[i].connect_d != null) {
            temp.set(String(serverRoute[i].connect_d), serverRoute[i].weight_d);
        }
        
        // graph에 temp 추가
        graph.set(String(serverRoute[i].node_idx), temp);
    }

    const route = new Graph(graph);
    // console.log(start, end);
    // console.log(route.path(String(start), String(end)));
    
    // 경로: 노드idx -> 좌표로 변환
    let path = route.path(String(start), String(end));
    let routeCoord = [];

    for(let i=0; i<path.length; i++) {
        for(let j=0; j<serverRoute.length; j++) {
            if(serverRoute[j].node_idx == path[i]) {
                routeCoord.push({x : serverRoute[j].x, y : serverRoute[j].y, z : serverRoute[j].z});
                break;
            }
        }
    }
    
    return routeCoord;
}

module.exports = {
    postCoord,
    postRoute,
};
