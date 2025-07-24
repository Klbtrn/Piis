// 1. Async/await – Fetch with missing await
// The function fetches user data but forgets to await the response, leading to an unresolved promise.
async function getUser() {
  const response = fetch("https://jsonplaceholder.typicode.com/users/1");
  const user = await response.json();
  console.log(user);
}

getUser();

// 2. Wrong equality check – Comparing objects
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

// 3. Array mapping – Forgetting return inside map
// The function tries to capitalize all words but does not return the transformed word in the map function, leading to an array of undefined.
function capitalizeAll(words) {
  return words.map((word) => {
    word.toUpperCase();
  });
}

console.log(capitalizeAll(["apple", "banana"]));

// 4. Incorrect use of this – Object method
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

// 5. Recursion – Fibonacci calculation (wrong base case)
// The function calculates Fibonacci numbers but has incorrect base cases, leading to infinite recursion for n < 0.
function fibonacci(n) {
  if (n === 0) {
    return 0;
  } else if (n === 1) {
    return 1;
  } else {
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
}

const fibSequence = [];
for (let i = 0; i < 10; i++) {
  fibSequence.push(fibonacci(i));
}

console.log(fibSequence);

// 6. Wrong scoping (var inside loop)
// The function tries to log the index i after a short delay, but because var is function-scoped, all logs print Index: 3.
function delayedLogs() {
  for (var i = 0; i < 3; i++) {
    setTimeout(() => {
      console.log("Index:", i);
    }, 100);
  }
}

delayedLogs();

// 7. (Optional)
// If freq[item] is undefined, then freq[item] += 1 is basically undefined + 1, which results in NaN (Not a Number).
// This means the counts become NaN instead of numbers, which is a silent bug.
function countFrequencies(items) {
  const freq = {};
  for (const item of items) {
    freq[item] += 1; // What happens here?
  }
  return freq;
}

console.log(countFrequencies(["apple", "banana", "apple", "orange", "banana"]));
