import './App.css';
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast, { Toaster } from "react-hot-toast";

const APILink = "https://roomforsound-server.herokuapp.com"
// const APILink = "http://localhost:3500"


function App() {
  const [audienceId, setAudienceId] = useState("")
  const [audienceName, setAudienceName] = useState("")
  const navigate = useNavigate()

  const handleSubmitName = (newAudienceId, newAudienceName) => {
    setAudienceId(newAudienceId)
    setAudienceName(newAudienceName)
    navigate("message")
  }

  const resetAudience = () => {
    setAudienceId("")
    setAudienceName("")
  }

  return (
    <div className='mx-[10%] my-[2.5%] drop-shadow-lg font-raleway'>
      <Toaster containerStyle={{ position: "sticky" }} position='top-left' />

      <div className='flex w-full justify-center mt-[5rem] mb-[2rem]'>
        <h1 className='text-3xl'><b>Room For Sound?</b></h1>
      </div>

      <Routes>
        <Route path="/" element={<Name handleSubmitName={handleSubmitName} resetAudience={resetAudience} audienceId={audienceId} />} />
        <Route path="message" element={<Message audienceId={audienceId} audienceName={audienceName} />} />
      </Routes>

    </div>
  );
}

function Name({ handleSubmitName, resetAudience, audienceId }) {
  const [textBoxValue, setTextBoxValue] = useState("")

  useEffect(() => {
    if (audienceId !== "") {
      axios.delete(APILink + "/audiences", { params: { id: audienceId } }).then(response => console.log(response))
    }
    resetAudience()
  }, [])

  const handleSubmit = async event => {
    try {
      event.preventDefault()

      let response = await axios.post(APILink + "/audiences", { name: textBoxValue })
      handleSubmitName(response.data.data.id, response.data.data.name)

    } catch (error) {
      toast.error(error.response.data.message)
    }
  }

  return (
    <div className='my-[2%] mx-[2%] h-full shadow-2xl rounded-[1rem]'>
      <div className='p-[2.5rem] lg:px-[8rem]'>
        <p className='mb-[3rem]'>
          You can enter your name to participate as an audience in the game! You'll
          have the ability to send emotes and messages to the player. Have a try!
        </p>

        <div className='lg:flex lg:justify-center lg:mt-[2rem]'>
          <form onSubmit={handleSubmit} className="flex flex-col gap-[1rem] justify-center lg:w-[50%]">
            <p className='text-gray-500 text-xs'>Enter your name:</p>
            <input className='w-full h-[2rem] px-[.75rem] rounded' type="text" name="name" value={textBoxValue} onChange={event => setTextBoxValue(event.target.value)} />
            <button className='bg-green-400 text-gray-700 rounded-full p-[.5rem] drop-shadow-sm'>Submit</button>
          </form>
        </div>

      </div>
    </div>
  );
}

function Message({ audienceId, audienceName }) {
  const [textBoxValue, setTextBoxValue] = useState("")
  const navigate = useNavigate()

  useEffect(() => {

    const handleVisibilityChange = event => {
      event.preventDefault()
      if (document.visibilityState === 'hidden') {
        navigate("/")
      }
    }


    // window.addEventListener('beforeunload', handleTabClose)
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

export default App;
