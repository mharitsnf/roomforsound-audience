import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from "react-hot-toast";
import { protocols, domains } from "../App"


function Name({ handleSubmitName, resetAudience, audienceId }) {
    const [textBoxValue, setTextBoxValue] = useState("")

    let APILink = protocols.http + domains.local

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

export default Name