package handlers

import (
	"net/http"
	"net/mail"

	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func UserExistsGet(controller controllers.Controller) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		name := ctx.Param("name")
		exists, err := controller.UserExists(ctx, name)
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

func isValidEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

func UserPost(controller controllers.Controller) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var user models.User
		ctx.ShouldBindJSON(&user)
		if exists, _ := controller.UserExists(ctx, user.Name); exists {
			DisplayError(ctx, "Username already exists.")
		} else if !isValidEmail(user.Email) {
			DisplayError(ctx, "Email is not a valid address.")
		} else if err := controller.UserCreate(ctx, &user); err != nil {
			DisplayError(ctx, err.Error())
		} else {
			ctx.JSON(http.StatusCreated, user)
		}
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
