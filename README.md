# 항비게이션

### 설치

* Node.js 설치 (Window + MacOS 전용)
1. https://nodejs.org/ko/ 에 접속해 Node.js 설치

* Node.js 설치 (Linux)
1. `sudo apt-get install curl`
2. `curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash –`
3. `sudo apt-get install -y nodejs`

### 서버 실행

1. Node.js 프로젝트 폴더 안으로 들어간다. `cd [path]/Hangvigation_Server`
2. command창에서 `npm install` 를 입력한다. 
   * 필요한 모듈 설치
3. 이어서 `npm start` 를 입력하여 프로젝트를 실행한다.

<br/>

### 외부 네트워크에서 접속

일반적으로 외부 네트워크에서 로컬 서버로 접속이 불가능한데, 이를 가능하게 해주는 ngrok앱을 설치해보도록 하자.

1. command창에서 `npm install -g ngrok` 를 입력한다.

   * ngrok 앱 설치
2. Node.js 프로젝트 폴더 안으로 이동한다. `cd [path]/Hangvigation_Server`
3. `npm start` 를 입력하여 로컬 서버에서 프로젝트를 실행한다.
4. `ngrok http 3030 --region ap` 를 입력한다.

![image-20200131224725265](https://user-images.githubusercontent.com/18085486/73544524-b4500d00-447c-11ea-83ca-89dbd4d03216.png)

5. 외부 네트워크에서 위 사진의 Forwarding에 해당하는 url로 접속할 수 있다.


