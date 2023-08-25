import { privateDecrypt } from "crypto";
import getPrismaInstance from "../utils/PrismaClient.js";
import {renameSync} from "fs";
export const addMessage=async(req,res,next)=>{
    try{
        const {message,from,to}=req.body;
        const prisma=getPrismaInstance();
        const getUser=onlineUsers.get(to);
        if(message && from && to){
            const newMessage=await prisma.messages.create({
                data:{
                    message,
                    sender:{connect:{id:parseInt(from)}},
                    reciever:{connect:{id:parseInt(to)}},
                    messageStatus:getUser ? "delivered":"sent",
                },
                include :{sender:true,reciever:true},
            });
            return res.status(201).send({message:newMessage});
        }
        return res.status(400).send("From,to and message are the required fields");

    }catch(err){
        next(err);
    }
}

export const getMessages=async(req,res,next)=>{
    try{
        const {from,to}=req.params;
        
        const prisma=getPrismaInstance();
        const messages=await prisma.messages.findMany({
            where:{
                OR:[
                    {
                     senderId:parseInt(from),
                     recieverId:parseInt(to),
                    },
                    {
                     senderId:parseInt(to),
                     recieverId:parseInt(from)
                    },
                ],
            },
            orderBy:{
                id:"asc",
            }       
        });

        const unreadMessges=[];
        
        messages.forEach((message,index)=>{
            if(message.messageStatus!=="read" && message.senderId===parseInt(to)){
                messages[index].messageStatus="read";
                unreadMessges.push(message.id);
            }
        });
        await prisma.messages.updateMany({
            where:{
                id:{in:unreadMessges},
            },
            data:{
                messageStatus:"read",
            },
        });
        res.status(200).json({messages});

    }catch(err){
        next(err);
    }
}

export const addImageMessage=async (req,res,next)=>{
    try{
        if(req.file){
            const date=Date.now();
            let fileName="upload/images/" + date + req.file.originalname;
            renameSync(req.file.path,fileName);
            const prisma=getPrismaInstance();
            const {from,to}=req.query;
            if(from && to){
                const message=await prisma.messages.create({
                    data:{
                      message:fileName,
                      sender:{connect:{id:parseInt(from)}},
                      reciever:{connect:{id:parseInt(to)}},
                      type:"image",
                    },
                });
                return res.status(201).json({message});
            }
            return res.status(400).send("from,to is required.");
        }
        return res.status(400).send("Image is required.");

    }catch(err){
        
        next(err);
    }
};

export const addAudioMessage=async (req,res,next)=>{
    try{
        if(req.file){
            const date=Date.now();
            let fileName="upload/recordings/" + date + req.file.originalname;
            renameSync(req.file.path,fileName);
            const prisma=getPrismaInstance();
            const {from,to}=req.query;
            if(from && to){
                const message=await prisma.messages.create({
                    data:{
                      message:fileName,
                      sender:{connect:{id:parseInt(from)}},
                      reciever:{connect:{id:parseInt(to)}},
                      type:"audio",
                    },
                });
                return res.status(201).json({message});
            }
            return res.status(400).send("from,to is required.");
        }
        return res.status(400).send("Audio is required.");

    }catch(err){
        
        next(err);
    }
};

export const getIntialContactswithMessages= async(req,res,next)=>{
    try{
       const userId=parseInt(req.params.from);
       const prisma=getPrismaInstance();
       const user=await prisma.user.findUnique({
        where:{id:userId},
        include:{
            sentMessages:{
                include:{
                    reciever:true,
                    sender:true
                },
                orderBy:{
                    createdAt:"desc",
                },
            },
            recievedMessages:{
                include:{
                    reciever:true,
                    sender:true,
                },
                orderBy:{
                    createdAt:"desc",
                },
            },
        },
       });
       const messages=[...user.sentMessages,...user.recievedMessages];
       messages.sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime());
       const users=new Map();
       const messageStatusChange=[];
       
       messages.forEach((msg)=>{
            const isSender=(msg.senderId===userId);
            const calculatedId=isSender?msg.recieverId:msg.senderId;
            if(msg.messageStatus==="sent"){
                messageStatusChange.push(msg.id);
            }
            if(!users.get(calculatedId)){
                const {
                    id,
                    type,
                    message,
                    messageStatus,
                    createdAt,
                    senderId,
                    recieverId,
                }=msg;
                //here user has same resemebles of message user is just a name all the message fields are presetn in the user field
                let user={
                    messageId:id,
                    type,
                    message,
                    messageStatus,
                    createdAt,
                    senderId,
                    recieverId,
                }

                if(isSender){
                    user={
                        ...user,
                        ...msg.reciever,
                        totalUnreadMessages:0,
                    }
                }else{
                    user={
                        ...user,
                        ...msg.sender,
                        totalUnreadMessages:messageStatus!=="read"?1:0,
                    };
                }
                users.set(calculatedId,{...user});
            }else if(msg.messageStatus!=="read" && !isSender){
                const user=users.get(calculatedId);
                users.set(calculatedId,{
                    ...user,
                    totalUnreadMessages:user.totalUnreadMessages+1,
                });
            }
        });

        //console.log(users);

        if(messageStatusChange.length){
            await prisma.messages.updateMany({
                where:{
                    id:{in:messageStatusChange},
                },
                data:{
                    messageStatus:"delivered",
                },
            });
        }
        return res.status(200).json({
            users:Array.from(users.values()),
            onlineUsers:Array.from(onlineUsers.keys())
        })
    }catch(err){
        next(err);
    }
}
