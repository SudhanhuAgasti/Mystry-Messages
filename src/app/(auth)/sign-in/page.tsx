'use client'
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import {useDebounceValue} from 'usehooks-ts';
import { toast } from "sonner";

import React, { useState } from 'react'
import { useRouter } from "next/router";

// 

const page = () => {
  const [username,setUsername]=useState('');
  const [usernameMessage,setUsernameMessage]=useState('');
  const[isCheckingUsername,setIsCheckingUsername]=useState(false);
  const [isSubmitting,setIsSubmitting]=useState(false);
  // const {toast}= useToast();

  const router=useRouter();
  


  const debouncedUsername = useDebounceValue(username,300)




  return (
    <div>
      
    </div>
  )
}

export default page
