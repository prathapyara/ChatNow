import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect } from "react";
import ChatLIstItem from "./ChatLIstItem";

function List() {

  const [{userInfo,userContacts,filteredContacts,socket},dispatch]=useStateProvider();

  useEffect(()=>{
   const getContacts=async ()=>{
    try{
      const {data:{users,onlineUsers}}=await axios.get(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`);
      
      dispatch({type:reducerCases.SET_USER_CONTACTS,userContacts:users});
      dispatch({type:reducerCases.SET_ONLINE_USERS,onlineUsers});
    }catch(err){
      console.log(err);
    }
   } 
   if(userInfo?.id){
    getContacts();
   }
  },[userInfo]);

  console.log(userContacts);

  return (
  <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custum-scrollbar">
  {
    filteredContacts && filteredContacts.length>0 ? 
    (filteredContacts.map((contact)=><ChatLIstItem data={contact} key={contact.id}/>)):
    (userContacts.map((contact)=><ChatLIstItem data={contact} key={contact.id}/>))
  }
  </div>
  );
}

export default List;
