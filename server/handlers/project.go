package handlers

import (
	"net/http"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// Input parameters
// "projectid" : "projectid"
func ProjectGet(controller controllers.ProjectController) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		type Query struct {
			ProjectId string `bson:"projectid" json:"projectid"`
		}
		var q Query
		if err := ctx.BindJSON(&q); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		project, err := controller.ProjectRetrieve(ctx, q.ProjectId)
		if err == mongo.ErrNoDocuments {
			DisplayError(ctx, "project does not exist")
		} else if err != nil {
			DisplayError(ctx, err.Error())
		} else {
			// only return a non-sensitive subset of the information
			returnedProject := gin.H{
				"name":         project.Name,
				"description":  project.Description,
				"creationTime": project.CreationTime,
			}
			ctx.JSON(http.StatusOK, returnedProject)
		}
	}
}

// Input parameters
// "name" : "projectname"
// "description" : "projectDescription"
func ProjectCreate(userController controllers.UserController, controller controllers.ProjectController, jwtParser *auth.JWTParser) gin.HandlerFunc {
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
				return isValidName(project.Name)
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

		if err := controller.ProjectCreate(ctx, &project, id); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		user.Projects[project.Id.Hex()] = struct{}{}
		userController.UserAddProject(ctx, &user)

		ctx.JSON(http.StatusCreated, gin.H{})

	}
}
