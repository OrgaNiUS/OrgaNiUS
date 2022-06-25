package handlers

import (
	"net/http"
	"time"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// name: string,
// description: string,
// assignedTo: string[userids],
// deadline: time.Time
// projectID: string
// No projectid -> Personal Task
// Projectid and No Users -> A project task, waiting to be assigned
// ProjectId and Users -> A project task is assigned to users
func TaskCreate(userController controllers.UserController, projectController controllers.ProjectController, taskController controllers.TaskController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		var task models.Task
		type Query struct {
			Name        string   `bson:"name" json:"name"`
			Description string   `bson:"description" json:"description"`
			Users       []string `bson:"assignedTo" json:"assignedTo"`
			ProjectId   string   `bson:"projectid" json:"projectid"`
			Deadline    string   `bson:"deadline" json:"deadline"`
		}
		var query Query
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		task.Name = query.Name
		task.Description = query.Description
		if query.Deadline != "" {
			deadline, err := time.Parse("2006-01-02T15:04:05-0700", query.Deadline)
			if err != nil {
				DisplayError(ctx, "Please provide time in proper ISO8601 format")
				return
			}
			task.Deadline = deadline
		}

		if query.ProjectId == "" {
			if err := taskController.TaskCreate(ctx, &task); err != nil {
				DisplayError(ctx, err.Error())
				return
			}
			user, err := userController.UserRetrieve(ctx, id, "")
			if err == mongo.ErrNoDocuments {
				DisplayError(ctx, "user does not exist")
			} else if err != nil {
				DisplayError(ctx, err.Error())
			}
			user.Tasks[task.Id.Hex()] = true
			userController.UserModifyTask(ctx, &user)
		} else {
			project, err := projectController.ProjectRetrieve(ctx, query.ProjectId)
			if err == mongo.ErrNoDocuments {
				DisplayError(ctx, "project does not exist")
			} else if err != nil {
				DisplayError(ctx, err.Error())
			}
			// Add Users to newly Created Task
			task.AssignedTo = make(map[string]struct{})
			for _, userid := range query.Users {
				task.AssignedTo[userid] = struct{}{}
			}
			if err := taskController.TaskCreate(ctx, &task); err != nil {
				DisplayError(ctx, err.Error())
				return
			}
			taskid := task.Id.Hex()
			// Add Task to User.Tasks Array
			for _, userid := range query.Users {
				user, err := userController.UserRetrieve(ctx, userid, "")
				if err == mongo.ErrNoDocuments {
					DisplayError(ctx, "user does not exist")
				} else if err != nil {
					DisplayError(ctx, err.Error())
				}
				user.Tasks[taskid] = false
				userController.UserModifyTask(ctx, &user)
			}
			// Add Task to Project.Tasks Array
			project.Tasks[taskid] = struct{}{}
			projectController.ProjectModifyTask(ctx, &project)
		}

		ctx.JSON(http.StatusCreated, gin.H{
			"taskid": task.Id.Hex(),
		})
	}
}

// projectid: string, tasks: string[taskid]
func TaskDelete(userController controllers.UserController, projectController controllers.ProjectController, taskController controllers.TaskController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		type Query struct {
			ProjectId string   `bson:"projectid" json:"projectid"`
			Tasks     []string `bson:"tasks" json:"tasks"`
		}
		var query Query
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		if len(query.Tasks) == 0 {
			DisplayError(ctx, "please provide a task to delete")
		}
		// if True delete Personal Task, else delete Project Task
		if query.ProjectId == "" {
			user, err := userController.UserRetrieve(ctx, id, "")
			if err == mongo.ErrNoDocuments {
				DisplayError(ctx, "user does not exist")
			} else if err != nil {
				DisplayError(ctx, err.Error())
			}
			for _, taskid := range query.Tasks {
				_, containsTask := user.Tasks[taskid]
				if !containsTask {
					continue
				}
				delete(user.Tasks, taskid)
				if err := taskController.TaskDelete(ctx, taskid); err != nil {
					DisplayError(ctx, err.Error())
				}
			}
			userController.UserModifyTask(ctx, &user)
			ctx.JSON(http.StatusOK, gin.H{})
		} else {
			project, err := projectController.ProjectRetrieve(ctx, query.ProjectId)
			if err == mongo.ErrNoDocuments {
				DisplayError(ctx, "project does not exist")
			} else if err != nil {
				DisplayError(ctx, err.Error())
			}
			for _, taskid := range query.Tasks {
				_, containsTask := project.Tasks[taskid]
				if !containsTask {
					continue
				}
				task, err := taskController.TaskRetrieve(ctx, taskid)
				if err == mongo.ErrNoDocuments {
					DisplayError(ctx, "task does not exist")
				} else if err != nil {
					DisplayError(ctx, err.Error())
				}

				for userid := range task.AssignedTo {
					user, err := userController.UserRetrieve(ctx, userid, "")
					if err == mongo.ErrNoDocuments {
						DisplayError(ctx, "user does not exist")
					} else if err != nil {
						DisplayError(ctx, err.Error())
					}
					delete(user.Tasks, taskid)
					userController.UserModifyTask(ctx, &user)
				}

				delete(project.Tasks, taskid)
				if err := taskController.TaskDelete(ctx, taskid); err != nil {
					DisplayError(ctx, err.Error())
				}
			}
			projectController.ProjectModifyTask(ctx, &project)
			ctx.JSON(http.StatusOK, gin.H{})
		}
	}
}

// taskid: string, name: string, assignedTo: string[userid], description: string, deadline: string, isDone: bool
func TaskModify(userController controllers.UserController, taskController controllers.TaskController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		_, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		type Query struct {
			TaskId      string   `bson:"taskid" json:"taskid"`
			Name        string   `bson:"name" json:"name"`
			AssignedTo  []string `bson:"assignedTo" json:"assignedTo"`
			Description string   `bson:"description" json:"description"`
			Deadline    string   `bson:"deadline" json:"deadline"`
			IsDone      bool     `bson:"isDone" json:"isDone"`
		}
		var query Query
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		if query.TaskId == "" {
			DisplayError(ctx, "Please provide taskid of task to modify")
			return
		}
		var newTask models.Task
		newTask.Name = query.Name
		newTask.Description = query.Description
		newTask.AssignedTo = make(map[string]struct{})
		for _, userid := range query.AssignedTo {
			newTask.AssignedTo[userid] = struct{}{}
		}
		if query.Deadline != "" {
			newTask.Deadline, _ = time.Parse("2006-01-02T15:04:05-0700", query.Deadline)
		}
		newTask.IsDone = query.IsDone

		task, err := taskController.TaskRetrieve(ctx, query.TaskId)
		if err == mongo.ErrNoDocuments {
			DisplayError(ctx, "task does not exist")
		} else if err != nil {
			DisplayError(ctx, err.Error())
		}
		newTask.Id = task.Id
		if len(query.AssignedTo) != 0 {
			// Delete users from task
			for userid := range task.AssignedTo {
				_, found := newTask.AssignedTo[userid]
				if !found {
					user, err := userController.UserRetrieve(ctx, userid, "")
					if err == mongo.ErrNoDocuments {
						DisplayError(ctx, "user does not exist")
					} else if err != nil {
						DisplayError(ctx, err.Error())
					}
					delete(user.Tasks, task.Id.Hex())
					userController.UserModifyTask(ctx, &user)
				}
			}

			// Add users to task
			for _, userid := range query.AssignedTo {
				user, err := userController.UserRetrieve(ctx, userid, "")
				if err == mongo.ErrNoDocuments {
					DisplayError(ctx, "user does not exist")
				} else if err != nil {
					DisplayError(ctx, err.Error())
				}
				user.Tasks[query.TaskId] = false
				userController.UserModifyTask(ctx, &user)
				task.AssignedTo[userid] = struct{}{}
			}
		}

		taskController.TaskModify(ctx, &newTask)
		ctx.JSON(http.StatusOK, gin.H{})
	}
}

func TaskGetAll(userController controllers.UserController, projectController controllers.ProjectController, taskController controllers.TaskController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		type Query struct {
			ProjectId string `bson:"projectid" json:"projectid"`
		}
		var q Query
		if err := ctx.BindJSON(&q); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		var taskArr []models.Task
		if q.ProjectId == "" {
			user, err := userController.UserRetrieve(ctx, id, "")
			if err == mongo.ErrNoDocuments {
				DisplayError(ctx, "user does not exist")
			} else if err != nil {
				DisplayError(ctx, err.Error())
			}
			taskArr = taskController.TaskMapToArrayUser(ctx, user.Tasks)
		} else {
			project, err := projectController.ProjectRetrieve(ctx, q.ProjectId)
			if err == mongo.ErrNoDocuments {
				DisplayError(ctx, "project does not exist")
			} else if err != nil {
				DisplayError(ctx, err.Error())
			}
			taskArr = taskController.TaskMapToArray(ctx, project.Tasks)
		}

		ctx.JSON(http.StatusOK, gin.H{"tasks": taskArr})
	}
}
