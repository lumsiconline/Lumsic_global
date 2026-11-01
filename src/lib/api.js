import { supabase } from "./supabase";
export async function api(path,options={}) {
  if(!supabase) throw new Error("Authentication is not configured.");
  const {data:{session}}=await supabase.auth.getSession();
  const response=await fetch(path,{...options,headers:{"Content-Type":"application/json",...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{}),...(options.headers||{})}});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(payload.error||"Request failed.");
  return payload;
}