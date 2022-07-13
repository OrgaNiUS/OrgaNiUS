package socket

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var (
	// TODO: might have to change CheckOrigin func here
	upgrader = websocket.Upgrader{}
)

// Look at ProjectSearch in project.go for an example of how to use this function.
func CreateWebSocketFunction(transform func(ctx *gin.Context, message []byte) (interface{}, bool)) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		c, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if err != nil {
			log.Print("Error when upgrading websocket connection: ", err)
		}
		defer c.Close()

		// start infinite loop
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				log.Print("Error when reading from websocket connection: ", err)
				break
			}

			returnMessage, shouldClose := transform(ctx, message)

			if shouldClose {
				break
			}

			err = c.WriteJSON(returnMessage)
			if err != nil {
				log.Print("Error when writing to websocket connection: ", err)
				break
			}
		}
	}
}
