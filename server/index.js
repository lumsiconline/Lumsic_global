import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {createClient} from "@supabase/supabase-js";
import {z} from "zod";
import path from "node:path";
import {fileURLToPath} from "node:url";

const app=express();
const PORT=Number(process.env.PORT||8080);
const URL=process.env.SUPABASE_URL;
const ANON=process.env.SUPABASE_ANON_KEY;
const SERVICE=process.env.SUPABASE_SERVICE_ROLE_KEY;
const origins=(process.env.FRONTEND_ORIGINS||"").split(",").map(x=>x.trim()).filter(Boolean);
const prod=process.env.NODE_ENV==="production";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const db=URL&&SERVICE?createClient(URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}):null;
const authClient=URL&&ANON?createClient(URL,ANON,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}):null;

app.disable("x-powered-by");
app.set("trust proxy",1);
app.use(helmet());
app.use(cors({origin(origin,cb){if(!origin||!prod||origins.includes(origin))return cb(null,true);return cb(new Error("Origin not allowed"));},methods:["GET","POST","OPTIONS"],allowedHeaders:["Authorization","Content-Type"],credentials:false,maxAge:600}));
app.use(express.json({limit:"16kb",strict:true}));
app.use("/api",rateLimit({windowMs:60000,limit:100,standardHeaders:"draft-7",legacyHeaders:false}));

function configured(req,res,next){if(!db||!authClient)return res.status(503).json({error:"Backend auth/database is not configured."});next();}
async function authenticate(req,res,next){
 try{
  const h=req.headers.authorization||"";const token=h.startsWith("Bearer ")?h.slice(7):"";
  if(!token)return res.status(401).json({error:"Sign in to continue."});
  const {data,error}=await authClient.auth.getUser(token);
  if(error||!data?.user)return res.status(401).json({error:"Session is invalid or expired."});
  req.user=data.user;
  const {data:rows,error:roleError}=await db.from("user_roles").select("role").eq("user_id",req.user.id);
  if(roleError)throw roleError;
  req.roles=(rows||[]).map(x=>x.role);
  req.admin=req.roles.some(x=>["admin","super_admin","operations_admin","chat_admin","content_admin","finance_admin"].includes(x));
  req.astrologer=req.roles.includes("astrologer");
  if(req.astrologer){const {data:reader,error:readerError}=await db.from("readers").select("id,astro_id,name,email").ilike("email",req.user.email||"").maybeSingle();if(readerError)throw readerError;req.reader=reader||null;}
  next();
 }catch(e){console.error("auth verification failed:",e.message);res.status(500).json({error:"Unable to verify account permissions."});}
}
function ownsSession(req,s){if(req.admin)return true;if(req.astrologer)return Boolean(req.reader&&s.assigned_reader_id===req.reader.id);return s.customer_id===req.user.id;}

app.get("/api/health",(req,res)=>res.json({ok:true,service:"lumsic-api",time:new Date().toISOString()}));
app.get("/api/me",configured,authenticate,async(req,res)=>{
 const {data:profile}=await db.from("profiles").select("full_name,phone,country,currency").eq("id",req.user.id).maybeSingle();
 const role=req.admin?(req.roles.includes("super_admin")?"super_admin":"admin"):req.astrologer?"astrologer":"customer";
 res.json({id:req.user.id,email:req.user.email,role,roles:req.roles,profile});
});
app.get("/api/workspace/sessions",configured,authenticate,async(req,res)=>{
 try{
  let q=db.from("consultation_sessions").select("id,customer_id,assigned_reader_id,status,created_at,updated_at").order("created_at",{ascending:false}).limit(100);
  if(!req.admin){if(req.astrologer){if(!req.reader)return res.status(403).json({error:"No reader profile is linked to this login."});q=q.eq("assigned_reader_id",req.reader.id);}else q=q.eq("customer_id",req.user.id);}
  const {data,error}=await q;if(error)throw error;res.json({sessions:data||[]});
 }catch(e){console.error("session list:",e.message);res.status(500).json({error:"Unable to load conversations."});}
});
app.get("/api/chat/sessions/:id",configured,authenticate,async(req,res)=>{
 try{
  const {data:s,error}=await db.from("consultation_sessions").select("id,customer_id,requested_reader_id,assigned_reader_id,status,created_at,updated_at").eq("id",req.params.id).maybeSingle();
  if(error)throw error;if(!s||!ownsSession(req,s))return res.status(404).json({error:"Conversation not found."});
  const {data:messages,error:msgError}=await db.from("chat_messages").select("id,sender,sender_id,message_data,created_at").eq("session_id",s.id).order("created_at",{ascending:true}).limit(300);
  if(msgError)throw msgError;res.json({session:s,messages:messages||[]});
 }catch(e){console.error("chat read:",e.message);res.status(500).json({error:"Unable to load this conversation."});}
});
const bodySchema=z.object({text:z.string().trim().min(1).max(4000)}).strict();
app.post("/api/chat/sessions/:id/messages",configured,authenticate,async(req,res)=>{
 try{
  const parsed=bodySchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:"Message must contain 1–4,000 characters."});
  const {data:s,error}=await db.from("consultation_sessions").select("id,customer_id,assigned_reader_id,status").eq("id",req.params.id).maybeSingle();
  if(error)throw error;if(!s||!ownsSession(req,s))return res.status(404).json({error:"Conversation not found."});
  if(["completed","cancelled"].includes(s.status))return res.status(409).json({error:"This conversation is closed."});
  const sender=req.admin||req.astrologer?"astrologer":"customer";
  const {data:message,error:insertError}=await db.from("chat_messages").insert({session_id:s.id,sender,sender_id:req.user.id,message_data:{text:parsed.data.text}}).select("id,sender,sender_id,message_data,created_at").single();
  if(insertError)throw insertError;res.status(201).json({message});
 }catch(e){console.error("chat send:",e.message);res.status(500).json({error:"Message could not be sent."});}
});
app.use("/api",(req,res)=>res.status(404).json({error:"API route not found."}));
const dist=path.join(root,"dist");
app.use(express.static(dist,{index:false,maxAge:prod?"1h":0}));
app.get("*",(req,res)=>res.sendFile(path.join(dist,"index.html"),e=>{if(e)res.status(404).send("Frontend build not found.");}));
app.listen(PORT,()=>console.log("Lumsic API listening on "+PORT));