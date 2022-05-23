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

func handleRoutes(URL string, router *gin.Engine, controller controllers.Controller, jwtParser *auth.JWTParser) {
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
	v1.POST("/signup", handlers.UserSignup(controller, jwtParser))
	v1.POST("/login", handlers.UserLogin(controller, jwtParser))
	v1.GET("/refresh-jwt", handlers.UserRefreshJWT(controller, jwtParser))
	v1.DELETE("/logout", handlers.UserLogout(controller, jwtParser))
	v1.GET("/own_user", handlers.UserGetSelf(controller, jwtParser))
	v1.PATCH("/user", handlers.UserPatch(controller, jwtParser))
	v1.DELETE("/user", handlers.UserDelete(controller, jwtParser))

	v1.GET("/user_exists", handlers.UserExistsGet(controller))
	v1.GET("/user", handlers.UserGet(controller))
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

	controller := controllers.New(client, URL)
	jwtParser := auth.New(jwtSecret)
	handleRoutes(URL, router, *controller, jwtParser)

	fmt.Println("Server booted up!")

	router.Run(URL)
}
