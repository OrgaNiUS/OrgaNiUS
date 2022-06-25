package handlers

import (
	"fmt"
	"net/http"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// name: string,
// description: string,
// users: string[userids],
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
			Users       []string `bson:"users" json:"users"`
			ProjectId   string   `bson:"projectid" json:"projectid"`
		}
		var query Query
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		task.Name = query.Name
		task.Description = query.Description

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
			userController.UserAddTask(ctx, &user)
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
			fmt.Println("Checkpoint Reached")
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
				userController.UserAddTask(ctx, &user)
			}
			// Add Task to Project.Tasks Array
			project.Tasks[taskid] = struct{}{}
			projectController.ProjectModifyTask(ctx, &project)
		}

		ctx.JSON(http.StatusCreated, gin.H{})
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
			userController.UserDeleteTasks(ctx, &user)
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
					userController.UserDeleteTasks(ctx, &user)
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

// taskid: string, users: string[userid]
func TaskAddUser(userController controllers.UserController, taskController controllers.TaskController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		_, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		type Query struct {
			TaskId string   `bson:"taskid" json:"taskid"`
			Users  []string `bson:"users" json:"users"`
		}
		var query Query
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		task, err := taskController.TaskRetrieve(ctx, query.TaskId)
		if err == mongo.ErrNoDocuments {
			DisplayError(ctx, "task does not exist")
		} else if err != nil {
			DisplayError(ctx, err.Error())
		}
		for _, userid := range query.Users {
			user, err := userController.UserRetrieve(ctx, userid, "")
			if err == mongo.ErrNoDocuments {
				DisplayError(ctx, "user does not exist")
			} else if err != nil {
				DisplayError(ctx, err.Error())
			}
			user.Tasks[query.TaskId] = false
			userController.UserAddTask(ctx, &user)
			task.AssignedTo[userid] = struct{}{}
		}
		fmt.Println(task.AssignedTo)
		taskController.TaskAddUser(ctx, &task)
		ctx.JSON(http.StatusOK, gin.H{})
	}
}
