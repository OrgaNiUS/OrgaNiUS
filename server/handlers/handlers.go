// Handlers for interfacing with frontend client.
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func DisplayError(ctx *gin.Context, message string) {
	ctx.JSON(http.StatusBadRequest, gin.H{"error": message})
}
