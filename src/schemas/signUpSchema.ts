import {z} from "zod";

export const usernameValidation = z
.string()
.min(2,"Username must be atleast 2 char.")
.max(20,"Must be no more then 20 char")
.regex(/^[a-zA-Z0-9_]+$/,"Username must not contain special character or spaces")


export const signUpSchema=z.object({
    username:usernameValidation,
    email:z.string().email({message:"ivalid emailadress"}),
    password:z.string().min(6,{message:"password must be atleat 6 character"})
})