
mod view;
use crate::view::traits::PromptsAndReturnsResponse;

struct Wow {
    msg: i32
}

impl PromptsAndReturnsResponse<i32> for Wow {
    fn prompt(&self) -> i32 {
        return 7 as i32;
    }
}

fn main() {
    let thing = Wow{msg: 2};
    println!("Hello World");
    println!("Thing {}", thing.prompt());
}
