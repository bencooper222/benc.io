// #[no_mangle]
// pub fn add(a: i32, b: i32) -> i32 {
//   return a + b +b;
// }

fn main() {
  let hey = wasm_pick();
  let hello = String::from("how");
  println!("{}{}", hey,hello);
  // println!(hey);
}
#[no_mangle]
 fn wasm_pick()-> String {
   let mut buffer = String::with_capacity(3);

   buffer.push('h');
   buffer.push('e');
   buffer.push('y');
   buffer
    // return String::from("https://google.com");
}  