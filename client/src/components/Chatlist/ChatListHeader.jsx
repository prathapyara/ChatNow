import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext.jsx";
import {BsFillChatLeftTextFill,BsThreeDotsVertical} from "react-icons/bs";
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";
import { useRouter } from "next/router";

function ChatListHeader() {
  const router=useRouter();
  const [{userInfo,contactsPage},dispatch]=useStateProvider();

  const [contextMenuCordinates,setContextMenuCordinates]=useState({
    x:0,
    y:0,
  });
  const [isContextMenuVisible,setIsContextMenuVisible]=useState(false);
  
  const showContextMenu=(e)=>{
    e.preventDefault();
    setContextMenuCordinates({x:e.pageX-50,y:e.pageY+20});
    setIsContextMenuVisible(true);
  }

  const contextMenuOptions=[
    {name:"LogOut",
    callback:async()=>{ 
      setIsContextMenuVisible(false);
      router.push("/logout");
    },
    },
  ];
  
  const handleAllContactsPage=()=>{
    dispatch(
      {type:reducerCases.SET_ALL_CONTACTS_PAGE,})
  }


  return ( 
  <div className="h-16 px-4 py-3 flex justify-between items-center">
     <div className="cursor-pointer"> 
     
       <Avatar type="sm" image={userInfo?.profileImage}/>
     </div>
     <div className="flex gap-6">
      <BsFillChatLeftTextFill 
        className="text-panel-header-icon cursor-pointer" title="Menu"
        onClick={handleAllContactsPage}
      />
      <>
        <BsThreeDotsVertical 
          className="text-panel-header-icon cursor-pointer" title="Menu" onClick={(e)=>showContextMenu(e)} id="context-opener"
        />
        {
        isContextMenuVisible && (
          <ContextMenu 
            options={contextMenuOptions}
            cordinates={contextMenuCordinates}
            contextMenu={isContextMenuVisible}
            setContextMenu={setIsContextMenuVisible}
          />
        )
      }
      </>
     </div>
  </div>
)};

export default ChatListHeader;
