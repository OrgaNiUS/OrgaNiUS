package handlers

import (
	"net/http"

	"github.com/OrgaNiUS/OrgaNiUS/server/controllers"
	"github.com/OrgaNiUS/OrgaNiUS/server/models"
	"github.com/gin-gonic/gin"
)

func UserExistsGet(controller controllers.Controller) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		name := ctx.Param("name")
		exists, err := controller.UserExists(ctx, name)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"exists": exists})
	}
}

func UserGet(controller controllers.Controller) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id := ctx.Param("id")
		user, err := controller.UserRetrieve(ctx, id)
		if err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		ctx.JSON(http.StatusOK, user)
	}
}

func UserPost(controller controllers.Controller) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var user models.User
		ctx.ShouldBindJSON(&user)
		if exists, _ := controller.UserExists(ctx, user.Name); exists {
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "Username already exists."})
			return
		}
		if err := controller.UserCreate(ctx, &user); err != nil {
			DisplayError(ctx, err.Error())
			return
		}
		ctx.JSON(http.StatusCreated, gin.H{"user": user})
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
			return
		}
		ctx.JSON(http.StatusOK, gin.H{})
	}
}
