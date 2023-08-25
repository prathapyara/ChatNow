
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { GET_ALL_CONTACTS } from "@/utils/ApiRoutes";
import { initializeApp } from "firebase/app";
import React, { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import {BiSearchAlt2} from "react-icons/bi";
import axios, { all } from "axios";
import ChatLIstItem from "./ChatLIstItem";


function ContactsList() {
  const [allContacts,setAllContacts]=useState([]);
  const [searchTerm,setSearchTerm]=useState("");
  const [searchContacts,setSearchContacts]=useState([]);
  const [{},dispatch]=useStateProvider();

  useEffect(()=>{
    if(searchTerm.length>0){
      const filteredData={};
      const test=[2,4,5,7];
      Object.keys(allContacts).forEach((key)=>{
        filteredData[key]=allContacts[key].filter((obj)=>{
          return obj.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    
      console.log(filteredData);
      setSearchContacts(filteredData);
    }else{
      setSearchContacts(allContacts);
    }
  },[searchTerm]);
  

  useEffect(()=>{
    const getContacts=async ()=>{
      try{
      const{data: {users},}=await axios.get(GET_ALL_CONTACTS);
      setAllContacts(users);
      setSearchContacts(users);
      }
    catch(err){
      console.log(err);
    }
  };
  getContacts();
  },[])
  
  return (
    <div className="h-full flex flex-col">
      <div className="h-24 flex items-end px-3 py-4">
        <div className="flex items-center gap-12 text-white">
          <BiArrowBack 
            className="cursor-pointer text-xl"
            onClick={()=>dispatch({type:reducerCases.SET_ALL_CONTACTS_PAGE})}
          />
          <span>New Chat</span>
        </div>
      </div>
      <div className="bg-search-input-container-background h-full flexauto overflow-auto custom-scrollbar">
        <div className="flex py- items-center gap-3 h-14">
         <div className="bg-panel-header-background flex items-center gap-5 px-3 py-1 rounded-lg flex-grow mx-4">
          <div>
            <BiSearchAlt2 
              className="text-panel-header-icon cursor-pointer text-l"
             />
          </div>
          <div>
            <input 
               type="text" 
               placeholder="search Contacts" 
               className="bg-transparent text-sm focus:outline-none text-white w-full" 
               value={searchTerm}
               onChange={(e)=>setSearchTerm(e.target.value)}
               />
           </div>
          </div>
        </div>
        {
        Object.entries(searchContacts).map(([intialLetter,userList]) => {
         return (userList.length>0 && (
          <div key={Date.now()+intialLetter}>
            {userList.length>0 && <div className="text-teal-light pl-10 py-5">{intialLetter}</div>}
            {
              userList.map(contact=>{
                return (
                  <ChatLIstItem 
                    data={contact}
                    isContactPage={true}
                    key={contact.id}
                  />
                )
              })
            }
          </div>
         )
        );
       })
      }
      </div>  
    </div>
    );
}

export default ContactsList;
