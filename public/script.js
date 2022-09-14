const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const DEFAULT_CONFIG = {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		{
			urls: [
				"turn:eu-0.turn.peerjs.com:3478",
				"turn:us-0.turn.peerjs.com:3478",
			],
			username: "peerjs",
			credential: "peerjsp",
		},
	],
	sdpSemantics: "unified-plan",
};

const myPeer = new Peer(undefined, {
    // host: '/',
    // port: 10000,
    config: DEFAULT_CONFIG,
});

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

myPeer.on('open', function (id) {
    console.log(id);
    socket.emit('join_room', 10, id);
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(function (stream) {
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', userId => {
        // console.log('User connected: ' + userId);
        connectToNewUser(userId, stream);
    });
    
}).catch(function (error) {
    console.log(error);
});

socket.on('user-disconnected', userId => {
    //console.log('User disconnected: ' + userId);
    if (peers[userId]) peers[userId].close();
});


function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
        //console.log(userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });

    peers[userId] = call;
    console.log(peers[userId]);
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    //console.log(stream);
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}