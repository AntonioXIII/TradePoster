package input

type Prompter[T interface{}] interface {
	prompt() T
}
