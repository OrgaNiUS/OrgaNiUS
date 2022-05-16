// Handlers for interfacing with frontend client.
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// TODO: Test function pls remove
// testing basic get
func PingGet() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{
			"message": "pong",
		})
	}
}

// TODO: Test function pls remove
// testing cookies
// we probably use JWT instead of tokens?
func LoginPost() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// session, err := store.Get(ctx.Request, "session-name")
		// if err != nil {
		// 	DisplayError(ctx, err)
		// }
		// fmt.Printf("foo: %s, 420: %v\n", session.Values["foo"], session.Values[420])
		// if session.Values["foo"] == nil {
		// 	fmt.Println("No cookies!")
		// }
		// session.Values["foo"] = "bar"
		// session.Values[420] = true
		// err = session.Save(ctx.Request, ctx.Writer)
		// if err != nil {
		// 	DisplayError(ctx, err)
		// }
	}
}

func DisplayError(ctx *gin.Context, message string) {
	ctx.JSON(http.StatusBadRequest, gin.H{"error": message})
}

// TODO: Test function pls remove
// testing params
func TestParamsGet() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		param := ctx.Param("param")
		ctx.JSON(http.StatusOK, gin.H{"message": param})
	}
}
