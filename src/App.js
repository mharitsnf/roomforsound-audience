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

  useEffect(() => {
    console.log("Hellow")
  }, [])

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
        <Route path="/" element={<FillName handleSubmitName={handleSubmitName} />} />
        <Route path="message" element={<FillMessage audienceId={audienceId} audienceName={audienceName} />} />
      </Routes>

    </div>
  );
}

function FillName({ handleSubmitName }) {
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

function FillMessage({ audienceId, audienceName }) {
  return (
    <div>
      <h1>Hello {audienceName} with ID {audienceId}!</h1>
    </div>
  );
}

export default App;
