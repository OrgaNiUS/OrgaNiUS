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

	// maximum message size (in bytes)
	maxMessageSize = 512
)

type ChatMessage struct {
	RoomId      string    `json:"projectid"`
	MessageType string    `json:"messageType"`
	User        string    `json:"user"`
	Message     string    `json:"message"`
	Joined      bool      `json:"joined"`
	Time        time.Time `json:"time"`
}

var (
	chatUpgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
)

type Clients = map[*ChatClient]bool

type ChatHub struct {
	// set of registered clients
	rooms map[string]Clients

	// messages to be broadcasted
	broadcast chan ChatMessage

	// register requests from client
	register chan *ChatClient

	// unregister requests from client
	unregister chan *ChatClient
}

func NewChatHub() *ChatHub {
	return &ChatHub{
		rooms: make(map[string]Clients),
		// needs a buffer, else cannot pass anything to it in Run()
		broadcast:  make(chan ChatMessage, 1),
		register:   make(chan *ChatClient),
		unregister: make(chan *ChatClient),
	}
}

func (h *ChatHub) broadcastMessage(message ChatMessage) {
	room, isRoomOk := h.rooms[message.RoomId]
	if !isRoomOk {
		// should not happen, because room should be created on register
		// but just in case, just skip it
		return
	}

	for client := range room {
		// loop through all the clients in the room and broadcast to them
		select {
		// broadcast the message to client's receiving channel
		case client.send <- message:
		// if client has disconencted, close the channel
		default:
			delete(room, client)
			close(client.send)

			if len(room) == 0 {
				// if room is now empty, remove it
				delete(h.rooms, client.roomid)
			}
		}
	}
}

func (h *ChatHub) Run() {
	// infinite loop to handle register/unregister & broadcasting messages
	for {
		select {
		case client := <-h.register:
			// client requests to join hub
			room, isRoomOk := h.rooms[client.roomid]
			if !isRoomOk {
				// room does not exist yet -> create a room
				h.rooms[client.roomid] = make(map[*ChatClient]bool)
				room = h.rooms[client.roomid]
			} else {
				// user has joined message
				joinMessage := ChatMessage{
					RoomId:      client.roomid,
					MessageType: "join",
					User:        client.user,
					Joined:      true,
					Time:        time.Now(),
				}

				h.broadcastMessage(joinMessage)
			}
			room[client] = true
		case client := <-h.unregister:
			// client requests to leave hub
			room, isRoomOk := h.rooms[client.roomid]
			if !isRoomOk {
				// should not happen, because room should be created on register
				// but just in case, just skip it
				continue
			}
			if _, ok := room[client]; ok {
				// check if client exists in list of clients before closing connection
				delete(room, client)
				close(client.send)

				if len(room) == 0 {
					// if room is now empty, remove it
					delete(h.rooms, client.roomid)
				} else {
					// user has left message
					leftMessage := ChatMessage{
						RoomId:      client.roomid,
						MessageType: "join",
						User:        client.user,
						Joined:      false,
						Time:        time.Now(),
					}

					h.broadcastMessage(leftMessage)
				}
			}
		case message := <-h.broadcast:
			h.broadcastMessage(message)
		}
	}
}

type ChatClient struct {
	roomid string

	user string

	hub *ChatHub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan ChatMessage
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

		chatMessage := ChatMessage{
			RoomId:      c.roomid,
			MessageType: "text",
			User:        c.user,
			Message:     string(message),
			Time:        time.Now(),
		}
		c.hub.broadcast <- chatMessage
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
		case chatMessage, isChannelOk := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !isChannelOk {
				// hub closed the channel
				c.conn.WriteMessage(websocket.CloseMessage, []byte("Connection closed."))
				return
			}

			n := len(c.send)
			messages := make([]ChatMessage, n+1)
			messages[0] = chatMessage

			for i := 1; i <= n; i++ {
				// gather all remaining queued messages to the client & send as a json object
				messages[i] = <-c.send
			}

			type r struct {
				Messages []ChatMessage `json:"messages"`
			}

			c.conn.WriteJSON(r{
				Messages: messages,
			})

		case <-ticker.C:
			// send ping message
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// entrypoint for ProjectChat handler
func ConnectClient(ctx *gin.Context, hub *ChatHub, roomid, name string) {
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		log.Print("Error when upgrading websocket connection (for chat): ", err)
		return
	}

	client := &ChatClient{
		roomid: roomid,
		user:   name,
		hub:    hub,
		conn:   conn,
		send:   make(chan ChatMessage, 256),
	}

	// register new client
	client.hub.register <- client

	// run in goroutines for concurrency
	go client.writePump()
	go client.readPump()
}
