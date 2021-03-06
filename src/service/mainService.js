const mainDao = require('../dao/mainDao');
const request = require('request-promise-native');
const {appKey} = require('../../config/appKey');

// get Server's BSSID 8
const serverBssid3 = [
    '06:09:b4:76:cc:ac',
    '06:09:b4:76:cc:d4',
    '0a:09:b4:76:cc:94',
    '0e:09:b4:76:cc:94',
    '0e:09:b4:76:cc:ac',
    '12:09:b4:76:cc:94',
    '1a:09:b4:76:cc:94',
    '1a:09:b4:76:cc:ac'
];
const serverBssid4 = [
    '06:09:b4:76:cc:a4',
    '00:09:b4:76:df:4c',
    '00:09:b4:76:cc:8c',
    '12:09:b4:76:cc:a4',
    '06:09:b4:76:df:4c'
];


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

function chkFloor(rssi) {
    let apStr3 = '';
    let apStr4 = '';
    let apNum3 = [];
    let apNum4 = [];
    let mRssi3 = [];
    let mRssi4 = [];

    for (let i=0; i<rssi.length; i++) {
        let pos = serverBssid3.indexOf(rssi[i].bssid);

        if (pos!=-1) {
            apStr3 += `ap${pos},`;
            apNum3.push(pos);
            mRssi3.push(rssi[i].rssi);
        }
    }

    for (let i=0; i<rssi.length; i++) {
        let pos = serverBssid4.indexOf(rssi[i].bssid);

        if (pos!=-1) {
            apStr4 += `ap${pos},`;
            apNum4.push(pos);
            mRssi4.push(rssi[i].rssi);
        }
    }

    if (apNum3.length <= apNum4.length)
        return {floor: 4, apStr: apStr4, apNum: apNum4, mRssi: mRssi4}
    else
        return {floor: 3, apStr: apStr3, apNum: apNum3, mRssi: mRssi3}
}

async function postCoord(rssi){
    const obj = chkFloor(rssi);
    console.log('floor'+obj.floor);
    // become select sql attr like "ap0, ap3, ap5, ap7", [0, 3, 5, 7]
    let apStr = obj.apStr;
    let apNum =  obj.apNum;

    // user's rssi corresponding serverBssid
    let mRssi = obj.mRssi;
    let floor = obj.floor;
    
    // delete apStr's last ch (,)
    apStr = apStr.slice(0, -1);
    
    if (apStr == '') {
        return {x: 0, y: 0, z: 0};
    }
    // get Server's rssi
    let serverRssi = await mainDao.selectRssi(apStr, floor);
    
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
            mZ = serverRssi[i].z;
        }
    }

    return {x: mX, y: mY, z: floor};
}

async function postRoute(node){

    // 서버에서 NODE 정보 받아오기
    let serverRoute = await mainDao.selectRoute();

    // 그래프 만들기
    const Graph = require('node-dijkstra');
    const graph = new Map();

    let start, end;
    let distanceStart, distanceEnd; // (출발지 좌표 <-> DB 좌표) 거리
    let minStart = 10000, minEnd = 10000; // (출발지 좌표 - DB 좌표) 최소값

    for(let i=0; i<serverRoute.length; i++) {

        // (좌표 -> 노드)로 변환
        if(serverRoute[i].z == node.z1) {
            // 출발지 좌표 근처의 노드를 찾아 출발지로 설정
            // 출발지 좌표와 DB 좌표를 비교했을때 거리가 가장 작은 좌표 찾기
            distanceStart = (Math.abs(node.x1 - serverRoute[i].x))**2 + (Math.abs(node.y1 - serverRoute[i].y))**2;
            if(minStart > distanceStart) {
                minStart = distanceStart;
                start = serverRoute[i].node_idx;
            }

            distanceEnd = (Math.abs(node.x2 - serverRoute[i].x))**2 + (Math.abs(node.y2 - serverRoute[i].y))**2;
            if(minEnd > distanceEnd) {
                minEnd = distanceEnd;
                end = serverRoute[i].node_idx;
            }
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

async function postOutdoor(coord) {

    let headers = {};
    headers["appKey"] = appKey;

    let object = {
        startX : coord.x1,
        startY : coord.y1,
        endX : coord.x2,
        endY : coord.y2,
        startName : "출발지",
        endName : "도착지",
        // reqCoordType : "WGS84GEO",
        // resCoordType : "EPSG3857"
    };

    let route = [];

    let options = {
        headers : headers,
        method : "POST",
        async : false,
        uri : "https://apis.openapi.sk.com/tmap/routes/pedestrian",
        body : object,
        json : true
    };
    await request(options)
        .then(function(body){
            for(let i=0; i<body.features.length; i++) {
                if(body.features[i].geometry.type == "Point") {
                    route.push({"type" : body.features[i].geometry.type, 
                                "x" : body.features[i].geometry.coordinates[0],
                                "y" : body.features[i].geometry.coordinates[1]});
                }
                else {
                    for(let j=0; j<body.features[i].geometry.coordinates.length; j++) {
                        route.push({"type" : body.features[i].geometry.type, 
                                    "x" : body.features[i].geometry.coordinates[j][0],
                                    "y" : body.features[i].geometry.coordinates[j][1]});
                    }
                }
            }
            
            // route에 총거리, 총소요시간 추가 (안드에서 받을때 편하려고 x,y로 바꿈)
            route.push({"type" : 'Properties',
                        "x" : body.features[0].properties.totalDistance,
                        "y" : Math.round(body.features[0].properties.totalTime / 60)}); // 초->분
            return route;
        })
        .catch(function(err){
            console.log(err);
        });
    
    
    console.log(route);
    return route;
}

module.exports = {
    postCoord,
    postRoute,
    postOutdoor,
};
