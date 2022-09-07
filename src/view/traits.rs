
pub trait PromptsAndReturnsResponse<T> {
  fn prompt(&self) -> T;
}