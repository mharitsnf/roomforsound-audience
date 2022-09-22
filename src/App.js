import './App.css';
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useEffect, useState } from 'react';

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

  return (
    <div className='mx-[10%] my-[2.5%] drop-shadow-lg font-raleway'>
      <div className='flex w-full justify-center mt-[5rem] mb-[2rem]'>
        <h1 className='text-3xl'><b>Room For Sound?</b></h1>
      </div>

      <Routes>
        <Route path="/" element={<Name handleSubmitName={handleSubmitName} audienceId={audienceId} />} />
        <Route path="message" element={<Message audienceId={audienceId} audienceName={audienceName} />} />
      </Routes>

    </div>
  );
}

function Name({ handleSubmitName, audienceId }) {
  const [textBoxValue, setTextBoxValue] = useState("")
  const [isNameValid, setIsNameValid] = useState(true)

  useEffect(() => {
    if (audienceId !== "") {
      axios.delete(APILink + "/audiences", { params: { id: audienceId } }).then(response => console.log(response))
    }
  }, [])

  const handleSubmit = async event => {
    try {
      event.preventDefault()

      if (textBoxValue === "") {
        setIsNameValid(false)
        return
      }

      setIsNameValid(true)

      let response = await axios.post(APILink + "/audiences", { name: textBoxValue })
      handleSubmitName(response.data.data.id, response.data.data.name)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='my-[2%] mx-[2%] h-full shadow-2xl rounded-[1rem]'>
      <div className='p-[2.5rem]'>
        <p className='mb-[3rem]'>
          You can enter your name to participate as an audience in the game! You'll
          have the ability to send emotes and messages to the player. Have a try!
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-[1rem] justify-center">
          <p className='text-gray-500 text-xs'>Enter your name:</p>
          <input className='w-full lg:w-[25%] h-[2rem] px-[.75rem] rounded' type="text" name="name" value={textBoxValue} onChange={event => setTextBoxValue(event.target.value)} />
          <p className={`${isNameValid ? 'hidden' : ''} text-red-500 text-xs`}>Your name cannot be empty!</p>
          <button className='bg-green-400 text-gray-700 rounded-full p-[.5rem] drop-shadow-sm'>Submit</button>
        </form>
      </div>
    </div>
  );
}

function Message({ audienceId, audienceName }) {
  const [textBoxValue, setTextBoxValue] = useState("")
  const [isMessageValid, setIsMessageValid] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {

    const handleTabClose = async event => {
      event.preventDefault()
      await axios.delete(APILink + "/audiences", { params: { id: audienceId } })
    }

    window.addEventListener('beforeunload', handleTabClose)

    if (!audienceId) {
      navigate("/")
    }

    return () => {
      window.removeEventListener('beforeunload', handleTabClose)
    }

  }, [])

  const handleSubmit = async event => {
    try {
      event.preventDefault()

      if (textBoxValue === "") {
        setIsMessageValid(false)
        return
      }

      setIsMessageValid(true)

      let response = await axios.post(APILink + "/messages", { audienceId: audienceId, message: textBoxValue })

      setTextBoxValue("")

    } catch (error) {
      console.log(error)
    }
  }

  const handleEmoteButtons = async (message) => {
    try {
      await axios.post(APILink + "/messages", { audienceId: audienceId, message: message })
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className='my-[2%] mx-[2%] h-full shadow-2xl rounded-[1rem]'>
      <div className='p-[2.5rem]'>
        <div className='flex justify-center'>
          <p className='text-xl'>Hello <b>{audienceName}</b>!</p>
        </div>

        <div className='w-full my-[4rem] flex flex-col gap-[1rem]'>
          <button className='bg-gradient-to-r from-blue-400 to-indigo-600 rounded w-full py-[1rem] px-[1rem] text-white grid grid-cols-4 gap-[1rem] text-lg'
          onClick={_ => handleEmoteButtons("Wave")}
          >
            <span>👋</span>
            <span className='col-span-2'><b>Wave</b></span>
          </button>
          <button className='bg-gradient-to-r from-green-400 to-yellow-400 rounded w-full py-[1rem] px-[1rem] text-white grid grid-cols-4 gap-[1rem] text-lg'
          onClick={_ => handleEmoteButtons("Dance")}
          >
            <span>🕺</span>
            <span className='col-span-2'><b>Dance</b></span>
          </button>
          <button className='bg-gradient-to-r from-teal-400 to-teal-700 rounded w-full py-[1rem] px-[1rem] text-white grid grid-cols-4 gap-[1rem] text-lg'
          onClick={_ => handleEmoteButtons("Idle")}
          >
            <span>🧍‍♂️</span>
            <span className='col-span-2'><b>Idle</b></span>
          </button>
          <button className='bg-gradient-to-r from-rose-500 to-rose-300 rounded w-full py-[1rem] px-[1rem] text-white grid grid-cols-4 gap-[1rem] text-lg'
          onClick={_ => handleEmoteButtons("Clap")}
          >
            <span>👏</span>
            <span className='col-span-2'><b>Clap</b></span>
          </button>
          <button className='bg-gradient-to-r from-red-400 to-orange-400 rounded w-full py-[1rem] px-[1rem] text-white grid grid-cols-4 gap-[1rem] text-lg'
          onClick={_ => handleEmoteButtons("Cheer")}
          >
            <span>🙌</span>
            <span className='col-span-2'><b>Cheer</b></span>
          </button>
        </div>

        <p>You can also send any message you want, it will be displayed on the screen!</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[1rem] justify-center my-[2rem]">
          <p className='text-gray-500 text-xs'>Enter message:</p>
          <input className='w-full lg:w-[25%] h-[2rem] px-[.75rem] rounded' type="text" name="name" value={textBoxValue} onChange={event => setTextBoxValue(event.target.value)} />
          <p className={`${isMessageValid ? 'hidden' : ''} text-red-500 text-xs`}>Message cannot be empty!</p>
          <button className='bg-blue-400 text-white rounded-full p-[.5rem] drop-shadow-sm'>Send message</button>
        </form>
      </div>
    </div>
  );
}

export default App;
