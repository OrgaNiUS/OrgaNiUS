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

Please ensure that these requirements are met on the client side before sending the request to reduce unnecessary requests. However, it will still be verified on the server. After the user signs up, the user must still be [verified](#verify-email) before being allowed to login.

Status Code: 201 or 400

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

### Verify Email

POST "/verify" request

Input: Name and pin. Pin is sent to the email account used in signup.

```json
{
  name: string;
  pin: string;
}
```

Output:

1. If successful, a JWT will be set in the cookies.
2. Else, a HTTP Bad Request Status followed by an error message.

Status Code: 200 or 400

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

Status Code: 201 or 400

### Refresh JWT

GET "/refresh-jwt" request

Refreshes the JWT such that the token expires 10 minutes from the time this request is made. This is useful to prevent the user from being logged out due to inactivity.

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

```json
{
  name: string;
}
```

Output: No output if successful (except status code of 200), else, error message in "error" field.

Status Code: 200 or 400

#### Verify Forgot Password PIN

POST "/verify_forgot_pw" request

This step is optional as an extra check before requesting the new password from the end user. It is merely used to ensure that the user has obtained the correct PIN before the next step. You can save this PIN locally so that the user does not have to insert it twice.

Input:

```json
{
  name: string;
  pin: string;
}
```

Output:

```json
{
  "valid": true
}
```

Status Code: 200 or 400

#### Forgot Password: Change to New Password

POST "/change_forgot_pw" request

"password" field refers to the new password. Do validate the requirements of the password first.

Input:

```json
{
  name: string;
  pin: string;
  password: string;
}
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

Input: Username, Password, Email as strings. Leave the fields blank if unchanged, except when changing Password, Username is required to be sent as well even if it is the same.

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

```json
{
  "exists": true
}
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

```json
{
  "name": string,
  "email": string,
  "projects": Project[]
}
```

Status Code: 200 or 400

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
