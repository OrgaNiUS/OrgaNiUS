package handlers

import (
	"net/http"
	"net/mail"
	"strings"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func UserExistsGet(controller controllers.Controller) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		name := ctx.Param("name")
		email := ctx.Param("email")
		exists, err := controller.UserExists(ctx, name, email)
		if err != nil {
			DisplayError(ctx, err.Error())
		} else {
			ctx.JSON(http.StatusOK, gin.H{"exists": exists})
		}
	}
}

func UserGet(controller controllers.Controller) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id := ctx.Param("id")
		user, err := controller.UserRetrieve(ctx, id)
		if err == mongo.ErrNoDocuments {
			DisplayError(ctx, "User does not exist.")
		} else if err != nil {
			DisplayError(ctx, err.Error())
		} else {
			ctx.JSON(http.StatusOK, user)
		}
	}
}

func UserGetSelf(controller controllers.Controller, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, ok := jwtParser.GetFromJWT(ctx)
		if !ok {
			DisplayNotAuthorized(ctx, "Not logged in.")
			return
		}
		user, err := controller.UserRetrieve(ctx, id)
		if err == mongo.ErrNoDocuments {
			DisplayError(ctx, "User does not exist.")
		} else if err != nil {
			DisplayError(ctx, err.Error())
		} else {
			ctx.JSON(http.StatusOK, user)
		}
	}
}

func alreadySignedUp(controller controllers.Controller, ctx *gin.Context, name, email string) (string, bool) {
	if exists, _ := controller.UserExists(ctx, name, email); exists {
		return "Username or email already exists.", false
	}
	return "", true
}

// TODO: tests for bad inputs

func isValidEmail(email string) (string, bool) {
	if email == "" {
		return "Please provide an email.", false
	}
	_, err := mail.ParseAddress(email)
	if err != nil {
		return "Email is not a valid address.", false
	}
	return "", true
}

func isValidName(name string) (string, bool) {
	if name == "" {
		return "Please provide a username.", false
	} else if len(name) < 5 {
		return "Username too short.", false
	}
	return "", true
}

func isValidPassword(name, password string) (string, bool) {
	if password == "" {
		return "Please provide a password.", false
	} else if len(password) < 8 {
		return "Password too short.", false
	} else if strings.Contains(password, name) {
		return "Password cannot contain username.", false
	}
	return "", true
}

func UserSignup(controller controllers.Controller, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var user models.User
		ctx.BindJSON(&user)
		if msg, ok := isValidName(user.Name); !ok {
			DisplayError(ctx, msg)
			return
		} else if msg, ok := isValidPassword(user.Name, user.Password); !ok {
			DisplayError(ctx, msg)
			return
		} else if msg, ok := isValidEmail(user.Email); !ok {
			DisplayError(ctx, msg)
			return
		} else if msg, ok := alreadySignedUp(controller, ctx, user.Name, user.Email); !ok {
			DisplayError(ctx, msg)
			return
		}
		hashedPassword, err := auth.HashPassword(user.Password)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		user.Password = hashedPassword
		if err := controller.UserCreate(ctx, &user); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		token, err := jwtParser.Generate(user.Id.Hex())
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		jwtParser.RefreshJWT(ctx, token)
		ctx.JSON(http.StatusCreated, token)
	}
}

func UserLogin(controller controllers.Controller, jwtParser *auth.JWTParser) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var user models.User
		ctx.BindJSON(&user)
		if len(user.Name) == 0 || len(user.Password) == 0 {
			DisplayError(ctx, "Please provide a username and password.")
			return
		}
		validLogin, err := controller.UserCheckPassword(ctx, &user)
		if !validLogin || err != nil {
			// Intentionally not exposing any other details.
			DisplayError(ctx, "Username and password do not match.")
			return
		}
		token, err := jwtParser.Generate(user.Id.Hex())
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		jwtParser.RefreshJWT(ctx, token)
		ctx.JSON(http.StatusCreated, token)
	}
}

func UserPatch(controller controllers.Controller) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "not yet implemented"})
	}
}

func UserDelete(controller controllers.Controller) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id := ctx.Param("id")
		if err := controller.UserDelete(ctx, id); err != nil {
			DisplayError(ctx, err.Error())
		} else {
			ctx.JSON(http.StatusOK, gin.H{})
		}
	}
}
