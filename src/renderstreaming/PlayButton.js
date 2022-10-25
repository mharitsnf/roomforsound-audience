
function PlayButton({ onClick }) {

    return (
        <button
            className="bg-green-500 rounded w-[25%] p-[1rem] text-white" 
            onClick={onClick}
        >
            <span>Show Stream</span>
        </button>
    )
}

export default PlayButton