import { useEffect, useState } from "react"
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket"
import { RenderStreaming } from "./RenderStreaming"
import { WebSocketDispatcher } from "./WebSocketDispatcher"
import { BaseVideoPlayer } from "./BaseVideoPlayer"

let wsDispatcher = null
let renderStreaming = null
let vp = null

function getRTCConfiguration() {
    let config = {};
    config.sdpSemantics = 'unified-plan';
    config.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }];
    return config;
}

function VideoPlayer({ wsUrl, selectedCodec, supportsSetCodecPreferences }) {

    const setupVideoPlayer = () => {
        vp = new BaseVideoPlayer()
        const videoContainer = document.getElementById("videoContainer")
        const lockMouseCheck = document.getElementById("lockMouseCheck")
        vp.createPlayer(videoContainer, lockMouseCheck)
    }

    const setupRenderStreaming = async (websocket) => {
        wsDispatcher = new WebSocketDispatcher(websocket)
        renderStreaming = new RenderStreaming(wsDispatcher, getRTCConfiguration())
        renderStreaming.onConnect = rsOnConnect
        renderStreaming.onDisconnect = rsOnDisconnect
        renderStreaming.onTrackEvent = (data) => { vp.addTrack(data.track) }
        renderStreaming.onGotOffer = setCodecPreferences

        await renderStreaming.start()
        await renderStreaming.createConnection()
    }

    const rsOnConnect = () => {
        const channel = renderStreaming.createDataChannel("input")
        vp.setupInput(channel)
    }

    const rsOnDisconnect = async () => {
        await renderStreaming.stop()
        renderStreaming = null
        wsDispatcher.isWsOpen = false
        wsDispatcher = null
        vp.deletePlayer()
    }

    const setCodecPreferences = () => {
        /** @type {RTCRtpCodecCapability[] | null} */
        let selectedCodecs = null
        if (supportsSetCodecPreferences) {
            const preferredCodec = selectedCodec
            if (preferredCodec.value !== '') {
                const [mimeType, sdpFmtpLine] = preferredCodec.value.split(' ')
                const { codecs } = RTCRtpSender.getCapabilities('video')
                const selectedCodecIndex = codecs.findIndex(c => c.mimeType === mimeType && c.sdpFmtpLine === sdpFmtpLine)
                const selectCodec = codecs[selectedCodecIndex]
                selectedCodecs = [selectCodec]
            }
        }

        if (selectedCodecs == null) {
            return
        }

        const transceivers = renderStreaming.getTransceivers().filter(t => t.receiver.track.kind == "video")
        if (transceivers && transceivers.length > 0) {
            transceivers.forEach(t => t.setCodecPreferences(selectedCodecs))
        }
    }

    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket,
    } = useWebSocket(wsUrl, {
        onOpen: async () => {
            setupVideoPlayer()
            await setupRenderStreaming(getWebSocket())
        },

        onClose: () => {
            wsDispatcher.isWsOpen = false
        },

        onMessage: (event) => {
            const msg = JSON.parse(event.data);
            if (!msg) return

            console.log(msg)

            switch (msg.type) {
                case "connect":
                    wsDispatcher.customDispatch("connect", { detail: msg })
                    break
                case "disconnect":
                    wsDispatcher.customDispatch("disconnect", { detail: msg })
                    break
                case "offer":
                    wsDispatcher.customDispatch("offer", { detail: { connectionId: msg.from, sdp: msg.data.sdp, polite: msg.data.polite } })
                    break
                case "answer":
                    wsDispatcher.customDispatch('answer', { detail: { connectionId: msg.from, sdp: msg.data.sdp } })
                    break
                case "candidate":
                    wsDispatcher.customDispatch('candidate', { detail: { connectionId: msg.from, candidate: msg.data.candidate, sdpMLineIndex: msg.data.sdpMLineIndex, sdpMid: msg.data.sdpMid } })
                    break
                default:
                    break
            }
        },

        //Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: (closeEvent) => true,
    });

    return (
        <div id="videoContainer" className="w-full flex flex-col">
            <div className="flex gap-[2rem]">
                <span>Lock cursor to player: </span>
                <input type="checkbox" id="lockMouseCheck"></input>
            </div>
            <select id="codecPreferences" disabled>
                <option selected value="">Default</option>
            </select>
        </div>
    )
}

export default VideoPlayer