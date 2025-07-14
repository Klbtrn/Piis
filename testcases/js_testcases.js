// 1. Loop range error – Bubble Sort (wrong comparison range)
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
function delayedLogs() {
  for (var i = 0; i < 3; i++) {
    setTimeout(() => {
      console.log("Index:", i);
    }, 100);
  }
}

delayedLogs();

// 3. Incorrect object mutation – Shopping cart
function addItemToCart(cart, item) {
  cart.push(item);
  cart = cart.concat([]); // trying to make a copy after mutation
  return cart;
}

let cart = [];
let newCart = addItemToCart(cart, "Apple");
console.log(cart); // unexpected mutation

// 4. Falsy check misunderstanding – Validating form
function validateForm(data) {
  if (!data.age) {
    return "Age is required";
  }
  return "Valid";
}

console.log(validateForm({ age: 0 }));

// 5. Async/await – Fetch with missing await
async function getUser() {
  const response = fetch("https://jsonplaceholder.typicode.com/users/1");
  const user = await response.json();
  console.log(user);
}

getUser();

// 6. DOM manipulation – Using wrong selector method
function updateTitle() {
  const title = document.getElementById(".title");
  title.textContent = "Updated!";
}

// <h1 class="title">Original</h1>

// 7. Incorrect return – Filtering list
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
function capitalizeAll(words) {
  return words.map((word) => {
    word.toUpperCase();
  });
}

console.log(capitalizeAll(["apple", "banana"]));
