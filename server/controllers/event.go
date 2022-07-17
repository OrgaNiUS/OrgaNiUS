package controllers

import (
	"context"

	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	eventCollection = "events"
)

func (c *EventController) EventCreate(ctx context.Context, event *models.Event) error {
	id, err := c.Collection(eventCollection).InsertOne(ctx, event)
	if err != nil {
		return err
	}
	event.Id = id

	return nil
}

func (c *EventController) EventMapToArray(ctx context.Context, events []string) []models.Event {
	size := len(events)
	ids := make([]primitive.ObjectID, size)
	result := make([]models.Event, size)
	for i, eventid := range events {
		id, _ := primitive.ObjectIDFromHex(eventid)
		ids[i] = id
	}
	c.Collection(eventCollection).FindAll(ctx, ids, &result)
	return result
}
