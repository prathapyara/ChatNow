import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { MdOutlineCallEnd } from "react-icons/md";
import { reducerCases } from "@/context/constants";
import axios from "axios";
import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

function Container({data}) {
  const [{socket,userInfo,videoCall},dispatch]=useStateProvider();
  const [callAccepted,setCallAccepted]=useState(false);
  const [token,setToken]=useState(undefined);
  const [zgVar,setZgVar]=useState(undefined);
  const [localStream,setLocalStream]=useState(undefined);
  const [publishStream, setPublishStream]=useState(undefined);

  useEffect(()=>{
    if(data.type==="out-going"){
      socket.current.on("accept-call",()=>{
        setCallAccepted(true); 
      })
    }else{
      setTimeout(()=>{
        setCallAccepted(true);
      },1000);
    }
  },[data]);

  useEffect(()=>{
    const getToken =async()=>{
      try{
      const {data:{token:returnedToken}}=await axios.get(`${GET_CALL_TOKEN}/${userInfo.id}`);
      setToken(returnedToken);
    }catch(err){
      console.log(err);
    }
  }
  if(callAccepted){
    getToken();
  }
  
},[callAccepted]);

useEffect(()=>{
  
  const startCall=async()=>{
    
    
    import("zego-express-engine-webrtc").then(async({ZegoExpressEngine})=>{
      
      const zg=new ZegoExpressEngine(
        process.env.NEXT_PUBLIC_ZEGO_APP_ID,
        process.env.NEXT_PUBLIC_ZEGO_SERVER_ID,
        );
        setZgVar(zg);
        
        zg.on("roomStreamUpdate",async(roomID,updateType,streamList,extendedData)=>{
          if(updateType==="ADD"){
            const rmVideo=document.getElementById("remote-video");
            const vd=document.createElement(data.callType==="video"?"video":"audio");
            vd.id=streamList[0].streamID;
            vd.className="h-32 w-40";
            vd.autoplay=true;
            vd.playsInline=true;
            vd.muted=false;
            if(rmVideo){
              rmVideo.appendChild(vd);
            }
            zg.startPlayingStream(streamList[0].streamID,{
              audio:true,
              video:true,
            }).then((stream)=>{
              vd.srcObject=stream;
            });

          }else if(updateType==="DELETE" && zg  && streamList[0].streamID){
            //zg.destroyStream(localStream);
            zg.stopPublishingStream(streamList[0].streamID);
            zg.logoutRoom("zego-room");
            dispatch({type:reducerCases.END_CALL});
          }
        });

       await zg.loginRoom(
          "zego-room",
          token,
          {userID:userInfo.id.toString(),userName:userInfo.name},
          {userUpdate:true}
        );

        const localStream=await zg.createStream({
          camera:{
            audio:true,
            video:data.callType==="video" ? true:false,
          },
        });
      
        const localVideo=document.getElementById("local-audio");

        const videoElement=document.createElement(
          data.callType==="video"?"video":"audio"
        );
        videoElement.id="video-local-zego";
        videoElement.className="h-32 w-40";
        videoElement.autoplay=true;
        videoElement.muted=false;
        videoElement.playsInline=true;
        localVideo.appendChild(videoElement);

        const td=document.getElementById("video-local-zego");
        td.srcObject=localStream;

        const streamID="123"+Date.now();

        setPublishStream(streamID);
        setLocalStream(localStream);
        zg.startPublishingStream(streamID,localStream);
    }
    );
  };
  if(token){
    startCall();
  }
},[token]);
  
const endCall=()=>{
  const id=data.id;
  if(zgVar && localStream && publishStream){
    zgVar.destroyStream(localStream);
    zgVar.stopPublishingStream(publishStream);
    zgVar.logoutRoom("zego-room");
  }
  if(data.callType==="voice"){
    socket.current.emit("reject-voice-call",{
      from:id,
    });
  }else{
    socket.current.emit("reject-video-call",{
      from:id,
    });
  }
  dispatch({type:reducerCases.END_CALL});
}

  return (
  <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col justify-center h-[100vh] items-center text-white">
    <div className="flex flex-col gap-2 items-center">
      <span className="text-5xl">{data.name}</span>
      <span className="text-lg">
       {
         callAccepted && data.callType!=="video" ? "On going call":"calling"
       }
     </span>
     </div>
     {
      (!callAccepted || data.callType==="voice") && (<div className="my-24">
        <Image src={data.profilePicture} alt="avatar" height={300} width={300} className="rounded-full"/></div>
     )}
     <div className="flex flex-col gap-3 items-center justify-center">
       <div  id="remote-video" ></div>
       <div  id="local-audio"></div>
       <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
        <MdOutlineCallEnd className="text-3xl cursor-pointer" onClick={endCall}/>
       </div>
     </div>
  </div>
  );
}

export default Container;
