// 1. Loop range error – Bubble Sort (wrong comparison range)
// compares out-of-bounds at the end of the inner loop, index which doesnt exist.
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[j] > arr[j + 1]) {
        let tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
      }
    }
  }
  return arr;
}

console.log(bubbleSort([5, 3, 8, 1, 2]));

// 2. Wrong scoping (var inside loop)
// The function tries to log the index i after a short delay, but because var is function-scoped, all logs print Index: 3.
function delayedLogs() {
  for (var i = 0; i < 3; i++) {
    setTimeout(() => {
      console.log("Index:", i);
    }, 100);
  }
}

delayedLogs();

// 3. Incorrect object mutation – Shopping cart
// The function tries to avoid mutating the original cart, but it modifies it with push() before copying, so cart is still changed.
function addItemToCart(cart, item) {
  cart.push(item);
  cart = cart.concat([]);
  return cart;
}

let cart = [];
let newCart = addItemToCart(cart, "Apple");
console.log(cart);

// 4. Falsy check misunderstanding – Validating form
// The function checks if age is falsy, but 0 is a valid age, so it incorrectly returns "Age is required"
function validateForm(data) {
  if (!data.age) {
    return "Age is required";
  }
  return "Valid";
}

console.log(validateForm({ age: 0 }));

// 5. Async/await – Fetch with missing await
// The function fetches user data but forgets to await the response, leading to an unresolved promise.
async function getUser() {
  const response = fetch("https://jsonplaceholder.typicode.com/users/1");
  const user = await response.json();
  console.log(user);
}

getUser();

// 6. DOM manipulation – Using wrong selector method
// The function tries to update the text of an element with class "title" but uses getElementById instead of getElementsByClassName.
function updateTitle() {
  const title = document.getElementById(".title");
  title.textContent = "Updated!";
}

// <h1 class="title">Original</h1>

// 7. Incorrect return – Filtering list
// The function filters users but does not return the filtered array, leading to undefined result.
function filterAdults(users) {
  users.filter((user) => {
    if (user.age >= 18) {
      return true;
    }
  });
}

const result = filterAdults([
  { name: "Alice", age: 17 },
  { name: "Bob", age: 22 },
]);

console.log(result);

// 8. Incorrect use of this – Object method
// The function tries to increment count asynchronously, but inside setTimeout the this context is lost, so count isn’t updated.
const counter = {
  count: 0,
  increment: function () {
    setTimeout(function () {
      this.count++;
    }, 100);
  },
};

counter.increment();
setTimeout(() => console.log(counter.count), 200);

// 9. Wrong equality check – Comparing objects
// The function tries to check if a product exists in the list, but comparing objects with === always fails unless they reference the same object.
function containsProduct(products, target) {
  for (let p of products) {
    if (p === target) {
      return true;
    }
  }
  return false;
}

const prodList = [{ id: 1 }, { id: 2 }];
console.log(containsProduct(prodList, { id: 1 }));

// 10. Array mapping – Forgetting return inside map
// The function tries to capitalize all words but does not return the transformed word in the map function, leading to an array of undefined.
function capitalizeAll(words) {
  return words.map((word) => {
    word.toUpperCase();
  });
}

console.log(capitalizeAll(["apple", "banana"]));
