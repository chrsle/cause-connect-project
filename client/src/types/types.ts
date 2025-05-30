//Definining types for the application
export type User = {
    id: number;
    username: string;
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
    phone: string;
    upcoming_events: number;
    past_events: number;
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
    cause:string
    volunteers: string;
    status: EventStatus;
}