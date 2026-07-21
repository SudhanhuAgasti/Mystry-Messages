import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {  z } from "zod";
import { usernamevalidation } from "@/schemas/signUpSchema";



const UsernameQuerySchma=z.object({
    username:usernamevalidation
})

export async function GET(req:Request) {
    await dbConnect()
     
    try{
      const {searchParams}=new URL(req.url)
      const queryParam={
        username:searchParams.get('username')
      }  
      //validate with zod
      const result= UsernameQuerySchma.safeParse(queryParam)
      console.log(queryParam);

      if(!result.success){
        const usernameErrors=result.error.format().username?._errors||[]
            return Response.json({
                success:false,
                message:"INVALID QUERY PARAMS"
            },{status:400})
      }

      const {username}=result.data

     const existingVerifiedUser = await UserModel.findOne({username,isVerified:true})
     if(existingVerifiedUser){
        return Response.json({
            success:false,
            message:"username is already taken !"
        },{status:400})
     }
     return Response.json({
        success:true,
        message:"username should be unique !"
     },{status:400})

    }catch(error){
        console.error("ERROR CHECKING USERNAME",error);
        return Response.json({
            success:false,
            message:"Error checking username "
        },{status:500})
    }
}