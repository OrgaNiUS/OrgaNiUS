// Sets up a connection with MongoDB database.
package db

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Connect(dbUsername, dbPassword string) (*mongo.Client, context.CancelFunc) {
	serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)
	URI := fmt.Sprintf("mongodb+srv://%s:%s@organius.zwjpt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", dbUsername, dbPassword)
	clientOptions := options.Client().
		ApplyURI(URI).
		SetServerAPIOptions(serverAPIOptions)
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	databases, err := client.ListDatabaseNames(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(databases)
	return client, cancel
}
