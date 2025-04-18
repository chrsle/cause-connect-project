//Front-end user logic that calls back-end API
import { User } from "../types/types";

//function to handle login requests
export async function loginRequest (username: any, password: any){
    try{
        const response = await fetch("/login",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({username, password}),
        })
        console.log("Response from server:", response);
        console.log("headers", response.headers);
        if(response.ok){
            const data = await response.json();
            return {success: true, data};
        }
        else{
            return {success: false, error: "Invalid username or password"};
        }
    }catch(error){
        console.error("Error during login:", error);
        return {success: false, error: "An error occurred during login 1"};

    }

}