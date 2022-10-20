import { isCompositeComponent } from "react-dom/test-utils";

export class Peer extends EventTarget {

    constructor(connectionId, polite, config, resendIntervalMsec = 5000) {
        super()
        const _this = this
        this.connectionId = connectionId;
        this.polite = polite;
        this.config = config;
        this.pc = new RTCPeerConnection(this.config);
        console.log(this.pc)
        this.makingOffer = false;
        this.waitingAnswer = false;
        this.ignoreOffer = false;
        this.srdAnswerPending = false;
        this.log = str => void console.log(`[${_this.polite ? 'POLITE' : 'IMPOLITE'}] ${str}`);
        this.warn = str => void console.warn(`[${_this.polite ? 'POLITE' : 'IMPOLITE'}] ${str}`);
        this.assert_equals = window.assert_equals ? window.assert_equals : (a, b, msg) => { if (a === b) { return; } throw new Error(`${msg} expected ${b} but got ${a}`); };
        this.interval = resendIntervalMsec;
        this.sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

        this.pc.ontrack = e => {
            _this.log(`ontrack:${e}`);
            _this.dispatchEvent(new CustomEvent('trackevent', { detail: e }));
        };
        this.pc.ondatachannel = e => {
            _this.log(`ondatachannel:${e}`);
            _this.dispatchEvent(new CustomEvent('adddatachannel', { detail: e }));
        };
        this.pc.onicecandidate = ({ candidate }) => {
            _this.log(`send candidate:${candidate}`);
            if (candidate == null) {
                return;
            }
            _this.dispatchEvent(new CustomEvent('sendcandidate', { detail: { connectionId: _this.connectionId, candidate: candidate.candidate, sdpMLineIndex: candidate.sdpMLineIndex, sdpMid: candidate.sdpMid } }));
        };

        this.pc.onnegotiationneeded = this._onNegotiation.bind(this);

        this.pc.onsignalingstatechange = () => {
            _this.log(`signalingState changed:${_this.pc.signalingState}`);
        };

        this.pc.oniceconnectionstatechange = () => {
            _this.log(`iceConnectionState changed:${_this.pc.iceConnectionState}`);
            if (_this.pc.iceConnectionState === 'disconnected') {
                this.dispatchEvent(new Event('disconnect'));
            }
        };

        this.pc.onicegatheringstatechange = () => {
            _this.log(`iceGatheringState changed:${_this.pc.iceGatheringState}'`);
        };

        this.loopResendOffer();
    }

    async _onNegotiation() {
        try {
            this.log(`SLD due to negotiationneeded`);
            this.assert_equals(this.pc.signalingState, 'stable', 'negotiationneeded always fires in stable state');
            this.assert_equals(this.makingOffer, false, 'negotiationneeded not already in progress');
            this.makingOffer = true;
            await this.pc.setLocalDescription();
            this.assert_equals(this.pc.signalingState, 'have-local-offer', 'negotiationneeded not racing with onmessage');
            this.assert_equals(this.pc.localDescription.type, 'offer', 'negotiationneeded SLD worked');
            this.waitingAnswer = true;
            this.dispatchEvent(new CustomEvent('sendoffer', { detail: { connectionId: this.connectionId, sdp: this.pc.localDescription.sdp } }));
        } catch (e) {
            this.log(e);
        } finally {
            this.makingOffer = false;
        }
    }

    async loopResendOffer() {
        while (this.connectionId) {
            if (this.pc && this.waitingAnswer) {
                this.dispatchEvent(new CustomEvent('sendoffer', { detail: { connectionId: this.connectionId, sdp: this.pc.localDescription.sdp } }));
            }
            await this.sleep(this.interval);
            console.log("resending offer...")
        }
    }

    createDataChannel(connectionId, label) {
        if (this.connectionId != connectionId) {
            return null;
        }

        return this.pc.createDataChannel(label);
    }

}