package mailer

import (
	"fmt"
)

func (m *Mailer) SendForgotPW(name, email, pin string) error {
	subject := "OrgaNiUS: Forgot Password"
	format := `Hey %s!

Enter this pin "%s" in the prompt.

Please ignore this message if it was not you.

Regards,
OrgaNiUS Team`
	body := fmt.Sprintf(format, name, pin)
	return m.Send(name, email, subject, body)
}
