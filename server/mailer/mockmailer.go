package mailer

import (
	"context"

	"github.com/sendgrid/rest"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type MockClient struct {
	lastSend *mail.SGMailV3
}

func (c *MockClient) Send(email *mail.SGMailV3) (*rest.Response, error) {
	*c.lastSend = *email
	return nil, nil
}

func (c *MockClient) SendWithContext(ctx context.Context, email *mail.SGMailV3) (*rest.Response, error) {
	// Not used.
	return nil, nil
}

func GetMock() (*mail.SGMailV3, *Mailer) {
	name := "tester"
	sender := "tester@test.com"
	key := "abcdef"
	mailer := New(name, sender, key)
	var lastSend *mail.SGMailV3 = &mail.SGMailV3{}
	mailer.Client = &MockClient{
		lastSend: lastSend,
	}
	return lastSend, mailer
}
