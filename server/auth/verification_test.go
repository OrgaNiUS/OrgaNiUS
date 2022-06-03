package auth_test

import (
	"testing"

	"github.com/OrgaNiUS/OrgaNiUS/server/auth"
)

// Since it is impossible to seed crypto/rand, there is no way to properly perform this test.
// Thus, just running it for `loops` loops and hope for the best.
// Generating random pins takes a noticeable amount of time, thus `loops` shouldn't be too high.
func TestGeneratePin(t *testing.T) {
	loops := 25
	for i := 0; i < loops; i++ {
		_, pin := auth.GeneratePin()
		if len(pin) != 6 {
			t.Error("Expected pin to be of length 6.")
		}
		for _, c := range pin {
			if 'A' <= c && c <= 'Z' {
				continue
			} else if '0' <= c && c <= '9' {
				continue
			}
			t.Error("Expected pin to only contain A-Z and 0-9.")
		}
	}
}
