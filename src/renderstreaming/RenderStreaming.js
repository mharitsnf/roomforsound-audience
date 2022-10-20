import { WebSocketDispatcher } from "./VideoPlayer";
import * as Logger from "../configs/logger"
import { Peer } from "./Peer";

function uuid4() {
    var temp_url = URL.createObjectURL(new Blob());
    var uuid = temp_url.toString();
    URL.revokeObjectURL(temp_url);
    return uuid.split(/[:/]/g).pop().toLowerCase(); // remove prefixes
}

export class RenderStreaming {

    constructor(signaling, config) {
        this._peer = null;
        this._connectionId = null;
        this.onConnect = function (connectionId) { console.log(`Connect peer on ${connectionId}.`); };
        this.onDisconnect = function (connectionId) { console.log(`Disconnect peer on ${connectionId}.`); };
        this.onGotOffer = function (connectionId) { console.log(`On got Offer on ${connectionId}.`); };
        this.onGotAnswer = function (connectionId) { console.log(`On got Answer on ${connectionId}.`); };
        this.onTrackEvent = function (data) { console.log(`OnTrack event peer with data:${data}`); };
        this.onAddChannel = function (data) { console.log(`onAddChannel event peer with data:${data}`); };

        this._config = config;
        this._signaling = signaling;
        this._signaling.addEventListener('connect', this._onConnect.bind(this));
        this._signaling.addEventListener('disconnect', this._onDisconnect.bind(this));
        this._signaling.addEventListener('offer', this._onOffer.bind(this));
        this._signaling.addEventListener('answer', this._onAnswer.bind(this));
        this._signaling.addEventListener('candidate', this._onIceCandidate.bind(this));
    }

    async _onConnect(e) {
        const data = e.detail
        console.log("Receive connect event from server: ", data)
        if (this._connectionId == data.connectionId) {
            this._preparePeerConnection(this._connectionId, data.polite)
            this.onConnect(data.connectionId);
        }
    }

    async _onDisconnect(e) {
        console.log("receive disconnect event")
        // const data = e.detail;
        // if (this._connectionId == data.connectionId) {
        //   this.onDisconnect(data.connectionId);
        //   if (this._peer) {
        //     this._peer.close();
        //     this._peer = null;
        //   }
        // }
    }

    async _onOffer(e) {
        console.log("receive offer event")
        // const offer = e.detail;
        // if (!this._peer) {
        //   this._preparePeerConnection(offer.connectionId, offer.polite);
        // }
        // const desc = new RTCSessionDescription({ sdp: offer.sdp, type: "offer" });
        // try {
        //   await this._peer.onGotDescription(offer.connectionId, desc);
        // } catch (error) {
        //   Logger.warn(`Error happen on GotDescription that description.\n Message: ${error}\n RTCSdpType:${desc.type}\n sdp:${desc.sdp}`);
        //   return;
        // }
    }

    async _onAnswer(e) {
        console.log("receive answer event")
        // const answer = e.detail;
        // const desc = new RTCSessionDescription({ sdp: answer.sdp, type: "answer" });
        // if (this._peer) {
        //   try {
        //     await this._peer.onGotDescription(answer.connectionId, desc);
        //   } catch (error) {
        //     Logger.warn(`Error happen on GotDescription that description.\n Message: ${error}\n RTCSdpType:${desc.type}\n sdp:${desc.sdp}`);
        //     return;
        //   }
        // }
    }

    async _onIceCandidate(e) {
        console.log("receive candidate event")
        // const candidate = e.detail;
        // const iceCandidate = new RTCIceCandidate({ candidate: candidate.candidate, sdpMid: candidate.sdpMid, sdpMLineIndex: candidate.sdpMLineIndex });
        // if (this._peer) {
        //   await this._peer.onGotCandidate(candidate.connectionId, iceCandidate);
        // }
    }

    async createConnection(connectionId) {
        this._connectionId = connectionId ? connectionId : uuid4();
        await this._signaling.createConnection(this._connectionId);
    }

    _preparePeerConnection(connectionId, polite) {
        if (this._peer) {
            console.log("Close current peer connection")
            this._peer.close()
            this._peer = null
        }

        // Create peerConnection with proxy server and set up handlers
        this._peer = new Peer(connectionId, polite, this._config);
        this._peer.addEventListener('disconnect', () => {
            this.onDisconnect(`Receive disconnect message from peer. connectionId:${connectionId}`);
        });
        this._peer.addEventListener('trackevent', (e) => {
            const data = e.detail;
            this.onTrackEvent(data);
        });
        this._peer.addEventListener('adddatachannel', (e) => {
            const data = e.detail;
            this.onAddChannel(data);
        });
        this._peer.addEventListener('ongotoffer', (e) => {
            const id = e.detail.connectionId;
            this.onGotOffer(id);
        });
        this._peer.addEventListener('ongotanswer', (e) => {
            const id = e.detail.connectionId;
            this.onGotAnswer(id);
        });
        this._peer.addEventListener('sendoffer', (e) => {
            const offer = e.detail;
            this._signaling.sendOffer(offer.connectionId, offer.sdp);
        });
        this._peer.addEventListener('sendanswer', (e) => {
            const answer = e.detail;
            this._signaling.sendAnswer(answer.connectionId, answer.sdp);
        });
        this._peer.addEventListener('sendcandidate', (e) => {
            const candidate = e.detail;
            this._signaling.sendCandidate(candidate.connectionId, candidate.candidate, candidate.sdpMid, candidate.sdpMLineIndex);
        });
        return this._peer;
    }

    /**
   * @param {string} label 
   * @returns {RTCDataChannel | null}
   */
    createDataChannel(label) {
        return this._peer.createDataChannel(this._connectionId, label);
    }

    async start() {
        await this._signaling.start()
    }

    async stop() {
        if (this._peer) {
            this._peer.close();
            this._peer = null;
        }

        if (this._signaling) {
            await this._signaling.stop();
            this._signaling = null;
        }
    }
}