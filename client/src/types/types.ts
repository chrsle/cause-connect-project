//Defining types for the application
export type User = {
    id: number;
    email: string; // Changed from username to email to match schema
    user_type: "student" | "organization";
}

export type Student = {
    id: number;
    user_id: number;
    full_name: string;
    age: number;
    school: string;
    bio: string;
    interests: string;
    email: string;
    phone?: string; // Made optional since it's not in  schema
    upcoming_events?: number; // Made optional
    past_events?: number; // Made optional
    signup_date?: string; // Added for volunteer signup tracking
}

export type Organization = {
    id: number;
    user_id: number;
    name: string;
    location: string;
    category: string;
    statement: string;
    volunteers: string;
    email: string;
}

export type EventStatus = "draft" | "upcoming" | "completed";

export type Event = {
    id: number;
    title: string; 
    organization: string;
    body: string;
    createdDate: string;
    author_id: number;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    location: string;
    cause: string;
    status: EventStatus;
    formattedDate?: string;
    formattedTime?: string;
    rawTime?: string;
}