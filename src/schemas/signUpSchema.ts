import {z} from "zod";

export const usernamevalidation = z
.string()
.min(2,"Username must be atleast 2 char.")
.max(20,"Must be no more then 20 char")
.regex(/^[A-Za-z ]+$/,"username must not contain special character")


export const signUpSchema=z.object({
    username:usernamevalidation,
    email:z.string().email({message:"ivalid emailadress"}),
    pasword:z.string().min(6,{message:"passwoed must be atleat 6 character"})
})