package handlers

import (
	"net/http"
	"sort"
	"time"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/functions"
	"github.com/OrgaNiUS/OrgaNiUS/server/ics"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/OrgaNiUS/OrgaNiUS/server/nusmods"
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
		if start.After(end) {
			DisplayError(ctx, "start cannot be after end")
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
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}

		type q struct {
			Url string `bson:"url" json:"url"`
		}
		var query q
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}

		// generate events by getting data from nusmods API
		events, err := nusmods.GenerateEvents(query.Url)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}

		// create events in database
		eventids, err := eventController.EventCreateMany(ctx, events)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}

		// add the events to the user
		userController.UserAddEvents(ctx, id, eventids)

		ctx.JSON(http.StatusCreated, gin.H{
			"events": events,
		})
	}
}

func EventIcs(userController controllers.UserController, eventController controllers.EventController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}

		formFile, err := ctx.FormFile("ics_file")
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		openedFile, err := formFile.Open()
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}

		events, err := ics.Parse(openedFile)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}

		// create events in database
		eventids, err := eventController.EventCreateMany(ctx, events)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}

		// add the events to the user
		userController.UserAddEvents(ctx, id, eventids)

		ctx.JSON(http.StatusCreated, gin.H{
			"events": events,
		})
	}
}

/*
	The following function EventCommonSlots is very long (almost 300 lines) but its fairly straightforward and can be broken into chunks with clear responsibilities.
	1. getting user query & validation
	2. getting eventids from database (for users & project)
	3. parsing eventids into events
	4. the algorithm to find common time slots (there are multiple steps to this algorithm which are detailed below)
*/

func EventCommonSlots(userController controllers.UserController, projectController controllers.ProjectController, eventController controllers.EventController, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		_, _, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "not logged in")
			return
		}

		type q struct {
			ProjectId string   `bson:"projectid" json:"projectid"`
			UserIds   []string `bson:"userids" json:"userids"`
			DateStart string   `bson:"dateStart" json:"dateStart"`
			DateEnd   string   `bson:"dateEnd" json:"dateEnd"`
			TimeStart string   `bson:"timeStart" json:"timeStart"`
			TimeEnd   string   `bson:"timeEnd" json:"timeEnd"`
			Duration  int64    `bson:"duration" json:"duration"`
		}
		var query q
		if err := ctx.BindJSON(&query); err != nil {
			DisplayError(ctx, err.Error())
			return
		}

		location, _ := time.LoadLocation("Asia/Singapore")

		dateLayout := "06-01-02"
		dateStart, err := time.ParseInLocation(dateLayout, query.DateStart, location)
		if err != nil {
			DisplayError(ctx, "bad date start")
			return
		}
		dateEnd, err := time.ParseInLocation(dateLayout, query.DateEnd, location)
		dateEnd = dateEnd.Add(time.Minute * (23*60 + 59))
		if err != nil {
			DisplayError(ctx, "bad date end")
			return
		}
		if dateStart.After(dateEnd) {
			DisplayError(ctx, "date must start before end")
			return
		}

		timeLayout := "15:04"
		timeStart, err := time.ParseInLocation(timeLayout, query.TimeStart, location)
		if err != nil {
			DisplayError(ctx, "bad time start")
			return
		}
		timeEnd, err := time.ParseInLocation(timeLayout, query.TimeEnd, location)
		if err != nil {
			DisplayError(ctx, "bad time end")
			return
		}
		if timeStart.After(timeEnd) {
			DisplayError(ctx, "time must start before end")
			return
		}

		if query.Duration <= 0 {
			DisplayError(ctx, "duration must be positive")
			return
		}

		if query.Duration > 60*24 {
			DisplayError(ctx, "duration cannot last more than 24 hours")
			return
		}

		if query.ProjectId == "" {
			DisplayError(ctx, "provide a projectid")
			return
		}

		userids := make([]primitive.ObjectID, len(query.UserIds))
		for i, uid := range query.UserIds {
			objectid, err := primitive.ObjectIDFromHex(uid)
			if err != nil {
				DisplayError(ctx, "bad userid "+uid)
				return
			}
			userids[i] = objectid
		}

		eventids, err := userController.UsersGetEventIds(ctx, userids)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}

		project, err := projectController.ProjectRetrieve(ctx, query.ProjectId)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		eventids = append(eventids, project.Events...)
		// at this stage, collected all eventids
		// thus, parse into events
		events := eventController.EventMapToArray(ctx, eventids)

		/*
			Performance is semi relevant here because there can be MANY events & users.

			1. filter out those outside of user's date range first - O(N) & decreases n for future computations
			2. perform sort on the intervals - O(n log n)
			3. merge the intervals - O(n)
			4. invert the intervals - O(n)
			5. trim intervals to time range & minimum duration - O(n)

			Overall, O(n log n) + O(N + 3n)

			Note: potentially can optimise by merging steps 3 & 4
		*/

		type s struct {
			Start time.Time
			End   time.Time
		}

		intervals := []s{}

		// filter out events that are out of date range
		// and convert them into slots at the same time (to save on a teeny bit of space, maybe)
		for _, e := range events {
			if e.Start.Before(dateStart) && e.End.Before(dateStart) {
				continue
			}
			if e.Start.After(dateEnd) && e.End.After(dateEnd) {
				continue
			}

			intervals = append(intervals, s{
				Start: e.Start,
				End:   e.End,
			})
		}

		// this section is essentially this problem (merge interval)
		// https://leetcode.com/problems/merge-intervals/
		sort.Slice(intervals, func(i, j int) bool {
			// custom sort comparator
			x := intervals[i]
			y := intervals[j]
			// Compare by Start then End.
			if !x.Start.Equal(y.Start) {
				return x.Start.Before(y.Start)
			}
			return x.End.Before(y.End)
		})

		mergedIntervals := []s{}
		prev := s{}

		// I took my previous solutions for this problem and translated it to golang
		for i, curr := range intervals {
			if i == 0 {
				prev.Start = curr.Start
				prev.End = curr.End
				continue
			}
			if !prev.End.Before(curr.Start) {
				if curr.End.After(prev.End) {
					prev.End = curr.End
				}
			} else {
				mergedIntervals = append(mergedIntervals, prev)

				prev.Start = curr.Start
				prev.End = curr.End
			}
			if i == len(intervals)-1 {
				// append last result
				mergedIntervals = append(mergedIntervals, prev)
			}
		}

		// inverting intervals to find empty slots
		invertedIntervals := []s{}

		for i, curr := range mergedIntervals {
			if i == 0 {
				// catch slots before first interval
				// run the third block
				if curr.Start.After(dateStart) {
					// only if valid space
					slot := s{
						Start: dateStart,
						End:   curr.Start.In(location),
					}
					invertedIntervals = append(invertedIntervals, slot)
				}
			}
			if i == len(mergedIntervals)-1 {
				// catch slots after last interval
				// and don't run the third block
				if dateEnd.After((curr.End)) {
					slot := s{
						Start: curr.End.In(location),
						End:   dateEnd,
					}
					invertedIntervals = append(invertedIntervals, slot)
				}
			} else {
				// always valid because intervals have been merged
				slot := s{
					Start: curr.End.In(location),
					End:   mergedIntervals[i+1].Start.In(location),
				}
				invertedIntervals = append(invertedIntervals, slot)
			}
		}

		if len(mergedIntervals) == 0 {
			// put the whole range here
			invertedIntervals = []s{
				{
					Start: dateStart,
					End:   dateEnd,
				},
			}
		}

		// returns if a slot is valid (based on the query duration)
		isValidSlot := func(slot s) bool {
			if slot.Start.After(slot.End) {
				return false
			}
			difference := slot.End.Sub(slot.Start)
			return difference >= time.Duration(query.Duration)*time.Minute
		}

		timeStartHour, timeStartMin, _ := timeStart.Clock()
		timeEndHour, timeEndMin, _ := timeEnd.Clock()

		truncateTime := func(hour, min int) func(t time.Time) time.Time {
			return func(t time.Time) time.Time {
				year, month, day := t.Date()
				return time.Date(year, month, day, hour, min, 0, 0, location)
			}
		}

		truncateToStart := truncateTime(timeStartHour, timeStartMin)
		truncateToEnd := truncateTime(timeEndHour, timeEndMin)

		trimSlot := func(slot s) []s {
			slots := []s{}
			current := s{
				Start: slot.Start,
				End:   slot.End,
			}

			for current.End.After(current.Start) {
				// trim the start time
				initialStart := truncateToStart(current.Start)
				start := initialStart
				end := truncateToEnd(current.Start)

				// if current.Start > start
				if current.Start.After(start) {
					start = current.Start
				}

				// if current.End < end
				if current.End.Before(end) {
					end = current.End
				}

				slot := s{
					Start: start,
					End:   end,
				}
				if isValidSlot(slot) {
					slots = append(slots, slot)
				}

				current.Start = initialStart.Add(24 * time.Hour)
			}

			return slots
		}

		slots := []s{}

		for _, interval := range invertedIntervals {
			trimmedSlots := trimSlot(interval)
			slots = append(slots, trimmedSlots...)
		}

		ctx.JSON(http.StatusOK, gin.H{
			"slots": slots,
		})
	}
}
