# API Documentation

## API V1

All routes in this section are be to accessed via "{url}/api/v1/..." unless otherwise specified.

Authentication is handled via JWT. After successful signup or login, the server will send a set-cookie request to the client containing the JWT. This cookie will be httpOnly and is not to be modified by the client in any way. This token has an expiry time of 10 minutes, after which it is expired and the user is considered to be logged out. After each subsequent request to the server, this token will be refreshed for another 10 minutes. Do not share this token with anyone else.

### Signup

POST "/signup/" request

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
3. Only alphanumeric

Password requirements:

1. At least 8 characters long
2. Contains at least 1 uppercase, 1 lowercase and 1 digit
3. Does not contain username

Note that the request does not require a password confirmation.

Email requirements:

1. Must be a valid email address by RFC5322 standards

This [link](https://emailregex.com/) contains regex queries that should work for most use cases.

### Login

POST "/login/" request

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

### Exists

GET "/user_exists/:name/:email/" request

Checks if a user exists with a particular name _or_ email. It is advisable to check for this before submitting a signup request.

Input: Name and email parameters. Both are required. Use a "." to not use that parameter.

Output:

```json
{
  "exists": true | false
}
```

Example usage:

```
GET {url}/user_exists/user1/eg@email.com/
GET {url}/user_exists/user1/./
GET {url}/user_exists/./eg@email.com/
```

### Get Own User

GET "/own_user/" request

Gets the `User` data, of currently logged in user, in format defined below.

Input: None

Output: `User` data as defined in [definitions](#definitions).

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
