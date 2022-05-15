// main entry point for OrgaNiUS backend server

package main

import (
	"fmt"
	"os"

	"github.com/OrgaNiUS/OrgaNiUS/server/handlers"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

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
	)

	// essentially same as gin.Default() for now
	// potentially can customise Logger or Recovery or other middleware
	router := gin.New()
	router.Use(gin.Recovery(), gin.Logger())

	// kept here for reference, in case we need to load templates in the future
	// router.LoadHTMLGlob("./server/templates/*.html")

	// serve React build at root
	// make sure to re-build the React client after every change
	// run `make bc`
	router.Use(static.Serve("/", static.LocalFile("./client/build", true)))

	// API Routes Group
	// accessed via "http://{URL}/api/v1/{path}" (with correct GET/POST/PATCH/DELETE request)
	v1 := router.Group("/api/v1")
	v1.GET("/ping", handlers.PingGet())
	v1.POST("/login", handlers.LoginPost())
	v1.GET("/params/:param", handlers.TestParamsGet())

	// always serve React build if path is not valid (for Gin Router)
	// React will handle actual invalid paths
	// which is any path not defined in Gin Router AND React Router
	router.NoRoute(func(ctx *gin.Context) {
		ctx.File("./client/build")
	})

	fmt.Println("Server booted up!")

	router.Run(URL)
}
