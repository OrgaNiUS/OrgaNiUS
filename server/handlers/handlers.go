// Handlers for interfacing with frontend client.
package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func DisplayError(ctx *gin.Context, message string) {
	log.Printf("displaying error to client: %v", message)
	ctx.JSON(http.StatusBadRequest, gin.H{"error": message})
}

func DisplayNotAuthorized(ctx *gin.Context, message string) {
	ctx.JSON(http.StatusUnauthorized, gin.H{"error": message})
}
