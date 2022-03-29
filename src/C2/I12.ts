// Item 12: Apply Types to Entire Function Expressions When Possible

// JavaScript (and TypeScript) distinguishes a function statement and a function
// expression:

function rollDice1(sides: number): number {
  return 1;
} // Statement

const rollDice2 = function (sides: number): number {
  return 1;
}; // Expression

const rollDice3 = (sides: number): number => 1; // Also expression

// An advantage of function expressions in TypeScript is that you can apply a type declaration
// to the entire function at once, rather than specifying the types of the parameters
// and return type individually:

type DiceRollFn = (sides: number) => number;
const rollDice: DiceRollFn = (sides) => Math.floor(Math.random() * sides);

// The function type doesn’t provide much value in such a simple example, but
// the technique does open up a number of possibilities.

// One is reducing repetition. If you wanted to write several functions for doing arithmetic
// on numbers, for instance, you could write them like this:

function add(a: number, b: number) { return a + b; }
function sub(a: number, b: number) { return a - b; }
function mul(a: number, b: number) { return a * b; }
function div(a: number, b: number) { return a / b; }

// or consolidate the repeated function signatures with a single function type:

type BinaryFn = (a: number, b: number) => number;
const addFn: BinaryFn = (a, b) => a + b;
const subFn: BinaryFn = (a, b) => a - b;
const mulFn: BinaryFn = (a, b) => a * b;
const divFn: BinaryFn = (a, b) => a / b;

// This has fewer type annotations than before, and they’re separated away from the
// function implementations. This makes the logic more apparent. You’ve also gained a
// check that the return type of all the function expressions is number.

// Libraries often provide types for common function signatures. For example, ReactJS
// provides a MouseEventHandler type that you can apply to an entire function rather
// than specifying MouseEvent as a type for the function’s parameter. If you’re a library
// author, consider providing type declarations for common callbacks.

// Another place you might want to apply a type to a function expression is to match the
// signature of some other function. In a web browser, for example, the fetch function
// issues an HTTP request for some resource:

const responseP = fetch("/quote?by=Mark+Twain"); // Type is Promise<Response>

async function getQuote() {
  const response = await fetch("/quote?by=Mark+Twain");
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response;
}

const checkedFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response;
};

const checkedFetchReturnError: typeof fetch = async (input, init) => {
  // ~~~~~~~~~~~~ Type 'Promise<Response | HTTPError>'
  // is not assignable to type 'Promise<Response>'
  // Type 'Response | HTTPError' is not assignable
  // to type 'Response'
  const response = await fetch(input, init);
  if (!response.ok) {
    return new Error(`Request failed: ${response.status}`);
  }
  return response;
};

// The same mistake in the first example would likely have led to an error, but in the
// code that called checkedFetch, rather than in the implementation.

// In addition to being more concise, typing this entire function expression instead of its
// parameters has given you better safety. When you’re writing a function that has the
// same type signature as another one, or writing many functions with the same type
// signature, consider whether you can apply a type declaration to entire functions,
// rather than repeating types of parameters and return values.

// Things to Remember

// • Consider applying type annotations to entire function expressions, rather than to
// their parameters and return type.

// • If you’re writing the same type signature repeatedly, factor out a function type or
// look for an existing one. If you’re a library author, provide types for common
// callbacks.

// • Use typeof fn to match the signature of another function.
