
mod view;
use crate::view::prompts::PromptAndReturnSimpleStrategy;
use crate::view::prompts::PromptsAndReturnsResponse;

fn main() {
    let thing = PromptAndReturnSimpleStrategy{};
    println!("Hello World");
    println!("Thing {}", thing.prompt());
}
