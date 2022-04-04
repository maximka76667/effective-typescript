// Item 16: Prefer Arrays, Tuples, and ArrayLike to number Index Signatures

// JavaScript is a famously quirky language. Some of the most notorious quirks involve
// implicit type coercions:
// > "0" == 0
// true

// but these can usually be avoided by using === and !== instead of their more coercive
// cousins.

// JavaScript’s object model also has its quirks, and these are more important to understand
// because some of them are modeled by TypeScript’s type system. You’ve already
// seen one such quirk in Item 10, which discussed object wrapper types. This item discusses
// another.

// What is an object? In JavaScript it’s a collection of key/value pairs. The keys are ususally
// strings (in ES2015 and later they can also be symbols). The values can be
// anything.

// This is more restrictive than what you find in many other languages. JavaScript does
// not have a notion of “hashable” objects like you find in Python or Java. If you try to
// use a more complex object as a key, it is converted into a string by calling its toString
// method:

// > x = {}
// {}
// > x[[1, 2, 3]] = 2
// 2
// > x
// { '1,2,3': 1 }

// In particular, numbers cannot be used as keys. If you try to use a number as a property
// name, the JavaScript runtime will convert it to a string:
// > { 1: 2, 3: 4}
// { '1': 2, '3': 4 }

// So what are arrays, then? They are certainly objects:
// > typeof []
// 'object'

// If you use Object.keys to list the keys of an array, you get strings back:
// > Object.keys(x)
// [ '0', '1', '2' ]

// interface Array<T> {
//   // ...
//   [n: number]: T;
// }

// This is purely a fiction—string keys are accepted at runtime as the ECMAScript standard
// dictates that they must—but it is a helpful one that can catch mistakes:

// While this fiction is helpful, it’s important to remember that it is just a fiction. Like all
// aspects of TypeScript’s type system, it is erased at runtime (Item 3). This means that
// constructs like Object.keys still return strings:

const xs = [1, 2, 3];

const keys = Object.keys(xs); // Type is string[]
for (const key in xs) {
  if (key) {
    key; // Type is string
    const x = xs[key]; // Type is number
  }
}

// If you don’t care about the index, you can use for-of:
for (const x of xs) {
  x; // Type is number
}

// If you do care about the index, you can use Array.prototype.forEach, which gives it
// to you as a number:

xs.forEach((x, i) => {
  i; // Type is number
  x; // Type is number
});

// If you need to break out of the loop early, you’re best off using a C-style for(;;) loop:

for (let i = 0; i < xs.length; i++) {
  const x = xs[i];
  if (x < 0) break;
}

// If the types don’t convince you, perhaps the performance will: in most browsers and
// JavaScript engines, for-in loops over arrays are several orders of magnitude slower
// than for-of or a C-style for loop.

// The general pattern here is that a number index signature means that what you put in
// has to be a number (with the notable exception of for-in loops), but what you get out
// is a string.

// If this sounds confusing, it’s because it is! As a general rule, there’s not much reason to
// use number as the index signature of a type rather than string. If you want to specify
// something that will be indexed using numbers, you probably want to use an Array or
// tuple type instead. Using number as an index type can create the misconception that
// numeric properties are a thing in JavaScript, either for yourself or for readers of your
// code.

// If you object to accepting an Array type because they have many other properties
// (from their prototype) that you might not use, such as push and concat, then that’s
// good—you’re thinking structurally! (If you need a refresher on this, refer to Item 4.)
// If you truly want to accept tuples of any length or any array-like construct, TypeScript
// has an ArrayLike type you can use:

function checkedAccess<T>(xs: ArrayLike<T>, i: number): T {
  if (i < xs.length) {
    return xs[i];
  }
  throw new Error(`Attempt to access ${i} which is past end of array.`);
}

const tupleLike: ArrayLike<string> = {
  "0": "A",
  "1": "B",
  length: 2,
}; // OK

// Things to Remember

// • Understand that arrays are objects, so their keys are strings, not numbers. number
// as an index signature is a purely TypeScript construct which is designed to help
// catch bugs.

// Prefer Array, tuple, or ArrayLike types to using number in an index signature
// yourself.
