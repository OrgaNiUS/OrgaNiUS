// main entry point for OrgaNiUS backend server

package main

import (
	"fmt"
	"os"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/db"
	"github.com/OrgaNiUS/OrgaNiUS/server/handlers"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func handleRoutes(router *gin.Engine, controller controllers.Controller) {
	// serve React build at root
	// make sure to re-build the React client after every change
	// run `make bc`
	router.Use(static.Serve("/", static.LocalFile("./client/build", true)))

	// always serve React build if path is not valid (for Gin Router)
	// React will handle actual invalid paths
	// which is any path not defined in Gin Router AND React Router
	router.NoRoute(func(ctx *gin.Context) {
		ctx.File("./client/build")
	})

	// API Routes Group
	// accessed via "http://{URL}/api/v1/{path}" (with correct GET/POST/PATCH/DELETE request)
	v1 := router.Group("/api/v1")
	v1.GET("/user_exists/:name", handlers.UserExistsGet(controller))
	v1.GET("/user/:id", handlers.UserGet(controller))
	v1.POST("/signup", handlers.UserPost(controller))
	v1.PATCH("/user/:id", handlers.UserPatch(controller))
	v1.DELETE("/user/:id", handlers.UserDelete(controller))
}

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Error while loading environment variables.")
		fmt.Println(err.Error())
		return
	}

	var (
		// environment variables found in ".env" file
		// sample ".env" file found in ".env.example"
		URL = os.Getenv("URL")

		dbUsername = os.Getenv("db_username")
		dbPassword = os.Getenv("db_password")

		jwtSecret = os.Getenv("jwt_secret")
	)

	// essentially same as gin.Default() for now
	// potentially can customise Logger or Recovery or other middleware
	router := gin.New()
	router.Use(gin.Recovery(), gin.Logger())

	// kept here for reference, in case we need to load templates in the future
	// router.LoadHTMLGlob("./server/templates/*.html")

	client, cancel := db.Connect(dbUsername, dbPassword)
	defer cancel()

	jwtParser := auth.New(jwtSecret)

	// TODO: Remove this temporary test usage
	tokenString, _ := jwtParser.GenerateJWT("abcdefg")
	jwtParser.ParseJWT(tokenString)

	controller := controllers.New(client)

	handleRoutes(router, *controller)

	fmt.Println("Server booted up!")

	router.Run(URL)
}
