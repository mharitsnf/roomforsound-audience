import './App.css';
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast, { Toaster } from "react-hot-toast";
import Name from './pages/name';
import Message from './pages/message';

// export const APILink = "https://roomforsound-server.herokuapp.com"
export const APILink = "http://localhost:3500"


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

export default App;
