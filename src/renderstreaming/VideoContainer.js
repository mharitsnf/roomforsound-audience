import { useEffect, useState } from "react";
import VideoPlayer from "./VideoPlayer";

let supportsSetCodecPreferences = null

function VideoPrep({ onShowStreamClicked, setSelectedCodec }) {

    const showCodecSelect = () => {
        let codecPreferences = document.getElementById('codecPreferences');
        supportsSetCodecPreferences = window.RTCRtpTransceiver && 'setCodecPreferences' in window.RTCRtpTransceiver.prototype;

        if (!supportsSetCodecPreferences) {
            alert("!Does not support codec preferences!")
            return;
        }

        if (document.querySelector("#codecPreferences option")) return

        const option = document.createElement('option');
        option.value = ""
        option.innerText = "Default";
        codecPreferences.appendChild(option);
        setSelectedCodec(option)

        const codecs = RTCRtpSender.getCapabilities('video').codecs;
        codecs.forEach(codec => {
            if (['video/red', 'video/ulpfec', 'video/rtx'].includes(codec.mimeType)) {
                return;
            }
            const option = document.createElement('option');
            option.value = (codec.mimeType + ' ' + (codec.sdpFmtpLine || '')).trim();
            option.innerText = option.value;
            codecPreferences.appendChild(option);
        });

        codecPreferences.disabled = false;
    }

    useEffect(() => {
        showCodecSelect()
    }, [])

    return (
        <div className="flex flex-col gap-[1rem]">
            <select className="" id="codecPreferences" title="Codec Selection" onChange={event => setSelectedCodec(event.target.selectedOptions[0])} disabled />
            <button className="bg-green-500 rounded p-[1rem] text-white" onClick={onShowStreamClicked}>
                Show Stream
            </button>
        </div>
    )
}


function VideoContainer({ wsUrl }) {
    const [isVideoDisplayed, setIsVideoDisplayed] = useState(false)
    const [selectedCodec, setSelectedCodec] = useState(0)

    const onShowStreamClicked = (event) => {
        setIsVideoDisplayed(true)
    }

    return (
        <div className="w-full flex flex-col my-[2rem]">
            {
                isVideoDisplayed ?
                    <VideoPlayer wsUrl={wsUrl} selectedCodec={selectedCodec} supportsSetCodecPreferences={supportsSetCodecPreferences} setIsVideoDisplayed={setIsVideoDisplayed} /> :
                    <VideoPrep onShowStreamClicked={onShowStreamClicked} setSelectedCodec={setSelectedCodec} />
            }
        </div>
    );
}

export default VideoContainer