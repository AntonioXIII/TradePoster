package input

type Prompt struct {
	message string
}

func (pr Prompt) GetMessage() string {
	return pr.message
}

func (pr *Prompt) SetMessage(newMessage string) {
	pr.message = newMessage
}
