package mailer

import (
	"fmt"
)

const (
	ForgotPWSubject = "OrgaNiUS: Forgot Password"
	ForgotPWFormat  = `Hey %s!

	Enter this pin "%s" in the prompt.

	Please ignore this message if it was not you.

	Regards,
	OrgaNiUS Team`
)

func (m *Mailer) SendForgotPW(name, email, pin string) error {
	body := fmt.Sprintf(ForgotPWFormat, name, pin)
	return m.Send(name, email, ForgotPWSubject, body)
}
