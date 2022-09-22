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

  return (
    <div className='my-[2%] mx-[2%] h-full shadow-2xl rounded-[1rem]'>
      <div className='p-[2.5rem]'>
        <p className='mb-[1rem]'>Hello <b>{audienceName}</b>!</p>
        <p className='mb-[3rem]'>Try sending: <i>Wave</i>, <i>Dance</i>, <i>Idle</i>, <i>Clap</i>, or <i>Cheer</i> for different actions... or you can say anything you want!</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-[1rem] justify-center">
          <p className='text-gray-500 text-xs'>Enter message:</p>
          <input className='w-full lg:w-[25%] h-[2rem] px-[.75rem] rounded' type="text" name="name" value={textBoxValue} onChange={event => setTextBoxValue(event.target.value)} />
          <p className={`${isMessageValid ? 'hidden' : ''} text-red-500 text-xs`}>Message cannot be empty!</p>
          <button className='bg-blue-400 text-white rounded-full p-[.5rem] drop-shadow-sm'>Send message</button>
        </form>
      </div>
    </div>

    // <div>
    //   <h1>Hello <b>{audienceName}</b>! Try sending: <i>"Wave"</i>, <i>"Dance"</i>, <i>"Idle"</i>, <i>"Clap"</i>, or <i>"Cheer"</i> for different actions... or you can say anything you want!</h1>
    //   <form onSubmit={handleSubmit}>
    //     <label>
    //       Message: <input type="text" name="name" value={textBoxValue} onChange={event => setTextBoxValue(event.target.value)} />
    //     </label>
    //     <button className='rounded-full' type="submit">Submit</button>
    //   </form>
    // </div>
  );
}

export default App;
