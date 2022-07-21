# API Documentation

## API V1

All routes in this section are be to accessed via "{url}/api/v1/..." unless otherwise specified.

Authentication is handled via JWT. After successful signup or login, the server will send a set-cookie request to the client containing the JWT. This cookie will be httpOnly and is not to be modified by the client in any way. This token has an expiry time of 10 minutes, after which it is expired and the user is considered to be logged out. After each subsequent request to the server, this token will be refreshed for another 10 minutes. Do not share this token with anyone else.

### Signup

POST "/signup" request

Input: A JSON body with the following **required** parameters. You may include other parameters specified in the `User` [definitions](#definitions) below, but they are not guaranteed to be kept.

```typescript
type input = {
    name: string;
    password: string;
    email: string;
};
```

Output:

1. If successful, a JWT will be set in the cookies.
2. Else, a HTTP Bad Request Status followed by an error message.

Please ensure that these requirements are met on the client side before sending the request to reduce unnecessary requests. However, it will still be verified on the server. After the user signs up, the user must still be [verified](#verify-email) before being allowed to login.

Status Code: 201 or 400

Username requirements:

1. Must be unique
2. At least 5 characters long
3. Only conains alphanumeric characters and ' ', '\_', '.'

Password requirements:

1. At least 8 characters long
2. Contains at least 1 uppercase, 1 lowercase and 1 digit
3. Does not contain username

Note that the request does not require a password confirmation.

Email requirements:

1. Must be a valid email address by RFC5322 standards

This [link](https://emailregex.com/) contains regex queries that should work for most use cases.

### Verify Email

POST "/verify" request

Input: Name and pin. Pin is sent to the email account used in signup.

```typescript
type input = {
    name: string;
    pin: string;
};
```

Output:

1. If successful, a JWT will be set in the cookies.
2. Else, a HTTP Bad Request Status followed by an error message.

Status Code: 200 or 400

### Login

POST "/login" request

Input: A JSON body with the following **required** parameters.

```typescript
type input = {
    name: string;
    password: string;
};
```

Output:

1. If successful, a JWT will be set in the cookies.
2. Else, a HTTP Bad Request Status followed by an error message.

Status Code: 201 or 400

### Refresh JWT

GET "/refresh_jwt" request

Refreshes the JWT such that the token expires 10 minutes from the time this request is made. This is useful to prevent the user from being logged out due to inactivity.

The client calls this every 9.5 minutes if logged in to prevent being logged out.

Input: Nothing

Output: No output if successful (except status code of 200), else, error message in "error" field.

Status Code: 200 or 400 or 401

### Logout

DELETE "/logout" request

Input: Nothing

Output: No output if successful (except status code of 200), else, error message in "error" field.

Status Code: 200 or 401

### Forgot Password

This is a 3-step process to reset the user's password via the "Forgot Password" option. The process is done similarly to many other services.

Naturally, all these 3 steps do not require the user to be logged in.

FPP - forget password PIN

1. Generate the FPP which will be sent to the user's email address.
2. (Optional) Verify if the FPP is correct.
3. Change the user's password with the FPP as verification.

Note that if a user requests for a FPP multiple times, only the latest one will be effective.

#### Generate Forgot Password PIN

POST "/forgot_pw" request

Input:

```typescript
type input = {
    name: string;
};
```

Output: No output if successful (except status code of 200), else, error message in "error" field.

Status Code: 200 or 400

#### Verify Forgot Password PIN

POST "/verify_forgot_pw" request

This step is optional as an extra check before requesting the new password from the end user. It is merely used to ensure that the user has obtained the correct PIN before the next step. You can save this PIN locally so that the user does not have to insert it twice.

Input:

```typescript
type input = {
    name: string;
    pin: string;
};
```

Output:

```typescript
type output = {
    valid: boolean;
};
```

Status Code: 200 or 400

#### Forgot Password: Change to New Password

POST "/change_forgot_pw" request

"password" field refers to the new password. Do validate the requirements of the password first.

Input:

```typescript
type input = {
    name: string;
    pin: string;
    password: string;
};
```

Output: No output if successful (except status code of 200), else, error message in "error" field.

Status Code: 200 or 400

### Get Own User

GET "/own_user" request

Gets the `User` data, of currently logged in user, in format defined below.

Input: None

Output: `User` data as defined in [definitions](#definitions).

Status Code: 200 or 400 or 401

### Modification of User Data

PATCH "/user" request

Input: Username, Password, Email as strings. Leave the fields blank if unchanged.

Output: Updated `User` data if successful, else, error message in "error" field.

Status Code: 200 or 400 or 401

### Deleting User

DELETE "/user" request

Input: Nothing

Output: No output if successful (except status code of 200), else, error message in "error" field.

Status Code: 200 or 400 or 401

### Exists

GET "/user_exists" request

Checks if a user exists with a particular name _or_ email. It is advisable to check if the username and email is already in use before submitting a signup request for a smoother signup process.

Input: Query parameters of "name" and "email".

Output:

```typescript
type output = {
    exists: boolean;
};
```

Status Code: 200 or 400

Example usage:

```
GET {url}/user_exists/?name=user1&email=eg@email.com/
GET {url}/user_exists/?name=user1/
GET {url}/user_exists/?email=eg@email.com/
```

### Get Other User Data

GET "/user" request

This request does not require the user to be logged in and is meant for querying users other than oneself, for a public profile of sorts.

Gets some non-sensitive data of a User by the User ID or username. Unused parameter will be ignored.

Input: Query parameters of "id" and "name". (Example: "GET {url}/?name=user100")

Output:

```typescript
type output = {
    name: string;
    email: string;
    project: Project[];
};
```

Status Code: 200 or 400

### Create Project

POST "/project_create"

This will create a project with the current user as the admin.

Only requires name and description of the project.

Input: A JSON body with the following **required** parameters.

```typescript
type input = {
    name: string;
    description: string;
};
```

Output:

```typescript
type output = {
    projectid: string;
};
```

Status Code: 201 or 400

### User Apply to Project

PATCH "/user_apply"

Allows user to apply to join a project.

Input:

```typescript
type input = {
    projectid: string;
    description?: string /* can be left blank */;
};
```

Status Code: 200 or 400

### User Get Project Invites

GET "/user_get_project_invites"

Input: None

Output:

```typescript
type output = {
    projects: project[];
};

type project = {
    id: string /* project id */;
    name: string;
    description: string;
    members: { [key: string]: string } /* username -> role */;
};
```

Status Code: 200 or 400

### User Accept Invite to Project

PATCH "/user_accept"

User accepts invite to a project and joins the project.

Input:

```typescript
type input = {
    projectid: string; // required
};
```

Status Code: 200 or 400

### User Reject Invite to Project

PATCH "/user_reject"

User rejects invite to a project.

Input:

```typescript
type input = {
    projectid: string; // required
};
```

Status Code: 200 or 400

### Get Project

GET "/project_get"

This will get the project's name, description and creation time, events, members, tasks.

Input: Query parameters of "projectid"

Example usage:

```
GET {url}/project_get/?projectid=48321740872149281
```

Output:

```typescript
type output = {
    creationTime: string;
    description: string;
    events: Event[];
    members: member[];
    name: string;
    tasks: Task[];
};

type member = {
    name: string;
    id: string;
    role: string;
};
```

Status Code: 200 or 400

### Get All Project

GET "/project_get_all"

This will get all project's of current logged in user's
id, name, description and creationTime. For more detailed information of each project, use project_get

Example usage:

```
GET {url}/project_get_all
```

Output:

```typescript
type output = {
    id: string;
    name: string;
    description: string;
    creationTime: string;
};
```

Status Code: 200 or 400

### Project Modify

PATCH "/project_modify"

Allows admin to modify Name, Description and Public status of project.

Input: A JSON body with the following parameters. projectid is only **required** parameter.

```typescript
type input = {
    name: string; // required, rest optional
    projectid: string;
    description: string; // string[] of userid
    isPublic: boolean;
};
```

Status Code: 200 or 400

### Project Invite User

PATCH "/project_invite"

Allows admin to invite users to project.

Input: A JSON body with the following **required** parameters.

```typescript
type input = {
    projectid: string;
    users: string[]; // usernames
};
```

Status Code: 200 or 400

### Project Get Applications

GET "/project_get_applications"

User must be admin of the project. Otherwise, status code of 400.

Input: Query parameter of "projectid" (required).

Output:

```typescript
type output = {
    applicants: applicant[];
};

type applicant = {
    id: string /* userid of applicant, needed for project_choose */;
    name: string /* name of applicant, for UI display */;
    description: string /* if the applicant did not write a description, this is blank! */;
};
```

Example output:

```typescript
const result = {
    applicants: [
        {
            id: "62c7a851de1f35440890e8da",
            name: "User5",
            description: "user5 wanna apply",
        },
    ],
};
```

Status Code: 200 or 400 or 401

### Project Choose Users

PATCH "/project_choose"

Allows admin to choose which applied users to add to project.

Input: A JSON body with the following parameters. projectid is only **required** parameter.

```typescript
type input = {
    projectid: string; // required, rest optional
    acceptedUsers: string[]; // string[] of userid, if want to use name, change function in controller from UpdateManyById to UpdateManyByName
    rejectedUsers: string[]; // string[] of userid, if want to use name, change function in controller from UpdateManyById to UpdateManyByName
};
```

Status Code: 200 or 400

### Project Remove User

PATCH "/project_remove_user"

Allows admin to remove users.

Input: A JSON body with the following parameters. projectid is only **required** parameter.

```typescript
type input = {
    projectid: string;
    userids: string[]; // string[] of userid
};
```

Status Code: 200 or 400

### Project Delete

DELETE "/project_delete"

Allows admin to delete project.

Example usage:

```
DELETE {url}/project_delete?projectid=48321740872149281

```

Status Code: 200 or 400

### Create Task

POST "/task_create"

This will create either a personal task or project task based on if a project ID is passed in.
No projectid passed in, the task will be created for current user.
If specified, will create a task for the project and assign users in user array to that task.

Input: A JSON body with the following parameters. name is only **required** parameter.

```typescript
type input = {
    name: string; // required, rest optional
    description: string;
    assignedTo: string[]; // string[] of userid
    projectID: string;
    deadline: string; // ISO 8601 format
    tags: string[];
};
```

Output:

```typescript
type output = {
    taskid: string;
};
```

### Task Modify

PATCH "/task_modify"

Modifies the below mentioned parameters of the task.

Input: A JSON body with the following parameters. taskid is only **required** parameter.

For assignedTo array, do parse the changes on the client side and pass in the deltas add and remove separately.

For tags array, do parse the changes similarly to assignedTo.

```typescript
type input = {
    taskid: string;
    name: string;
    addAssignedTo: string[]; // string[] of userids
    removeAssignedTo: string[]; // string[] of userids
    description: string;
    deadline: string; // ISO8601 format
    isDone: bool;
    addTags: string[];
    removeTags: string[];
};
```

### Task Get All

GET "/task_get_all"

Get All User Tasks: Leave projectid blank
Get All Project Tasks: Put relevant projectId

Input: Query parameters of "projectid"

Output:

```typescript
type output = {
    tasks: Task[];
};
```

Example usage:

```
GET {url}/task_get_all/?
GET {url}/task_get_all/?projectid=
GET {url}/task_get_all/?projectid=48321740872149281

```

### Delete Task

DELETE "/task_delete"

Deletes all tasks that are given. Provide projectid if its a task belonging to a project.

Input: A JSON body with the following **required** parameters.

```typescript
type input = {
    projectid: string;
    tasks: string[];
};
```

### Project Search

Web Socket "/project_search". This upgrades the existing http/s connection to a web socket connection.

This is used for establishing the autocomplete feature for searching projects.

Send: A string of the search query.

Receive:

```typescript
type receive = {
    projects: project[];
};

type project = {
    id: string /* projectid */;
    name: string /* name of project */;
    description: string /* description of project */;
};
```

### Project Invite Search

Web Socket "/project_search". This upgrades the existing http/s connection to a web socket connection.

This is used for establishing the autocomplete feature for searching users (when inviting them to a project).

Send:

```typescript
// NOTE: use JSON.stringify to stringify the payload and send as a string.
// https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications#using_json_to_transmit_objects

type send = {
    projectid: string;
    query: string;
};
```

Receive:

```typescript
type receive = {
    users = user[];
};

type user = {
    id: string;
    name: string;
};
```

### Event Create

POST "/event_create"

This will create a personal event or project event.

1. If _no_ projectid is passed in, the task will be created for the current user.
2. If a projectid is passed in, the task will be created for the project with that projectid.

Input:

```typescript
type input = {
    name: string;
    start: string; // ISO 8601 format
    end: string; // ISO 8601 format
    projectid?: string;
};
```

Output:

```typescript
type output = {
    eventid: string; // id of the created event
};
```

### Event Get

GET "/event_get"

Input: Query parameters of "eventid".

Output:

```typescript
type output = {
    id: string; // id of event
    name: string;
    start: string; // ISO 8601 format
    end: string; // ISO 8601 format
};
```

### Event Get All

GET "/event_get_all"

Get All User Events: Leave projectid blank
Get All Project Events: Put relevant projectid

Input: Query parameters of "projectid"

Output:

```typescript
type output = {
    events: Event[];
};
```

### Event Modify

PATCH "/event_modify"

Input:

```typescript
type input = {
    eventid: string;
    name?: string;
    start?: string; // ISO 8601 format
    end?: string; // ISO 8601 format
};
```

Output: None

### Event Delete

DELETE "/event_delete"

Input: Query parameter of eventid of event to be deleted, and projectid (if associated with a project).

### Event Parse NUSMODS

POST "/event_nusmods"

Input:

URL should be the "share/sync" URL.
Example: https://nusmods.com/timetable/sem-1/share?CS2101=&CS2102=LEC:1V,TUT:08&CS2103T=LEC:G13&CS3230=TUT:08,LEC:1V&ST2334=LEC:1,TUT:14

```typescript
type input = {
    url: string;
};
```

```typescript
type output = {
    events: Event[];
};
```

### Event Find Common Meeting Slots

POST "/event_find_common"

Based on a few parameters, the server will find common time slots that the users listed are all available on, based on personal & project events.

Note that this will _not_ create any events. Thus, it functions more like a GET request than a POST request in actuality.

-   `dateStart` & `dateEnd` is the date range to search for
-   `timeStart` & `timeEnd` is the time range to search for within each day
-   `duration` is the minimum duration of the meeting in minutes

Starts must be less than Ends. We don't support slots past midnight (probably not hard to find slots manually if you want to work till that late)!

```typescript
type input = {
    projectid: string; // projectid of project
    userids: string[]; // userid of users to search with
    dateStart: string; // YY-MM-DD
    dateEnd: string; // YY-MM-DD
    timeStart: string; // HH:mm (24 hour)
    timeEnd: string; // HH:mm (24 hour)
    duration: number; // minimum duration in minutes
};
```

```typescript
type output = {
    // if no slots found, an empty array will be returned
    slots: Slot[];
};

// note that duration of slots can be longer than the duration listed in input (but never shorter!)
type Slot = {
    start: string;
    end: string;
};
```

## Definitions

```typescript
// All types here are defined as per Typescript conventions.
// Project[], User[], Task[] and Events[] are actually stored as a string[],
// where each string is the objectid of the relevant Object

interface User {
    id: number;
    name: string;
    password: string;
    email: string;
    events: Event[];
    tasks: Task[];
    projects: Project[];
    settings: UserSettings;
}

interface Event {
    id: number;
    name: string;
    start: Date;
    end: Date;
}

interface Task {
    id: number;
    name: string;
    assignedTo: User[];
    description: string;
    creationTime: Date;
    deadline: Date;
    isDone: boolean;
    tags: string[];
    isPersonal: bool;
}

interface Project {
    id: number;
    name: string;
    description: string;
    members: User[];
    tasks: Task[];
    state: string;
    creationTime: Date;
    settings: ProjectSettings;
}

interface ProjectSettings {
    roles: { [key: string]: Permissions };
    deadlineNotification: Date;
}

interface Permissions {
    addMember: boolean;
    removeMember: boolean;
    editName: boolean;
    editDesc: boolean;
    editSettings: boolean;
    addTask: boolean;
    removeTask: boolean;
    canAssignOthers: boolean;
}

interface UserSettings {
    deadlineNotification: Date;
    webNotification: boolean;
    telegramNotification: boolean;
    emailNotification: boolean;
}
```
