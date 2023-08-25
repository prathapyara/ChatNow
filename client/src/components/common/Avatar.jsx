import React, { useEffect, useState } from "react";
import Image from "next/image";
import {FaCamera} from "react-icons/fa";
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";


function Avatar({type,image,setImage}) {
  const [hover,setHover]=useState(false);
  const [isContextMenuVisible,setIsContextMenuVisible]=useState(false);
  const [contextMenuCordinates,setcontextMenuCordinates]=useState({x:0,y:0});
  const [grabPhoto,setgrabPhoto]=useState(false);
  const [showPhototLibrary,setShowPhotoLibrary]=useState(false);
  const [showCapturePhoto,setShowCapturePhoto]=useState(false);

  const showContextMenu=(e)=>{
    e.preventDefault();
    setIsContextMenuVisible(true);
    setcontextMenuCordinates({ x: e.pageX, y: e.pageY });
  }

  useEffect(()=>{
    if(grabPhoto){
      const data=document.getElementById("photo-picker");
      data.click();
      document.body.onfocus=(e)=>{
        setTimeout(()=>{
          setgrabPhoto(false);
        },1000) 
      }
    }
  },[grabPhoto])

  const contextMenuOptions =[
   {
    name:"Take Photo",callback:()=>{
      setShowCapturePhoto(true);
    }},
   {
    name:"Choose From Library",callback:()=>{
      setShowPhotoLibrary(true);
   }},
   {
    name:"Upload Photo",callback:()=>{
    setgrabPhoto(true);
   }},
   {
    name:"Remove Photo",callback:()=>{
    setImage("/default_avatar.png")
   }}
  ]

  const photoPickerChange=(e)=>{
    const file=e.target.files[0];
    console.log(file);
    const reader=new FileReader();
    const data=document.createElement("img");
    console.log(data);
    reader.onload=function(event){
      data.src=event.target.result;
      //data.setAttribute("alt","avatarImage");
      data.setAttribute("data-src",event.target.result);
    };
    reader.readAsDataURL(file);
    setTimeout(()=>{
      setImage(data.src);
    },100);

  };

  return( <>
    <div className="flex items-center justify-center">
      {type =="sm" && (
        <div className="relative h-10 w-10">
          <Image src={image} className="rounded-full" fill />
        </div>
      )}
      {type =="lg" && (
        <div className="relative h-14 w-14">
          <Image src={image} className="rounded-full" fill />
        </div>
      )}
      {type =="xl" && (
        <div className="relative cursor-pointer z-0" onMouseEnter={()=>{setHover(true)}} onMouseLeave={()=>{setHover(false)}} >
          <div className={`z-10 bg-photopicker-overlay-background h-60 w-60 absolute top-0 left-0 items-center justify-center flex flex-col gap-3 rounded-full text-center gap-2" ${hover?"visible":"hidden"}`} 
              onClick={e=>showContextMenu(e) } 
              id="context-opener">
            <FaCamera className="text-2xl " 
              onClick={e=>showContextMenu(e) } 
              id="context-opener" />
            <span onClick={e=>showContextMenu(e) } 
                id="context-opener">Change <br/> Profile <br/> Photo</span>
          </div>
          <div className="flex items-center justify-center h-60 w-60 " >
            <Image src={image} className="rounded-full" fill />
          </div>
        </div>
      )}
      
    </div>
    {isContextMenuVisible && (<ContextMenu 
        options={contextMenuOptions}
        cordinates={contextMenuCordinates}
        contextMenu={isContextMenuVisible}
        setContextMenu={setIsContextMenuVisible}
      />
    )}
    {showPhototLibrary && (
       <PhotoLibrary 
         setImage={setImage} 
         hidePhotoLibrary={setShowPhotoLibrary}
         />)}
    {grabPhoto && <PhotoPicker onChange={photoPickerChange}/>}
    {showCapturePhoto && (<CapturePhoto setImage={setImage} hide={setShowCapturePhoto}/>)}
  </>
  );
}

export default Avatar;
