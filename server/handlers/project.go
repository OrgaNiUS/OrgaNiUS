package handlers

import (
	"net/http"
	"time"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// Input parameters "projectid" : "projectid"
func ProjectGet(userController controllers.UserController, projectController controllers.ProjectController, taskController controllers.TaskController, eventController controllers.EventController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		projectid := ctx.DefaultQuery("projectid", "")
		project, err := projectController.ProjectRetrieve(ctx, projectid)
		if err == mongo.ErrNoDocuments {
			DisplayError(ctx, "project does not exist")
		} else if err != nil {
			DisplayError(ctx, err.Error())
		} else {
			if _, ok := project.Members[id]; !ok {
				DisplayNotAuthorized(ctx, "you lack permissions")
				return
			}
			// only return a non-sensitive subset of the information
			type NameIdRole struct {
				Name string `bson:"name" json:"name"`
				Id   string `bson:"_id,omitempty" json:"id,omitempty"`
				Role string `bson:"role" json:"role"`
			}
			userArr := []NameIdRole{}
			useridStrArr := []string{}
			for userid := range project.Members {
				useridStrArr = append(useridStrArr, userid)
			}
			for _, user := range userController.UserMapToArray(ctx, useridStrArr) {
				var nameid NameIdRole
				nameid.Name = user.Name
				nameid.Id = user.Id.Hex()
				nameid.Role = project.Members[nameid.Id]
				userArr = append(userArr, nameid)
			}
			returnedProject := gin.H{
				"name":         project.Name,
				"description":  project.Description,
				"creationTime": project.CreationTime,
				"members":      userArr,
				"tasks":        taskController.TaskMapToArray(ctx, project.Tasks),
				"events":       eventController.EventMapToArray(ctx, project.Events),
			}
			ctx.JSON(http.StatusOK, returnedProject)
		}
	}
}

func ProjectGetAll(userController controllers.UserController, projectController controllers.ProjectController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		user, err := userController.UserRetrieve(ctx, id, "")
		if err == mongo.ErrNoDocuments {
			DisplayError(ctx, "user does not exist")
		} else if err != nil {
			DisplayError(ctx, err.Error())
		}
		projArr := projectController.ProjectArrayToModel(ctx, user.Projects)
		type Result struct {
			Id           string    `bson:"_id,omitempty" json:"id,omitempty"`
			Name         string    `bson:"name" json:"name"`
			Description  string    `bson:"description" json:"description"`
			CreationTime time.Time `bson:"creationTime" json:"creationTime"`
		}
		resultArr := []Result{}
		for _, project := range projArr {
			resultArr = append(resultArr, Result{
				Id:           project.Id.Hex(),
				Name:         project.Name,
				Description:  project.Description,
				CreationTime: project.CreationTime,
			})
		}
		ctx.JSON(http.StatusOK, gin.H{"projects": resultArr})
	}
}

func isValidProjectName(name string) (string, bool) {
	if name == "" {
		return "please provide a name", false
	} else if len(name) < 5 {
		return "name too short", false
	}
	return "", true
}

// Input parameters "name" : "projectname" "description" : "projectDescription" return projectid
func ProjectCreate(userController controllers.UserController, projectController controllers.ProjectController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		var project models.Project
		if err := ctx.BindJSON(&project); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		tests := []func() (string, bool){
			// create valid project name allow spaces
			func() (string, bool) {
				return isValidProjectName(project.Name)
			},
			// add test for description here
		}
		for _, t := range tests {
			if msg, ok := t(); !ok {
				DisplayError(ctx, msg)
				return
			}
		}
		user, err := userController.UserRetrieve(ctx, id, "")
		if err == mongo.ErrNoDocuments {
			DisplayError(ctx, "user does not exist")
		} else if err != nil {
			DisplayError(ctx, err.Error())
		}

		if err := projectController.ProjectCreate(ctx, &project, id); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		userController.UserAddProject(ctx, user.Id, project.Id.Hex())

		ctx.JSON(http.StatusCreated, gin.H{
			"projectid": project.Id.Hex(),
		})
	}
}

// Input parameters users: []string{userids}, projectid: string
func ProjectInviteUser(userController controllers.UserController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		_, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		type Query struct {
			Id        string   `bson:"projectid" json:"projectid"`
			Usernames []string `bson:"users" json:"users"`
		}
		var query Query
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		userController.UsersInviteFromProject(ctx, query.Usernames, query.Id)
		ctx.JSON(http.StatusOK, gin.H{})
	}
}

func ProjectGetApplicants(userController controllers.UserController, projectController controllers.ProjectController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		projectid := ctx.DefaultQuery("projectid", "")

		project, err := projectController.ProjectRetrieve(ctx, projectid)
		if err != nil {
			DisplayError(ctx, "project not found")
		}

		if !project.Settings.Roles[project.Members[id]].IsAdmin {
			DisplayNotAuthorized(ctx, "lacking admin permissions to execute action")
			return
		}

		size := len(project.Applications)
		userids := make([]string, size)

		i := 0
		for k := range project.Applications {
			userids[i] = k
			i++
		}

		users := userController.UserMapToArray(ctx, userids)

		type resultType struct {
			Id          string `bson:"id" json:"id"`
			Name        string `bson:"name" json:"name"`
			Description string `bson:"description" json:"description"`
		}

		result := make([]resultType, size)

		for i, user := range users {
			id := user.Id.Hex()
			result[i] = resultType{
				Id:          id,
				Name:        user.Name,
				Description: project.Applications[id].Description,
			}
		}

		ctx.JSON(http.StatusOK, gin.H{
			"id":         project.Id.Hex(),
			"name":       project.Name,
			"applicants": result,
		})
	}
}

// Input parameters rejectedUsers:[]string{userids} acceptedUsers: []string{userids}, projectid: string
// Approach 1: pass in a final call to backend after selecting who you want to choose and who you want to reject. Approach 2 look at user.go/handlers
// Only for admin to do
func ProjectChooseUsers(userController controllers.UserController, projectController controllers.ProjectController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		type Query struct {
			Id     string   `bson:"projectid" json:"projectid"`
			AccIds []string `bson:"acceptedUsers" json:"acceptedUsers"`
			RejIds []string `bson:"rejectedUsers" json:"rejectedUsers"`
		}
		var query Query
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		project, err := projectController.ProjectRetrieve(ctx, query.Id)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}

		if !project.Settings.Roles[project.Members[id]].IsAdmin {
			DisplayNotAuthorized(ctx, "lacking admin permissions to execute action")
			return
		}

		if len(query.RejIds) != 0 {
			projectController.ProjectRemoveAppl(ctx, query.Id, query.RejIds)
		}
		if len(query.AccIds) != 0 {
			for _, userid := range query.AccIds {
				project.Members[userid] = "member"
			}
			projectController.ProjectAddUsers(ctx, query.Id, &project)       // Add userid to project.Members
			projectController.ProjectRemoveAppl(ctx, query.Id, query.AccIds) // Remove userid from project.Applications
			userController.UsersAddProject(ctx, query.AccIds, query.Id)      // Add projectid to user.Projects
		}
		ctx.JSON(http.StatusOK, gin.H{})
	}
}

// input: projectid: string, userids: []string
func ProjectRemoveUsers(userController controllers.UserController, projectController controllers.ProjectController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		type Query struct {
			Id      string   `bson:"projectid" json:"projectid"`
			UserIds []string `bson:"userids" json:"userids"`
		}
		var query Query
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		if len(query.UserIds) == 0 {
			return
		}
		project, err := projectController.ProjectRetrieve(ctx, query.Id)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}

		if !project.Settings.Roles[project.Members[id]].IsAdmin {
			DisplayNotAuthorized(ctx, "lacking admin permissions to execute action")
			return
		}

		// cross check any project tasks from removed users.
		for _, userid := range query.UserIds {
			user, err := userController.UserRetrieve(ctx, userid, "")
			if err != nil {
				DisplayError(ctx, err.Error())
				return
			}
			for _, projectid := range project.Tasks {
				delete(user.Tasks, projectid)
			}
			userController.UserModifyTask(ctx, &user)
			delete(project.Members, userid)
		}

		// delete the projectid from user
		userController.UsersDeleteProject(ctx, query.UserIds, query.Id)

		// delete the userids from project
		projectController.ProjectModifyUser(ctx, &project)

		ctx.JSON(http.StatusOK, gin.H{})
	}
}

// projectid: string; name: string; description: string; isPublic: bool
func ProjectModify(projectController controllers.ProjectController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		type Query struct {
			Id          string  `bson:"projectid" json:"projectid"`
			Name        *string `bson:"name" json:"name"`
			Description *string `bson:"description" json:"description"`
			IsPublic    *bool   `bson:"isPublic" json:"isPublic"`
		}
		var query Query
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		if query.Id == "" {
			DisplayError(ctx, "Please provide id of project to modify")
			return
		}
		project, err := projectController.ProjectRetrieve(ctx, query.Id)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		if !project.Settings.Roles[project.Members[id]].IsAdmin {
			DisplayNotAuthorized(ctx, "lacking admin permissions to execute action")
			return
		}
		primId, _ := primitive.ObjectIDFromHex(query.Id)
		projectController.ProjectModifyGeneral(ctx, primId, query.Name, query.Description, query.IsPublic)
		ctx.JSON(http.StatusOK, gin.H{})
	}
}

// projectid: string
func ProjectDelete(userController controllers.UserController, projectController controllers.ProjectController, taskController controllers.TaskController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		projectid := ctx.DefaultQuery("projectid", "")
		project, err := projectController.ProjectRetrieve(ctx, projectid)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}

		if !project.Settings.Roles[project.Members[id]].IsAdmin {
			DisplayNotAuthorized(ctx, "lacking admin permissions to execute action")
			return
		}

		// Delete projectid from all users in userCollection
		userController.UsersDeleteProject(ctx, []string{}, projectid)

		// Delete all project tasks completely
		for _, taskid := range project.Tasks {
			task, err := taskController.TaskRetrieve(ctx, taskid)
			if err == mongo.ErrNoDocuments {
				DisplayError(ctx, "task does not exist")
			} else if err != nil {
				DisplayError(ctx, err.Error())
			}
			for _, userid := range task.AssignedTo {
				user, err := userController.UserRetrieve(ctx, userid, "")
				if err == mongo.ErrNoDocuments {
					DisplayError(ctx, "user does not exist")
				} else if err != nil {
					DisplayError(ctx, err.Error())
				}
				delete(user.Tasks, taskid)
				userController.UserModifyTask(ctx, &user)
			}
		}
		taskController.TaskDeleteMany(ctx, project.Tasks)

		// Delete project from database
		projectController.ProjectDelete(ctx, projectid)
		ctx.JSON(http.StatusOK, gin.H{})
	}
}
