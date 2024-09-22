import  getPrismaInstance  from "../utils/PrismaClient.js"
import { Prisma } from "@prisma/client";
import { generateToken04 } from "../utils/TokenGenerator.js";

//authcontroller will act like and api and collect the data from the frontend to backend and vice versa

export const checkUser=async (req,res,next)=>{
  console.log("Iam here");
    try{
        const {email}=req.body;
        if(!email){
            return res.json({msg:"Email is required",status:false});
        }
        const prisma=getPrismaInstance();
        const user=await prisma.user.findUnique({where:{email}});
        if(!user){
          return  res.json({msg:"User not found",status:false});
        }else{
            return res.json({msg:"User found",status:true,data:user});
        }
        

    }catch(err){
        
        next(err);
    }
};

export const onBoardUser= async (req,res,next)=>{
    try{
      const {email,name,about,image:profilePicture}=req.body;
      if(!email||!name||!profilePicture){
        return res.send("Email,Name and Image are required");
      }
      const prisma=getPrismaInstance();
      await prisma.user.create({
        data:{email,name,about,profilePicture},
      })  
      return res.json({msg:"success",status:true});
    }catch(err){
        next(err);
    }
};

export const getAllUsers=async(req,res,next)=>{
  try{
    const prisma=getPrismaInstance();
    const Users=await prisma.user.findMany({
      orderBy:{name:"asc"},
      select:{
        id:true,
        email:true,
        name:true,
        profilePicture:true,
        about:true,
      },
    });
    const usersGroupByInitialLetter={};
    
    Users.forEach((user)=>{
      const intialLetter=user.name.charAt(0).toUpperCase();
      if(!usersGroupByInitialLetter[intialLetter]){
        usersGroupByInitialLetter[intialLetter]=[];
      }
      usersGroupByInitialLetter[intialLetter].push(user);
    })

    return res.status(200).send({users:usersGroupByInitialLetter});

  }catch(err){
    next(err);
  }
}

export const generateToken=(req,res,next)=>{
  try{
    const appId=parseInt(process.env.ZEGO_APP_ID);
    const serverSecret=process.env.ZEGO_SERVER_ID;
    const userId=req.params.userId;
    const effectiveTime=3600;
    const payload="";
    if(appId && serverSecret && userId){
      
      const token= generateToken04(
        appId,
        userId,
        serverSecret,
        effectiveTime,
        payload,
      )
      return res.status(200).json({token});
      
    }
    return res.status(400).json("User id,app id and server secrets are required");

  }catch(err){
    next(err);
  }
}


