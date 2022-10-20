import { render } from "@testing-library/react"
import { useEffect, useState } from "react"
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket"
import * as Logger from "../configs/logger"
import { RenderStreaming } from "./RenderStreaming"
import { WebSocketSignaling } from "./WebSocketSignaling"

function VideoPlayer({ wsUrl }) {
    const [signaling, setSignaling] = useState(null)
    const [renderStreaming, setRenderSteraming] = useState(null)
    const [srcObject, setSrcObject] = useState(new MediaStream())

    const _onLoadedVideo = (event) => {
        const videoElement = document.getElementById("videoplayer")
        videoElement.play()
    }

    const setupRenderStreaming = async () => {
        const wsSignaling = new WebSocketSignaling(wsUrl)
        const config = {}
        const rs = new RenderStreaming(wsSignaling, config)

        await rs.start()
        await rs.createConnection()

        setSignaling(wsSignaling)
        setRenderSteraming(rs)
    }

    useEffect(() => {
        const handleVisibilityChange = async event => {
            event.preventDefault()
            if (document.visibilityState === 'hidden' && signaling) {
                await signaling.stop()
            }
        }

        window.addEventListener('visibilitychange', handleVisibilityChange)

        setupRenderStreaming()

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

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