
pub trait PromptsAndReturnsResponse<T> {
  fn prompt(&self) -> T;
}

pub struct PromptAndReturnSimpleStrategy {}

impl PromptsAndReturnsResponse<i32> for PromptAndReturnSimpleStrategy {

    fn prompt(&self) -> i32 {
      return 7 as i32;
    }

}
