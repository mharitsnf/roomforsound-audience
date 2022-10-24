
export class WebSocketDispatcher extends EventTarget {
    constructor(websocket) {
        super()
        this.sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
        this.connectionId = null
        this.isWsOpen = true
        this.websocket = websocket
    }

    customDispatch(type, payload) {
        this.dispatchEvent(new CustomEvent(type, payload))
    }

    get interval() {
        return 100
    }

    async start() {
        while (!this.isWsOpen) {
            await this.sleep(100);
        }
    }

    async stop() {
        this.websocket.close()
        while (this.isWsOpen) {
            await this.sleep(100);
        }
    }

    createConnection(connectionId) {
        const sendJson = { type: "connect", connectionId: connectionId };
        this.websocket.send(JSON.stringify(sendJson))
    }

    deleteConnection(connectionId) {
        const sendJson = JSON.stringify({ type: "disconnect", connectionId: connectionId });
        this.websocket.send(sendJson);
    }

    sendOffer(connectionId, sdp) {
        const data = { 'sdp': sdp, 'connectionId': connectionId };
        const sendJson = { type: "offer", from: connectionId, data: data };
        this.websocket.send(JSON.stringify(sendJson))
    }

    sendAnswer(connectionId, sdp) {
        const data = { 'sdp': sdp, 'connectionId': connectionId };
        const sendJson = JSON.stringify({ type: "answer", from: connectionId, data: data });
        this.websocket.send(sendJson);
    }

    sendCandidate(connectionId, candidate, sdpMLineIndex, sdpMid) {
        const data = {
            'candidate': candidate,
            'sdpMLineIndex': sdpMLineIndex,
            'sdpMid': sdpMid,
            'connectionId': connectionId
        };
        const sendJson = JSON.stringify({ type: "candidate", from: connectionId, data: data });
        this.websocket.send(sendJson);
    }
}