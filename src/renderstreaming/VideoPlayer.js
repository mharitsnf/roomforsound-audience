import { render } from "@testing-library/react"
import { useEffect, useState } from "react"
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket"
import * as Logger from "../configs/logger"
import { RenderStreaming } from "./RenderStreaming"
import { WebSocketDispatcher } from "./WebSocketDispatcher"
import { WebSocketSignaling } from "./WebSocketSignaling"

function VideoPlayer({ wsUrl }) {
    const [wsDispatcher, setWsDispatcher] = useState(null)
    const [renderStreaming, setRenderStreaming] = useState(null)

    const _onLoadedVideo = (event) => {
        const videoElement = document.getElementById("videoplayer")
        videoElement.play()
    }

    const setupRenderStreaming = async (wsd) => {
        const rs = new RenderStreaming(wsd, {})
        setRenderStreaming(rs)

        await rs.start()
        await rs.createConnection()
    }

    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket,
    } = useWebSocket(wsUrl, {
        onOpen: () => {
            let wsd = new WebSocketDispatcher(sendMessage)
            wsd.isWsOpen = true
            setWsDispatcher(wsd)

            setupRenderStreaming(wsd)

            sendMessage(JSON.stringify({ message: "Hello from client!" }))
            console.log("Connected to server")
        },

        onClose: () => {
            if (wsDispatcher) {
                wsDispatcher.isWsOpen = false
                setWsDispatcher(null)
            }

            sendMessage(JSON.stringify({ message: "Goodbye from client!" }))
            console.log("Disconnected from server")
        },
        
        onMessage: (event) => {
            const msg = JSON.parse(event.data);
            if (!msg) return

            console.log(msg)

            switch(msg.type) {
                case "connect":
                    wsDispatcher.customDispatch("connect", { detail: msg })
                    break
                case "disconnect":
                    break
                case "offer":
                    break
                case "answer":
                    break
                case "candidate":
                    break
                default:
                    break
            }
        },

        //Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: (closeEvent) => true,
    });

    return (
        <video
            className="w-full"
            id="videoplayer"
            style={{ touchAction: "none" }}
            playsInline={true}
            onLoadedMetadata={_onLoadedVideo}
        />
    )
}

export default VideoPlayer



// Old Videoplayer
// function VideoPlayer({ wsUrl }) {
//     // const [signaling, setSignaling] = useState(null)
//     // const [renderStreaming, setRenderSteraming] = useState(null)
//     // const [srcObject, setSrcObject] = useState(new MediaStream())

//     const _onLoadedVideo = (event) => {
//         const videoElement = document.getElementById("videoplayer")
//         videoElement.play()
//     }

//     const {
//         sendMessage,
//         sendJsonMessage,
//         lastMessage,
//         lastJsonMessage,
//         readyState,
//         getWebSocket,
//     } = useWebSocket(wsUrl, {
//         onOpen: () => {

//         },

//         onClose: () => {

//         },
        
//         onMessage: () => {

//         },

//         //Will attempt to reconnect on all close events, such as server shutting down
//         shouldReconnect: (closeEvent) => true,
//     });

//     // const setupRenderStreaming = async () => {
//     //     const wsSignaling = new WebSocketSignaling(wsUrl)
//     //     const config = {}
//     //     const rs = new RenderStreaming(wsSignaling, config)

//     //     await rs.start()
//     //     await rs.createConnection()

//     //     setSignaling(wsSignaling)
//     //     setRenderSteraming(rs)
//     // }

//     // useEffect(() => {
//     //     const handleVisibilityChange = async event => {
//     //         event.preventDefault()
//     //         if (document.visibilityState === 'hidden' && signaling) {
//     //             await signaling.stop()
//     //         }
//     //     }

//     //     window.addEventListener('visibilitychange', handleVisibilityChange)

//     //     setupRenderStreaming()

//     //     return () => {
//     //         window.removeEventListener('visibilitychange', handleVisibilityChange)
//     //     }
//     // }, [])

//     return (
//         <video
//             className="w-full"
//             id="videoplayer"
//             style={{ touchAction: "none" }}
//             playsInline={true}
//             onLoadedMetadata={_onLoadedVideo}
//         />
//     )
// }