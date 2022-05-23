# API Documentation

## API V1

All routes in this section are be to accessed via "{url}/api/v1/..." unless otherwise specified.

Authentication is handled via JWT. After successful signup or login, the server will send a set-cookie request to the client containing the JWT. This cookie will be httpOnly and is not to be modified by the client in any way. This token has an expiry time of 10 minutes, after which it is expired and the user is considered to be logged out. After each subsequent request to the server, this token will be refreshed for another 10 minutes. Do not share this token with anyone else.

### Signup

POST "/signup" request

Input: A JSON body with the following **required** parameters. You may include other parameters specified in the `User` [definitions](#definitions) below, but they are not guaranteed to be kept.

```typescript
{
  name: string;
  password: string;
  email: string;
}
```

Output:

1. If successful, a JWT will be set in the cookies.
2. Else, a HTTP Bad Request Status followed by an error message.

Please ensure that these requirements are met on the client side before sending the request to reduce unnecessary requests. However, it will still be verified on the server.

Username requirements

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

### Login

POST "/login" request

Input: A JSON body with the following **required** parameters.

```typescript
{
  name: string;
  password: string;
}
```

Output:

1. If successful, a JWT will be set in the cookies.
2. Else, a HTTP Bad Request Status followed by an error message.

### Refresh JWT

GET "/refresh-jwt" request

Refreshes the JWT such that the token expires 10 minutes from the time this request is made. This is useful to prevent the user from being logged out due to inactivity.

Input: Nothing

Output: No output if successful (except status code of 200), else, error message in "error" field.

### Logout

DELETE "/logout" request

Input: Nothing

Output: No output if successful (except status code of 200), else, error message in "error" field.

### Get Own User

GET "/own_user" request

Gets the `User` data, of currently logged in user, in format defined below.

Input: None

Output: `User` data as defined in [definitions](#definitions).

### Modification of User Data

PATCH "/user" request

Input: Username, Password, Email as strings. Leave the fields blank if unchanged, except when changing Password, Username is required to be sent as well even if it is the same.

Output: Updated `User` data if successful, else, error message in "error" field.

### Deleting User

DELETE "/user" request

Input: Nothing

Output: No output if successful (except status code of 200), else, error message in "error" field.

### Exists

GET "/user_exists" request

Checks if a user exists with a particular name _or_ email. It is advisable to check if the username and email is already in use before submitting a signup request for a smoother signup process.

Input: Query parameters of "name" and "email".

Output:

```json
{
  "exists": true
}
```

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

```json
{
  "name": string,
  "email": string,
  "projects": Project[]
}
```

## Definitions

```typescript
// All types here are defined as per Typescript conventions.

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