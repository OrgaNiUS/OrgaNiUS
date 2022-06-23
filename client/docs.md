# Application Guide

Live website is available at: https://organius.herokuapp.com/

## Sign In

1. The user may key in their username and password and click on "Sign In" to sign in.
2. The user may click on "Forgot Password?" to request for a password request, where they can follow the on-screen instructions.
3. The user may click on "Register" to register for an account instead.

## Account Registration

1. The user may click on the logo at the top to navigate back to the "Sign In" page.
2. The user may register for an account.

Note the following constraints for username, email address and password.

Username requirements:

1. Must be unique
2. At least 5 characters long
3. Only conains alphanumeric characters and ' ', '\_', '.'

Email address requirements:

1. Must be a valid email address
2. Email verification will be done (so please do not attempt to register with a random email)

Password requirements:

1. At least 8 characters long
2. Contains at least 1 uppercase, 1 lowercase and 1 digit
3. Does not contain username

## Dashboard

This is the main page after a user is logged in.

It also contains:

1. To-do list for the user
2. Scheduler for the user
3. Timeline for the user

The user can click on the ">" and "<" buttons to adjust the ratio of the components. This change will persist on page reloads.

### To-Do List

This contains the user's tasks.

With the filter dropdown on the top right, the user can choose to filter by "done" or "expired" to hide those results.

With the search bar, the user can search for specific task(s). Each space separated word in the search bar is considered a different search term. Any task with a name, or description or tag that partially (or completely) includes all search terms will be shown in the results (provided it is not filtered out by the filter options). Search terms are case insensitive.

Example "ta do" will match "Task Done".

The user can click on the "+" icon to create a new personal Task.

The user can click on the book/trash bin/pen icons to cycle through the different modes.

Book is the normal and default mode. The tasks can also be dragged and dropped into different positions.

Trash bin is the trash mode, where the user can select the tasks to be trashed with the checkbox beside each task. After which, the user can click on the "Trash Selected" button to remove the selected tasks.

Pen is the edit mode. (to be implemented)

With the expand button on the bottom right, the user can expand the To-Do List into a grid view that takes up the entire page. It offers similar functionality just with a different view.

### Scheduler

The user can see their tasks and events in this calendar-like view.

The user can click on the "+" icon to create a new personal Event.

### Timeline

The user can see their tasks and events in this timeline view, where they can quickly see the order.

The user can click on the two buttons that flank either side of the timeline to scroll the timeline. Alternatively, they can scroll using traditional scrolling methods like shift + scrollwheel or touchpad swiping.

The user can click on these tasks and events to toggle a popup card that reveals some more information.

## Projects

The user can see their projects here. (to be implemented)

## User

The user can see their user page here. (to be implemented)

## Settings

The user can perform the following actions:

1. Change username
2. Change email
3. Change password
4. Delete account

## Logout

The user can logout by clicking on the "Logout" button in the navigation bar which is always present at the top of the screen.
