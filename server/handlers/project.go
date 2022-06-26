package handlers

import (
	"net/http"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// Input parameters "projectid" : "projectid"
func ProjectGet(userController controllers.UserController, projectController controllers.ProjectController, taskController controllers.TaskController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		_, _, ok := jwtParser.GetFromJWT(ctx)
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
			// only return a non-sensitive subset of the information
			type NameId struct {
				Name string `bson:"name" json:"name"`
				Id   string `bson:"_id,omitempty" json:"id,omitempty"`
			}
			userArr := []NameId{}
			for _, user := range userController.UserMapToArray(ctx, project.Members) {
				var nameid NameId
				nameid.Name = user.Name
				nameid.Id = user.Id.Hex()
				userArr = append(userArr, nameid)
			}
			returnedProject := gin.H{
				"name":         project.Name,
				"description":  project.Description,
				"creationTime": project.CreationTime,
				"members":      userArr,
				"tasks":        taskController.TaskMapToArray(ctx, project.Tasks),
				"events":       struct{}{}, // to be implemented
			}
			ctx.JSON(http.StatusOK, returnedProject)
		}
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
		user.Projects[project.Id.Hex()] = struct{}{}
		userController.UserAddProject(ctx, &user)

		ctx.JSON(http.StatusCreated, gin.H{
			"projectid": project.Id.Hex(),
		})
	}
}
