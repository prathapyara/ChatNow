import { Router } from "express";
import { addMessage, getMessages,addImageMessage,addAudioMessage, getIntialContactswithMessages } from "../controllers/MessageController.js";
import multer from "multer";

const uploadImage=multer({dest:"upload/images"});
const uploadAudio=multer({dest:"upload/recordings"});

 const router=Router();
 router.post("/add-message",addMessage);
 router.get("/get-messages/:from/:to",getMessages);
 router.post("/add-image-message",uploadImage.single("image"),addImageMessage);
 router.post("/add-audio-message",uploadAudio.single("audio"),addAudioMessage);
 router.get("/get-initial-contacts/:from",getIntialContactswithMessages);
 export default router;
