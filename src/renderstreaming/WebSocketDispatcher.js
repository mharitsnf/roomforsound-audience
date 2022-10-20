
export class WebSocketDispatcher extends EventTarget {
    constructor(sendMessage) {
        super()
        this.sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
        this.connectionId = null
        this.isWsOpen = false
        this.sendMessage = sendMessage
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
        this.sendMessage(JSON.stringify(sendJson))
    }

    sendOffer(connectionId, sdp) {
        const data = { 'sdp': sdp, 'connectionId': connectionId };
        const sendJson = { type: "offer", from: connectionId, data: data };
        this.sendMessage(JSON.stringify(sendJson))
    }
}