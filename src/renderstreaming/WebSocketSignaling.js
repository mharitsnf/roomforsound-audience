import { io } from "socket.io-client";

export class WebSocketSignaling extends EventTarget {
    constructor(wsUrl) {
        super()
        this.sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

        this.websocket = io(wsUrl)
        this.isWsOpen = false

        this.websocket.on("connect", () => {
            console.log("Connection to server opened")
            this.isWsOpen = true
            this.websocket.emit("message", { message: "Hello from client" })
        })

        this.websocket.on("disconnect", () => {
            console.log("Connection to server closed")
            this.isWsOpen = false
            this.websocket.emit("message", { message: "Goodbye from client" })
        })

        this.websocket.on("message", msg => {
            console.log("Message from server: ", msg)
        })

        this.websocket.on("serverConnect", msg => {
            this.dispatchEvent(new CustomEvent('connect', { detail: msg }))
        })

        this.websocket.on("serverDisconnect", msg => {
            this.dispatchEvent(new CustomEvent('disconnect', { detail: msg }))
        })

        this.websocket.on("offer", msg => {
            this.dispatchEvent(new CustomEvent('offer', { detail: { connectionId: msg.from, sdp: msg.data.sdp, polite: msg.data.polite } }))
        })

        this.websocket.on("answer", msg => {
            this.dispatchEvent(new CustomEvent('answer', { detail: { connectionId: msg.from, sdp: msg.data.sdp } }))
        })

        this.websocket.on("candidate", msg => {
            this.dispatchEvent(new CustomEvent('candidate', { detail: { connectionId: msg.from, candidate: msg.data.candidate, sdpMLineIndex: msg.data.sdpMLineIndex, sdpMid: msg.data.sdpMid } }))
        })
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
        const sendJson = { connectionId: connectionId };
        console.log(sendJson)
        this.websocket.emit("serverConnect", sendJson)
    }

    sendOffer(connectionId, sdp) {
        const data = { 'sdp': sdp, 'connectionId': connectionId };
        const sendJson = { from: connectionId, data: data };
        console.log(sendJson);
        this.websocket.emit("offer", sendJson);
    }
}