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
    <div className='mx-[10%] my-[2.5%] drop-shadow-lg'>
      <div className='flex w-full justify-center'>
        <h1>Room For Sound?</h1>
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

  useEffect(() => {
    if (audienceId !== "") {
      axios.delete(APILink + "/audiences", { params: { id: audienceId } }).then(response => console.log(response))
    }
  }, [])

  const handleSubmit = async event => {
    try {
      event.preventDefault()
      let response = await axios.post(APILink + "/audiences", { name: textBoxValue })
      handleSubmitName(response.data.data.id, response.data.data.name)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name: <input type="text" name="name" value={textBoxValue} onChange={event => setTextBoxValue(event.target.value)} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}

function Message({ audienceId, audienceName }) {
  const [textBoxValue, setTextBoxValue] = useState("")
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
      let response = await axios.post(APILink + "/messages", { audienceId: audienceId, message: textBoxValue })
      setTextBoxValue("")
      alert("Message sent!")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <h1>Hello <b>{audienceName}</b>! Try sending: <i>"Wave"</i>, <i>"Dance"</i>, <i>"Idle"</i>, <i>"Clap"</i>, or <i>"Cheer"</i> for different actions!</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Message: <input type="text" name="name" value={textBoxValue} onChange={event => setTextBoxValue(event.target.value)} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default App;
