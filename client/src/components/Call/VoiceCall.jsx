import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useStateProvider } from "@/context/StateContext";
const Container=dynamic(()=>import("./Container"),{ssr:false});

function VoiceCall() {
  const [{voiceCall,userInfo,socket,incomingVoiceCall},dispatch]=useStateProvider();
  
  useEffect(()=>{
    if(voiceCall.type==="out-going"){
      socket.current.emit("outgoing-voice-call", {
        to:voiceCall.id,
        from:{
          id:userInfo.id,
          profilePicture:userInfo.profileImage,
          name:userInfo.name,
        },
        callType:voiceCall.callType,
        roomId:voiceCall.roomId,
      });
    }
  },[voiceCall]);

  //console.log(incomingVoiceCall);

  return (<Container data={voiceCall}/>);
}

export default VoiceCall;
