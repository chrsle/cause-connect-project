import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from "react-router-dom";
import { Event } from "../types/types";
import "../views/styles/eventCard.css";
import "../views/styles/expandedEventCard.css";



const ProfileCardPortal: React.FC<{
  userType: "student" | "organization";
  

}> = ({ userType }) => {
  return(
    <></>
  )
};

export default ProfileCardPortal;
