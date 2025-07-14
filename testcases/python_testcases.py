# 1. Loop range error (e.g. Bubble Sort)
def bubble_sort(arr):
    for i in range(len(arr)):
        for j in range(len(arr)):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr


# 2. Wrong indentation (e.g. factorial)
def factorial(n):
    result = 1
    for i in range(1, n + 1):
    result *= i
    return result


# 3. Mutable default argument (e.g. collecting items)
def collect_items(item, items=[]):
    items.append(item)
    return items


# 4. Incorrect variable scope (e.g. counter)
counter = 0

def increment():
    counter += 1
    return counter


# 5. Wrong data type usage (e.g. user greeting)
def greet_user(name, age):
    return "Hello " + name + ", you are " + age + " years old."


# 6. Misunderstood list operations (e.g. removing even numbers)
def remove_even(numbers):
    for num in numbers:
        if num % 2 == 0:
            numbers.remove(num)
    return numbers


# 7. Incorrect function return (e.g. linear search)
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            print("Found at index", i)
    return -1


# 8. Conditional logic bug (e.g. checking age for access)
def has_access(age):
    if age <= 18:
        return True
    else:
        return False


# 9. Using is instead of == (e.g. searching string in list)
def contains_word(words, word):
    for w in words:
        if w is word:
            return True
    return False


# 10. Unpacking error (e.g. iterating over key-value pairs)
def print_scores(scores):
    for key, value, extra in scores.items():
        print(key, value)


## 11. Recursion – Fibonacci calculation (wrong base case)
def fibonacci(n):
    if n == 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n - 1) + fibonacci(n - 2)
    
# Compute first 10 Fibonacci numbers
fib_sequence = []
for i in range(10):
    fib_sequence.append(fibonacci(i))
    
print(fib_sequence)


## 12. File I/O – Writing user input to file (forgot to close file properly)
def write_user_data():
    name = input("Enter your name: ")
    age = input("Enter your age: ")

    file = open("userdata.txt", "w")
    file.write("Name: " + name + "\n")
    file.write("Age: " + age + "\n")
    
print("Data written.")


# 13. OOP – BankAccount class (missing self. in method)
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        balance += amount

    def get_balance(self):
        return self.balance

account = BankAccount("Alice", 100)
account.deposit(50)
print("Balance:", account.get_balance())


# 14. String parsing – Counting words (splitting incorrectly)
def count_words(text):
    words = text.split(" ")
    count = 0
    for word in words:
        if word != "":
            count += 1
    return count

sample = "Hello   world! This is   a test."
print("Word count:", count_words(sample))


# 15. Input validation – Getting an integer from user (wrong exception handling)
def get_number():
    while True:
        try:
            number = int(input("Enter a number: "))
            return number
        except:
            print("Invalid input. Try again.")

n = get_number()
print("You entered:", n)


# 16. List transformation – Capitalize names (forgot to return new list)
def capitalize_names(names):
    capitalized = []
    for name in names:
        capitalized.append(name.capitalize())

names = ["alice", "BOB", "ChArLiE"]
result = capitalize_names(names)
print(result)


# 17. Basic math – Finding max in list (logic error in comparison)
def find_max(numbers):
    max_num = 0
    for num in numbers:
        if num > max_num:
            max_num = num
    return max_num

print(find_max([-10, -5, -3]))


# 18. Sorting – Insertion Sort (indexing bug)
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i
        while j > 0 and arr[j - 1] > key:
            arr[j] = arr[j - 1]
            j -= 1
        arr[j] = key
    return arr

nums = [5, 2, 4, 6, 1, 3]
sorted_nums = insertion_sort(nums)
print(sorted_nums)


# 19. Dictionary usage – Counting occurrences (key error)
def count_frequencies(items):
    freq = {}
    for item in items:
        freq[item] += 1
    return freq

print(count_frequencies(["apple", "banana", "apple", "orange", "banana"]))


# 20. Nested loops – Finding duplicates (loop logic flaw)
def find_duplicates(lst):
    duplicates = []
    for i in range(len(lst)):
        for j in range(i + 1, len(lst)):
            if lst[i] == lst[j] and lst[i] not in duplicates:
                duplicates.append(lst[i])
                break
    return duplicates

items = ["cat", "dog", "bird", "cat", "dog", "cat"]
print(find_duplicates(items))
