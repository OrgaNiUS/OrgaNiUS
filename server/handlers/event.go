package handlers

import (
	"net/http"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/functions"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
)

func EventCreate(userController controllers.UserController, projectController controllers.ProjectController, eventController controllers.EventController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		type q struct {
			Name      string `bson:"name" json:"name"`
			Start     string `bson:"start" json:"start"`
			End       string `bson:"end" json:"end"`
			ProjectId string `bson:"projectid" json:"projectid"`
		}
		var query q
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		if query.Name == "" {
			DisplayError(ctx, "name is required")
			return
		}
		start, err := functions.StringToTime(query.Start)
		if err != nil {
			DisplayError(ctx, "bad start time")
			return
		}
		end, err := functions.StringToTime(query.End)
		if err != nil {
			DisplayError(ctx, "bad end time")
			return
		}
		event := models.Event{
			Name:  query.Name,
			Start: start,
			End:   end,
		}

		// create the event in database, the Id field of event will be populated as a side effect
		if err := eventController.EventCreate(ctx, &event); err != nil {
			DisplayError(ctx, err.Error())
			return
		}

		eventids := []string{string(event.Id.Hex())}
		if query.ProjectId == "" {
			userController.UserAddEvents(ctx, id, eventids)
		} else {
			projectController.ProjectAddEvents(ctx, query.ProjectId, eventids)
		}

		ctx.JSON(http.StatusCreated, gin.H{
			"eventid": event.Id,
		})
	}
}

func EventGet() gin.HandlerFunc {
	return func(ctx *gin.Context) {

	}
}

func EventGetAll() gin.HandlerFunc {
	return func(ctx *gin.Context) {

	}
}

func EventModify() gin.HandlerFunc {
	return func(ctx *gin.Context) {

	}
}

func EventDelete() gin.HandlerFunc {
	return func(ctx *gin.Context) {

	}
}
