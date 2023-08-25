import { useStateProvider } from "@/context/StateContext";
import React from "react";
import Image from "next/image";
import { reducerCases } from "@/context/constants";

function IncomingVideoCall() {
  const [{incomingVideoCall,socket,userInfo,videoCall},dispatch]=useStateProvider();
  console.log(videoCall);
  const acceptCall=()=>{
    dispatch({
      type:reducerCases.SET_VIDEO_CALL,
      videoCall:{...incomingVideoCall.from,roomId:Date.now(),callType:"video",type:"in-coming"},
  });
    socket.current.emit("accept-incoming-call",{id:incomingVideoCall.from.id});
    dispatch({
      type:reducerCases.SET_INCOMING_VIDEO_CALL,
      incomingVideoCall:undefined,
  });
  };

 

  const rejectCall=()=>{
    socket.current.emit("reject-voice-call",{from:incomingVideoCall.from.id});
    dispatch({type:reducerCases.END_CALL});
  }

  return (<div className="h-24 w-80 fixed bottom-8 right-6 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
    <div>
      <Image 
      src ={incomingVideoCall.from.profilePicture} 
      alt="Avatar"
      width={70}
      height={70}
      className="rounded-full" 
      />
    </div>

    <div>
      <div>{incomingVideoCall.from.name}</div>
        <div className="text-xs">Incoming Video Call</div>
        <div className="flex gap-2 mt-2">
          <button 
            className="bg-red-500 p-1 px-3 text-sm rounded-full"
            onClick={rejectCall}>
            Reject
          </button>
          <button 
            className="bg-green-500 p-1 px-3 text-sm rounded-full"
            onClick={acceptCall}>
            Accept
          </button>
        </div>
    </div>
  </div>);
}

export default IncomingVideoCall;
