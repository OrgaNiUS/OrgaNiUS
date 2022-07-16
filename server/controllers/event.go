package controllers

import (
	"context"

	"github.com/OrgaNiUS/OrgaNiUS/server/models"
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
