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

The user can click on the "3 dots" beside the task name to open up a menu to edit or trash the task.

With the expand button on the bottom right, the user can expand the To-Do List into a grid view that takes up the entire page. It offers similar functionality just with a different view.

### Scheduler

The user can see their tasks and events in this calendar-like view.

The user can click on the "+" icon to create a new personal Event.

### Timeline

The user can see their tasks and events in this timeline view, where they can quickly see the order.

The user can click on the two buttons that flank either side of the timeline to scroll the timeline. Alternatively, they can scroll using traditional scrolling methods like shift + scrollwheel or touchpad swiping.

The user can click on these tasks and events to toggle a popup card that reveals some more information.

## Projects

The user can see their projects and project invites here.

The user can click on the project name to navigate to the project page.

The user can click on the "accept" and "reject" buttons beside the project invites to accept or reject them.

The user can also create a new project from here.

## Project Page

The user can see an individual project's dashboard here.

They can work with the tasks, similarly to the user dashboard, and other features.

Admins can also navigate to the project settings page from this screen. Admins can also invite others to the project from this screen. Admins can also manage user applications from this screen.

### Task Assignment

However, a small difference between Project tasks and Personal tasks is that Project tasks can be assigned to users.

To add assignment to users, the user can edit the task and then start typing the username to be added, at that point, suggestions will pop up below the text field and the user can click on the "+" icon or the name of the user to add that user.

To remove assignment from users, the user can edit the task and then press on the "-" icon or the name of the user to remove that user.

### Project Applications

This page is only accessible by the project admins.

The admin can click on the green checkmarks or red crosses to mark an application as accepted or rejected respectively.

After marking the applicants, the admin can click on the "Send changes!" button on the top right to act on those applications.

There is also a "Refresh" button on the top right to refresh the data, as an alternative to refreshing the entire page.

## Project Search

A page where a user can search for public projects to request to join.

The user can simply search for a project name through the search box. They will receive real-time suggestions from the server. After which, they can click on a project name to open a modal where they can apply to join a project. They can optionally include a message when applying.

## Settings

The user can perform the following actions:

1. Change username
2. Change password
3. Delete account

## Logout

The user can logout by clicking on the "Logout" button in the navigation bar which is always present at the top of the screen.
