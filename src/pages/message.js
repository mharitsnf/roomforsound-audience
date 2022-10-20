import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";
import { protocols, domains } from "../App"
import VideoContainer from '../renderstreaming/VideoContainer';

function Message({ audienceId, audienceName }) {
    const [textBoxValue, setTextBoxValue] = useState("")
    const navigate = useNavigate()

    let APILink = protocols.http + domains.local
    let wsUrl = protocols.ws + domains.local

    useEffect(() => {
        const handleVisibilityChange = event => {
            event.preventDefault()
            if (document.visibilityState === 'hidden') {
                navigate("/")
            }
        }

        window.addEventListener('visibilitychange', handleVisibilityChange)

        if (!audienceId) {
            navigate("/")
        }

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange)
        }

    }, [])

    const handleSubmit = async event => {
        try {
            event.preventDefault()

            await axios.post(APILink + "/messages", { audienceId: audienceId, message: textBoxValue })

            setTextBoxValue("")
            toast.success("Message sent!")

        } catch (error) {
            toast.error(error.response.data.message)
            console.log(error.response.status)

            if (error.response.status === 404) {
                // Audience not exist in server
                navigate("/")
                return
            }
        }
    }

    const handleEmoteButtons = (message, emoji) => {
        axios.post(APILink + "/messages", { audienceId: audienceId, message: message })
            .then(res => toast("Emote sent!", { icon: emoji }))
            .catch(error => {
                toast.error(error.response.data.message)

                if (error.response.status === 404) {
                    navigate("/")
                    return
                }
            })
    }

    return (
        <div className='my-[2%] mx-[2%] h-full shadow-2xl rounded-[1rem]'>
            <div className='p-[2.5rem] lg:px-[8rem]'>
                <div className='flex justify-center'>
                    <p className='text-xl'>Hello <b>{audienceName}</b>!</p>
                </div>

                <VideoContainer wsUrl={wsUrl} />

                <div className='w-full my-[4rem] flex lg:flex-none flex-col lg:grid lg:grid-cols-5 gap-[1rem]'>
                    <button className='bg-gradient-to-r from-blue-400 to-indigo-600 rounded w-full py-[1rem] px-[1rem] text-white grid grid-cols-4 gap-[1rem] text-lg'
                        onClick={_ => handleEmoteButtons("Wave", "👋")}
                    >
                        <span>👋</span>
                        <span className='col-span-2'><b>Wave</b></span>
                    </button>
                    <button className='bg-gradient-to-r from-green-400 to-yellow-400 rounded w-full py-[1rem] px-[1rem] text-white grid grid-cols-4 gap-[1rem] text-lg'
                        onClick={_ => handleEmoteButtons("Dance", "🕺")}
                    >
                        <span>🕺</span>
                        <span className='col-span-2'><b>Dance</b></span>
                    </button>
                    <button className='bg-gradient-to-r from-teal-400 to-teal-700 rounded w-full py-[1rem] px-[1rem] text-white grid grid-cols-4 gap-[1rem] text-lg'
                        onClick={_ => handleEmoteButtons("Idle", "🧍‍♂️")}
                    >
                        <span>🧍‍♂️</span>
                        <span className='col-span-2'><b>Idle</b></span>
                    </button>
                    <button className='bg-gradient-to-r from-rose-500 to-rose-300 rounded w-full py-[1rem] px-[1rem] text-white grid grid-cols-4 gap-[1rem] text-lg'
                        onClick={_ => handleEmoteButtons("Clap", "👏")}
                    >
                        <span>👏</span>
                        <span className='col-span-2'><b>Clap</b></span>
                    </button>
                    <button className='bg-gradient-to-r from-red-400 to-orange-400 rounded w-full py-[1rem] px-[1rem] text-white grid grid-cols-4 gap-[1rem] text-lg'
                        onClick={_ => handleEmoteButtons("Cheer", "🙌")}
                    >
                        <span>🙌</span>
                        <span className='col-span-2'><b>Cheer</b></span>
                    </button>
                    <button className='bg-gradient-to-r from-red-700 to-pink-500 rounded w-full py-[1rem] px-[1rem] text-white grid grid-cols-4 gap-[1rem] text-lg'
                        onClick={_ => handleEmoteButtons("Firework", "🎆")}
                    >
                        <span>🎆</span>
                        <span className='col-span-2'><b>Fireworks</b></span>
                    </button>
                    <button className='bg-gradient-to-r from-pink-400 to-rose-600 rounded w-full py-[1rem] px-[1rem] text-white grid grid-cols-4 gap-[1rem] text-lg'
                        onClick={_ => handleEmoteButtons("Heart", "🤍")}
                    >
                        <span>🤍</span>
                        <span className='col-span-2'><b>Hearts</b></span>
                    </button>
                </div>

                <p>You can also send any message you want, it will be displayed on the screen!</p>

                <div className='lg:flex lg:justify-center lg:mt-[2rem]'>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-[1rem] justify-center my-[2rem] lg:w-[50%]">
                        <p className='text-gray-500 text-xs'>Enter message:</p>
                        <input className='w-full h-[2rem] px-[.75rem] rounded' type="text" name="name" value={textBoxValue} onChange={event => setTextBoxValue(event.target.value)} />
                        <button className='bg-blue-400 text-white rounded-full p-[.5rem] drop-shadow-sm'>Send message</button>
                    </form>
                </div>

            </div>
        </div>
    );
}

export default Message