import { useEffect, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import PlayButton from "./PlayButton";
import VideoPlayer from "./VideoPlayer";


function VideoContainer({ wsUrl }) {
    const [isVideoDisplayed, setIsVideoDisplayed] = useState(false)

    const _onShowStreamClicked = (event) => {
        setIsVideoDisplayed(true)
    }

    return (
        <div className="w-full">
            { isVideoDisplayed ? <VideoPlayer wsUrl={wsUrl}/> : <PlayButton onClick={_onShowStreamClicked}/> }
        </div>
    );
}

export default VideoContainer