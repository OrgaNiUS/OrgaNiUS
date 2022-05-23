package mail

import (
	"fmt"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type Mailer struct {
	Sender *mail.Email
	Client *sendgrid.Client
}

func New(name, sender, key string) *Mailer {
	return &Mailer{
		Sender: mail.NewEmail(name, sender),
		Client: sendgrid.NewSendClient(key),
	}
}

func (m *Mailer) Send(name, address, subject, body string) error {
	from := m.Sender
	to := mail.NewEmail(name, address)
	fmt.Println(&from, &to)
	// there is also a mail.NewSingleEmail() that accepts HTML content
	message := mail.NewSingleEmailPlainText(from, subject, to, body)
	fmt.Println(message)
	_, err := m.Client.Send(message)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}
	return nil
}
