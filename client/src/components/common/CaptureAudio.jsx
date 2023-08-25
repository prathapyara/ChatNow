import { useStateProvider } from "@/context/StateContext";
import { ADD_AUDIO_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { userAgent } from "next/server";
import React, { useState,useRef, useEffect } from "react";
import { FaMicrophone, FaPauseCircle, FaPlay, FaStop, FaTrash } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";
import axios from "axios";
import { reducerCases } from "@/context/constants";

function CaptureAudio({hide}) {

  const[{userInfo,currentChatUser,socket},dispatch]=useStateProvider();

  const [isRecording,setIsRecording]=useState(false);
  const [recordedAudio, setRecordedAudio]=useState(null);
  const [waveform,setWaveform]=useState(null);
  const [recordingDuration,setRecordingDuration]=useState(0);
  const [currentPlaybackTime,setCurrentPlaybacktime]=useState(0);
  const [totolDuration,setTotalDuration]=useState(0);
  const [isPlaying,setIsPlaying]=useState(false);
  const [renderedAudio,setRenderedAudio]=useState(null);

  const audioRef=useRef(null);
  const mediaRecorderRef=useRef(null);
  const waveFromRef=useRef(null);

  useEffect(()=>{
    let interval;
    if(isRecording){
      interval=setInterval(()=>{
        setRecordingDuration((prevDuration)=>{
          setTotalDuration(prevDuration+1);
          return prevDuration+1;
        });
      },1000);
    }
    return ()=>{
      clearInterval(interval);
    }

  },[isRecording])

  useEffect(()=>{
    const wavesurfer=WaveSurfer.create({
      container:waveFromRef.current,
      waveColor:"#ccc",
      progressColor:"#4a9eff",
      cursorColor:"#7ae3c3",
      barWidth:2,
      height:30,
      responsive:true,
    });
    setWaveform(wavesurfer);
    wavesurfer.on("finish",()=>{
      setIsPlaying(false);
    })

    return ()=>{
      wavesurfer.destroy();
    }
  },[]);
  
  useEffect(()=>{
    if(waveform){
      handleStartRecording();
    }
  },[waveform])

  const handleStartRecording=()=>{
    setRecordingDuration(0);
    setCurrentPlaybacktime(0);
    setTotalDuration(0);
    setIsRecording(true);
    setRecordedAudio(null);
    navigator.mediaDevices.getUserMedia({audio:true}).then((stream)=>{
      const mediaRecorder=new MediaRecorder(stream);
      mediaRecorderRef.current=mediaRecorder;
      audioRef.current.srcObject=stream;

      const chunks=[];
      mediaRecorder.ondataavailable=(e)=>chunks.push(e.data);
      mediaRecorder.onstop=()=>{
        const blob=new Blob(chunks,{type:"audio/webm;codecs=opus"});
        const audioURL=URL.createObjectURL(blob);
        const audio=new Audio(audioURL);
        setRecordedAudio(audio);
        waveform.load(audioURL);
      };
      mediaRecorder.start();
      console.log(chunks);
    }).catch(err=>{
      console.log(err);
    })
  }
  const handleStopRecording=()=>{
   if(mediaRecorderRef.current && isRecording){
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    waveform.stop();

    const audioChucks=[];
    mediaRecorderRef.current.addEventListener("dataavalible",(event)=>{
      audioChucks.push(event.data);
    });
    mediaRecorderRef.current.addEventListener("stop",()=>{
      const audioBlob=new Blob(audioChucks,{type:"audio/mp3"});
      const audioFile=new File([audioBlob],"recording.mp3");
      setRenderedAudio(audioFile);
    })
    
   }
  }

  useEffect(()=>{
    if(recordedAudio){
      const updatePlaybackTime=()=>{
        setCurrentPlaybacktime(recordedAudio.currentTime);
      }
      recordedAudio.addEventListener("timeupdate",updatePlaybackTime);
      return ()=>{
        recordedAudio.removeEventListener("timeupdate",updatePlaybackTime);
      }
    }
  },[recordedAudio]);

  const handlePlayRecoridng=()=>{
    if(recordedAudio){
      waveform.stop();
      waveform.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };

  const handlePauseRecoridng=()=>{
    waveform.stop();
    recordedAudio.pause();
    setIsPlaying(false);
  };

  const sendRecording=async()=>{
    
    try{
      console.log(renderedAudio);
      const formData=new FormData();
      formData.append("audio",renderedAudio);
      const response=await axios.post(ADD_AUDIO_MESSAGE_ROUTE,formData,{
        headers:{
          "Content-Type":"multipart/form-data",
        },
        params:{
          from:userInfo.id,
          to:currentChatUser.id,
        },
      });

      console.log(response.data.message);

      if(response.status===201){
        socket.current.emit("send-message",{
          from:userInfo?.id,
          to:currentChatUser?.id,
          message:response.data.message,
        });
        dispatch({
          type:reducerCases.ADD_MESSAGE,
          newMessage:{
            ...response.data.message,
          },
          fromSelf:true,
        });
      }

    }catch(err){
      console.log(err);
    }
  }

  const formateTime=(time)=>{
    if(isNaN(time)) return "00:00";
    const minutes=Math.floor(time/60);
    const seconds=Math.floor(time%60);
    return `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`
  };

  return ( 
  <div className="flex text-2xl w-full justify-end items-center">
    <div className="pt-1">
      <FaTrash className="text-panel-header-icon" onClick={()=>hide()}/> 
    </div>
    <div className="mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg">
      {isRecording? (
        <div className="text-red-500 animate-pulse w-60 text-center">
            Recording<span>{recordingDuration}</span>
        </div>
        ):(<div>{recordedAudio && (
           <>
           {!isPlaying? (
            <FaPlay onClick={handlePlayRecoridng} />
            ):(
              <FaStop onClick={handlePauseRecoridng}/>
            )}
          </>
        )}
        </div>
      )}
      <div className="w-60" ref={waveFromRef} hidden={isRecording} />
      {recordedAudio && isPlaying && (
          <span>{formateTime(currentPlaybackTime)}</span>
      )}
      {recordedAudio && !isPlaying && (
        <span>{formateTime(totolDuration)}</span>
      )}
      <audio ref={audioRef} hidden />
    </div>
    <div className="mr-4">
      {!isRecording ? (
        <FaMicrophone 
          className="text-red-500"
          onClick={handleStartRecording}
          />
      ):(
        <FaPauseCircle 
          className="text-red-500"
          onClick={handleStopRecording}
          />
      )
      }
    </div>
    <div>
      <MdSend
        className="text-panel-header-icon cursor-pointer mr-4"
        title="send"
        onClick={sendRecording}
        />
    </div> 
  </div>
  );
}


export default CaptureAudio;
