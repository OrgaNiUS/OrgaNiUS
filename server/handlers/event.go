package handlers

import (
	"net/http"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/functions"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

func EventGet(eventController controllers.EventController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		_, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		eventid := ctx.DefaultQuery("eventid", "")
		event, err := eventController.EventGet(ctx, eventid)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		ctx.JSON(http.StatusOK, gin.H{
			"id":    event.Id.Hex(),
			"name":  event.Name,
			"start": event.Start,
			"end":   event.End,
		})
	}
}

func EventGetAll(userController controllers.UserController, projectController controllers.ProjectController, eventController controllers.EventController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		projectid := ctx.DefaultQuery("projectid", "")
		var eventids []string
		if projectid == "" {
			// Get all user events.
			user, err := userController.UserRetrieve(ctx, id, "")
			if err != nil {
				// should never reach here unless someone messed with their JWT
				DisplayNotAuthorized(ctx, "something went wrong, try again")
				return
			}
			eventids = user.Events
		} else {
			// Get all project events for a projectid.
			project, err := projectController.ProjectRetrieve(ctx, projectid)
			if err != nil {
				DisplayNotAuthorized(ctx, "bad project id")
				return
			}
			eventids = project.Events
		}
		events := eventController.EventMapToArray(ctx, eventids)
		ctx.JSON(http.StatusOK, gin.H{
			"events": events,
		})
	}
}

func EventModify(eventController controllers.EventController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		_, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		type q struct {
			Id    string  `bson:"eventid" json:"eventid"`
			Name  *string `bson:"name" json:"name"`
			Start *string `bson:"start" json:"start"`
			End   *string `bson:"end" json:"end"`
		}
		var query q
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		if query.Id == "" {
			DisplayError(ctx, "please provide eventid")
			return
		}
		eventid, err := primitive.ObjectIDFromHex(query.Id)
		if err != nil {
			DisplayError(ctx, "invalid eventid")
			return
		}

		err = eventController.EventModify(ctx, eventid, query.Name, query.Start, query.End)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		ctx.JSON(http.StatusOK, gin.H{})
	}
}

func EventDelete(userController controllers.UserController, projectController controllers.ProjectController, eventController controllers.EventController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}
		eventid := ctx.DefaultQuery("eventid", "")
		if eventid == "" {
			DisplayError(ctx, "provide the eventid")
			return
		}
		objectid, err := primitive.ObjectIDFromHex(eventid)
		if err != nil {
			DisplayError(ctx, "invalid eventid")
			return
		}
		if err := eventController.EventDelete(ctx, objectid); err != nil {
			DisplayError(ctx, "could not delete event")
			return
		}
		projectid := ctx.DefaultQuery("projectid", "")
		if projectid == "" {
			// Delete from the user.
			userid, _ := primitive.ObjectIDFromHex(id)
			userController.UserRemoveEvents(ctx, userid, []string{eventid})
		} else {
			// Delete from the project.
			projectobjectid, err := primitive.ObjectIDFromHex(projectid)
			if err != nil {
				DisplayError(ctx, "invalid projectid")
				return
			}
			projectController.ProjectRemoveEvents(ctx, projectobjectid, []string{eventid})
		}
		ctx.JSON(http.StatusOK, gin.H{})
	}
}

func EventNusmods(userController controllers.UserController, eventController controllers.EventController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {

	}
}
