import mongoose,{Schema,Document} from "mongoose";

export interface Message extends Document{
    content:String;
    createdAt:Date
}
const messageSchema:Schema<Message>=new Schema({
    content:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now
    }
})

export interface User extends Document{
   username:String;
   email:string;
   password:string;
   verifyCode:string;
   verifyCodeExpire:Date;
   isVerified:boolean,
   isAcceptingMessage:boolean;
   message:Message[];
   createdAt:Date
}
const UserSchema:Schema<User>=new Schema({
    username:{
        type:String,
        required:[true,"Username must be required!"],
        length:[2,"name must be contain atleast two character!"],
        trim:true,
        unique:true
    },
    email:{
        type:String,
        required:[true,"User Email must be required!"],
        unique:true,
        match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/,"please use a valid email adress !"]
    },
    password:{
        type:String,
        required:true,
        length:[6,"Password must bi 6 char. atleast !"]
    },
    verifyCode:{
        type:String,
        required:[true,"Verifycode must be required !"],
    },
    verifyCodeExpire:{
        type:Date,
        required:[true,"VerifycodeExpie is required !"],
    },
    isVerified:{
        type:Boolean,
        default:false
    },
     isAcceptingMessage:{
        type:Boolean,
        default:true
     },
   message:[messageSchema]
})

const UserModel=(mongoose.models.User as mongoose.Model<User>) || mongoose.model("User",UserSchema)

export default UserModel;