import './App.css';
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useEffect, useState } from 'react';

// const APILink = "https://roomforsound-server.herokuapp.com"
const APILink = "http://localhost:3500"


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
        <Route path="/" element={<Name handleSubmitName={handleSubmitName} />} />
        <Route path="message" element={<Message audienceId={audienceId} audienceName={audienceName} />} />
      </Routes>

    </div>
  );
}

function Name({ handleSubmitName }) {
  const [textBoxValue, setTextBoxValue] = useState("")

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

  useEffect(() => {
    
    const handleTabClose = event => {
      event.preventDefault()
      axios.delete(APILink + "/audiences", { params: { id: audienceId } })
      .then(response => console.log(response))
    }

    window.addEventListener('beforeunload', handleTabClose)

    return () => {
      window.removeEventListener('beforeunload', handleTabClose)
    }

  }, [])

  return (
    <div>
      <h1>Hello {audienceName} with ID {audienceId}!</h1>
    </div>
  );
}

export default App;
