import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Chat from "./Chat/Chat";
import Empty from "./Empty";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { CHECK_USER_ROUTE,GET_ALL_USER, GET_MESSAGES_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import { reducerCases } from "@/context/constants";
import {io} from "socket.io-client";
import {HOST} from "@/utils/ApiRoutes"
import SearchMessages from "./Chat/SearchMessages";
import VideoCall from "./Call/VideoCall";
import VoiceCall from "./Call/VoiceCall";
import IncomingCall from "./common/IncomingCall";
import IncomingVideoCall from "./common/IncomingVideoCall";

function Main() {
  
  const router=useRouter();
  const [{userInfo,currentChatUser,messages,searchMessages,videoCall,voiceCall,incomingVoiceCall,incomingVideoCall},dispatch]=useStateProvider();
  const [redirectLogin,setRedirectLogin]=useState(false);
  const socket=useRef();
  const [socketEvent,setSocketEvent]=useState(false);
  
  useEffect(()=>{
    if(redirectLogin) router.push("/login");

  },[redirectLogin])

  onAuthStateChanged(firebaseAuth,async(currentUser)=>{
    if(!currentUser)setRedirectLogin(true);
    if(!userInfo && currentUser?.email){
      const {data}=await axios.post(CHECK_USER_ROUTE,{
        email:currentUser.email,
      });

      if(!data.status){
        router.push("/onboarding");
      }

      if(data.data.id){
        const {id,name,email,profilePicture:profileImage,about}=data.data;
        dispatch({
         type:reducerCases.SET_USER_INFO,
         userInfo:{
          id,
          name,
          email,
          profileImage,
          status:about,
        },
    });

      }
    }  
  });
  
  useEffect(()=>{
    if(userInfo){
      socket.current=io(HOST);
      socket.current.emit("add-user",userInfo.id);
      dispatch({
        type:reducerCases.SET_SOCKET,socket
      })
    }
  },[userInfo]);

  useEffect(()=>{
    
    if(socket.current && !socketEvent){

      socket.current.on("msg-recieved",(data)=>{
        dispatch({
          type:reducerCases.ADD_MESSAGE,newMessage:{...data.message,},
        });
      });
    
      socket.current.on("incoming-voice-call",(from,roomId,callType)=>{
        dispatch({
          type:reducerCases.SET_INCOMING_VOICE_CALL,
          incomingVoiceCall:{...from,roomId,callType},
        });
      });

      socket.current.on("incoming-video-call",(from,roomId,callType)=>{
        dispatch({
          type:reducerCases.SET_INCOMING_VIDEO_CALL,
          incomingVideoCall:{...from,roomId,callType},
        });
      });

      socket.current.on("voice-call-rejected",()=>{
        dispatch({
          type:reducerCases.END_CALL,
        })
      })

      socket.current.on("video-call-rejected",()=>{
        dispatch({
          type:reducerCases.END_CALL,
        })
      })

      socket.current.on("online-users",({onlineUsers})=>{
        dispatch({
          type:reducerCases.SET_ONLINE_USERS,
          onlineUsers,
        });
      });

      setSocketEvent(true);
    }

  },[socket.current]);

  useEffect(()=>{
    const getMessages = async()=>{
      const {data:{messages}}=await axios.get(`${GET_MESSAGES_ROUTE}/${userInfo?.id}/${currentChatUser?.id}`);
      dispatch({
        type:reducerCases.SET_MESSAGES,
        messages:messages,
      })
    }
    if(currentChatUser?.id){
      getMessages();
    }
  },[currentChatUser]);
 
  return (<>

  {
    incomingVoiceCall && <IncomingCall />
  }

  {
    incomingVideoCall && <IncomingVideoCall />
  }

    {
      videoCall &&( 
        <div className="h-screen w-screen max-h-full overflow-hidden"> 
          <VideoCall />
        </div>
        )
    }

    {
      voiceCall &&( 
        <div className="h-screen w-screen max-h-full overflow-hidden"> 
          <VoiceCall />
        </div>
        )
    }

    {
      !videoCall && !voiceCall && (
        <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-screen">
       <ChatList /> 
       {
        currentChatUser? (<div className={searchMessages? "grid grid-cols-2":"grid-cols-2"}> <Chat/> 
        {
          searchMessages && <SearchMessages />
        }  
        </div>)
         : <Empty />
       }
       </div>
      )
    }
  </>);
}

export default Main;
