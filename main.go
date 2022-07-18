// main entry point for OrgaNiUS backend server

package main

import (
	"log"
	"os"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/db"
	"github.com/OrgaNiUS/OrgaNiUS/server/handlers"
	"github.com/OrgaNiUS/OrgaNiUS/server/mailer"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func handleRoutes(URL string, router *gin.Engine, userController controllers.UserController, projectController controllers.ProjectController, taskController controllers.TaskController, eventController controllers.EventController, jwtParser *auth.JWTParser, mailer *mailer.Mailer) {
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

	v1.POST("/signup", handlers.UserSignup(userController, jwtParser, mailer))
	v1.POST("/verify", handlers.UserVerify(userController, jwtParser))
	v1.POST("/login", handlers.UserLogin(userController, jwtParser))
	v1.GET("/refresh_jwt", handlers.UserRefreshJWT(userController, jwtParser))
	v1.DELETE("/logout", handlers.UserLogout(userController, jwtParser))

	v1.POST("/forgot_pw", handlers.UserForgotPW(userController, mailer))
	v1.POST("/verify_forgot_pw", handlers.UserVerifyForgotPW(userController))
	v1.POST("/change_forgot_pw", handlers.UserChangeForgotPW(userController))

	v1.GET("/own_user", handlers.UserGetSelf(userController, jwtParser))
	v1.PATCH("/user", handlers.UserPatch(userController, jwtParser))
	v1.DELETE("/user", handlers.UserDelete(userController, jwtParser))

	v1.GET("/user_exists", handlers.UserExistsGet(userController))
	v1.GET("/user", handlers.UserGet(userController))

	v1.GET("/user_get_project_invites", handlers.UserGetProjectInvites(userController, projectController, jwtParser))
	v1.PATCH("/user_apply", handlers.UserApplyProject(projectController, jwtParser))
	v1.PATCH("/user_accept", handlers.UserAcceptProject(userController, projectController, jwtParser))
	v1.PATCH("/user_reject", handlers.UserRejectProject(userController, projectController, jwtParser))

	v1.POST("/project_create", handlers.ProjectCreate(userController, projectController, jwtParser))
	v1.GET("/project_get", handlers.ProjectGet(userController, projectController, taskController, eventController, jwtParser))
	v1.GET("/project_get_all", handlers.ProjectGetAll(userController, projectController, jwtParser))
	v1.PATCH("/project_modify", handlers.ProjectModify(projectController, jwtParser))
	v1.PATCH("/project_invite", handlers.ProjectInviteUser(userController, jwtParser))
	v1.GET("/project_get_applications", handlers.ProjectGetApplicants(userController, projectController, jwtParser))
	v1.PATCH("/project_choose", handlers.ProjectChooseUsers(userController, projectController, jwtParser))
	v1.PATCH("/project_remove_user", handlers.ProjectRemoveUsers(userController, projectController, jwtParser))
	v1.DELETE("/project_delete", handlers.ProjectDelete(userController, projectController, taskController, jwtParser))

	v1.POST("/task_create", handlers.TaskCreate(userController, projectController, taskController, jwtParser))
	v1.DELETE("/task_delete", handlers.TaskDelete(userController, projectController, taskController, jwtParser))
	v1.PATCH("/task_modify", handlers.TaskModify(userController, taskController, jwtParser))
	v1.GET("/task_get_all", handlers.TaskGetAll(userController, projectController, taskController, jwtParser))

	v1.POST("/event_create", handlers.EventCreate(userController, projectController, eventController, jwtParser))
	v1.GET("/event_get", handlers.EventGet(eventController, jwtParser))
	v1.GET("/event_get_all", handlers.EventGetAll(userController, projectController, eventController, jwtParser))
	v1.PATCH("/event_modify", handlers.EventModify(eventController, jwtParser))
	v1.DELETE("/event_delete", handlers.EventDelete(userController, projectController, eventController, jwtParser))

	// web socket handlers here
	v1.GET("/project_search", handlers.ProjectSearch(projectController, jwtParser))
	v1.GET("/project_invite_search", handlers.ProjectInviteSearch(userController, jwtParser))
}

func main() {
	// Uncomment the following line below to enable Production mode.
	gin.SetMode(gin.ReleaseMode)

	// Set up logging.
	// Create "logs" directory if it does not exist.
	_ = os.Mkdir("logs", os.ModePerm)
	// FileMode from https://en.wikipedia.org/wiki/File-system_permissions#Numeric_notation
	// 0666 is read & write
	logFile, err := os.OpenFile("logs/server.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error creating/opening logger file: %v", err)
	}
	defer logFile.Close()
	log.SetOutput(logFile)

	// Set up loading of environment variables.
	if err := godotenv.Load(); err != nil {
		// will fail on heroku server
		log.Printf("error loading environment variables: %v", err)
	}

	var (
		// environment variables found in ".env" file
		// sample ".env" file found in ".env.example"
		URL = os.Getenv("URL")

		dbUsername = os.Getenv("db_username")
		dbPassword = os.Getenv("db_password")

		jwtSecret = os.Getenv("jwt_secret")

		emailSender = os.Getenv("email")
		sendGridKey = os.Getenv("sendgrid_api_key")
	)

	// essentially same as gin.Default() for now
	// potentially can customise Logger or Recovery or other middleware
	router := gin.New()
	router.Use(gin.Recovery(), gin.Logger())

	// kept here for reference, in case we need to load templates in the future
	// router.LoadHTMLGlob("./server/templates/*.html")

	client, cancel := db.Connect(dbUsername, dbPassword)
	defer cancel()

	userController := controllers.NewU(client, URL)
	projectController := controllers.NewP(client, URL)
	taskController := controllers.NewT(client, URL)
	eventController := controllers.NewE(client, URL)
	jwtParser := auth.New(jwtSecret)
	mailer := mailer.New("OrgaNiUS", emailSender, sendGridKey)
	handleRoutes(URL, router, *userController, *projectController, *taskController, *eventController, jwtParser, mailer)

	log.Print("Server booted up!")

	router.Run()
}
