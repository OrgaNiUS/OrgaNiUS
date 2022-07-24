package socket

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

/*
	This chat server is built upon this example listed in gorilla web socket's repo.

	https://github.com/gorilla/websocket/tree/master/examples/chat
*/

const (
	// time allowed to write a message to peer
	writeWait = 10 * time.Second

	// time allowed to read next pong message from peer
	pongWait = 60 * time.Second

	// send pings to peer with this period, pingPeriod < pongWait
	pingPeriod = (pongWait * 9) / 10

	// maximum message size
	maxMessageSize = 512
)

var (
	chatUpgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	newLine = []byte{'\n'}
)

// TODO: handle for different projects
type ChatHub struct {
	// set of registered clients
	clients map[*ChatClient]bool

	// messages to be broadcasted
	broadcast chan []byte

	// register requests from client
	register chan *ChatClient

	// unregister requests from client
	unregister chan *ChatClient
}

func NewChatHub() *ChatHub {
	return &ChatHub{
		broadcast:  make(chan []byte),
		register:   make(chan *ChatClient),
		unregister: make(chan *ChatClient),
		clients:    make(map[*ChatClient]bool),
	}
}

func (h *ChatHub) Run() {
	// infinite loop to handle register/unregister & broadcasting messages
	for {
		select {
		case client := <-h.register:
			// client requests to join hub
			h.clients[client] = true
		case client := <-h.unregister:
			// client requests to leave hub
			if _, ok := h.clients[client]; ok {
				// check if client exists in list of clients before closing connection
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			// somebody sent a message
			for client := range h.clients {
				// loop through all the clients and broadcast to them
				select {
				// broadcast the message to client's receiving channel
				case client.send <- message:
				// if client has disconencted, close the channel
				default:
					delete(h.clients, client)
					close(client.send)
				}
			}
		}
	}
}

type ChatClient struct {
	hub *ChatHub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte
}

// reads messages from the websocket connection
func (c *ChatClient) readPump() {
	defer func() {
		// handles when client closes the connection

		// unregister from hub
		c.hub.unregister <- c
		// close connection
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	// ensures that the client is still actively conneced to the server
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Print(err)
			}
			break
		}
		// TODO: unmarshal message into a struct instead (& let broadcast take in a struct of message)
		// trimmedMessage := bytes.TrimSpace(bytes.Replace(message, newLine, space, -1))
		c.hub.broadcast <- message
	}
}

// sends messages to the client through websocket connection
func (c *ChatClient) writePump() {
	ticker := time.NewTicker(pingPeriod)

	defer func() {
		// handles when client closes the connection

		// stops the ticker
		ticker.Stop()
		// closes connection
		c.conn.Close()
	}()

	for {
		select {
		case message, isChannelOk := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !isChannelOk {
				// hub closed the channel
				c.conn.WriteMessage(websocket.CloseMessage, []byte("Connection closed."))
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(c.send)
			for i := 0; i < n; i++ {
				// sends all queued messages to the client
				w.Write(newLine)
				w.Write(<-c.send)
			}

			// close the writer
			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			// send ping message
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func ChatHandler(hub *ChatHub) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if err != nil {
			log.Print("Error when upgrading websocket connection (for chat): ", err)
			return
		}

		client := &ChatClient{
			hub:  hub,
			conn: conn,
			send: make(chan []byte, 256),
		}

		// register new client
		client.hub.register <- client

		// run in goroutines for concurrency
		go client.writePump()
		go client.readPump()
	}
}
