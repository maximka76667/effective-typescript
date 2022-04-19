// Item 19: Avoid Cluttering Your Code with Inferable Types

// The first thing that many new TypeScript developers do when they convert a codebase
// from JavaScript is fill it with type annotations. TypeScript is about types, after all!
// But in TypeScript many annotations are unnecessary. Declaring types for all your
// variables is counterproductive and is considered poor style.

// Don’t write:
let x: number = 12;

// Instead, just write:
let x1 = 12;

// TypeScript will also infer the types of more complex objects. Instead of:

const person: {
  name: string;
  born: {
    where: string;
    when: string;
  };
  died: {
    where: string;
    when: string;
  }
} = {
  name: "Sojourner Truth",
  born: {
    where: "Swartekill, NY",
    when: "c.1797",
  },
  died: {
    where: "Battle Creek, MI",
    when: "Nov. 26, 1883",
  },
};

// you can just write:

const personWithoutTypeAnnotation = {
  name: "Sojourner Truth",
  born: {
    where: "Swartekill, NY",
    when: "c.1797",
  },
  died: {
    where: "Battle Creek, MI",
    when: "Nov. 26, 1883",
  },
};

// Again, the types are exactly the same. Writing the type in addition to the value just
// adds noise here. (Item 21 has more to say on the types inferred for object literals.)

function square(nums: number[]) { // Return type is number[]
  return nums.map((x) => x * x);
}

const squares = square([1, 2, 3, 4]);

// TypeScript may infer something more precise than what you expected. This is generally
// a good thing. For example:

const axis1: string = "x"; // Type is string
const axis2 = "y"; // Type is "y"

// "y" is a more precise type for the axis variable. Item 21 gives an example of how this
// can fix a type error.

// Allowing types to be inferred can also facilitate refactoring. Say you have a Product
// type and a function to log it:

interface Product {
  id: number,
  name: string,
  price: number,
}

function logProductInfo(product: Product) {
  const {
    id, name, price,
  }: {
    id: number, name: string, price: number
  } = product;

  console.log(id, name, price);
}

// At some point you learn that product IDs might have letters in them in addition to
// numbers. So you change the type of id in Product. Because you included explicit
// annotations on all the variables in logProduct, this produces an error:

interface ProductWithIdString {
  id: string,
  name: string,
  price: number,
}

function logProductInfo2(product: ProductWithIdString) {
  const {
    id, name, price,
    // Type 'string' is not assignable to type 'number'.
  }: {
    id: number, name: string, price: number
  } = product;

  console.log(id, name, price);
}

// Had you left off all the annotations in the logProduct function body, the code would
// have passed the type checker without modification.

// A better implementation of logProduct would use destructuring assignment (Item
// 58):

function logProduct(product: Product) {
  const { id, name, price } = product;
  console.log(id, name, price);
}

// This version allows the types of all the local variables to be inferred. The corresponding
// version with explicit type annotations is repetitive and cluttered:

function logProductWithAnnotations(product: ProductWithIdString) {
  const { id, name, price }: { id: string; name: string; price: number } = product;
  console.log(id, name, price);
}

// Explicit type annotations are still required in some situations where TypeScript
// doesn’t have enough context to determine a type on its own. You have seen one of
// these before: function parameters.

// Some languages will infer types for parameters based on their eventual usage, but
// TypeScript does not. In TypeScript, a variable’s type is generally determined when it is
// first introduced.

// Ideal TypeScript code includes type annotations for function/method signatures but
// not for the local variables created in their bodies. This keeps noise to a minimum and
// lets readers focus on the implementation logic.

// There are some situations where you can leave the type annotations off of function
// parameters, too. When there’s a default value, for example:

function parseNumber(str: string, base = 10) {
  // ...
}

// Here the type of base is inferred as number because of the default value of 10.

// Parameter types can usually be inferred when the function is used as a callback for a
// library with type declarations. The declarations on request and response in this
// example using the express HTTP server library are not required:

// Don't do this:
app.get("/health", (request: express.Request, response: express.Response) => {
  response.send("OK");
});

// Do this:
app.get("/health", (request, response) => {
  response.send("OK");
});

// Item 26 goes into more depth on how context is used in type inference.

// There are a few situations where you may still want to specify a type even where it can
// be inferred.

// One is when you define an object literal:

const elmo: ProductWithIdString = {
  name: "Tickle Me Elmo",
  id: "048188 627152",
  price: 28.99,
};

// When you specify a type on a definition like this, you enable excess property checking
// (Item 11). This can help catch errors, particularly for types with optional fields.

// You also increase the odds that an error will be reported in the right place. If you
// leave off the annotation, a mistake in the object’s definition will result in a type error
// where it’s used, rather than where it’s defined:

const furby = {
  name: "Furby",
  id: 6443,
  price: 35,
};

logProductInfo2(furby);
// Types of property 'id' are incompatible.

// With an annotation, you get a more concise error in the place where the mistake was
// made:

const furby2: ProductWithIdString = {
  name: "Furby",
  id: 5443,
  // Type 'number' is not assignable to type 'string'.
  price: 35,
};

logProductInfo2(furby2);

// Similar considerations apply to a function’s return type. You may still want to annotate
// this even when it can be inferred to ensure that implementation errors don’t leak
// out into uses of the function.

// Say you have a function which retrieves a stock quote:

function getQuote(ticker: string) {
  return fetch(`https://quotes.example.com/?q=${ticker}`)
    .then((response) => response.json());
}

// You decide to add a cache to avoid duplicating network requests:

const cache: { [ticker: string]: number } = {};

function getQuote2(ticker: string) {
  if (ticker in cache) {
    return cache[ticker];
  }
  return fetch(`https://quotes.example.com/?q=${ticker}`)
    .then((response) => response.json())
    .then((quote) => {
      cache[ticker] = quote;
      return quote;
    });
}

// There’s a mistake in this implementation: you should really be returning
// Promise.resolve(cache[ticker]) so that getQuote always returns a Promise. The
// mistake will most likely produce an error…but in the code that calls getQuote, rather
// than in getQuote itself:

getQuote2("MSFT").then();
// Property 'then' does not exist on type 'number | Promise<any>'.
// Property 'then' does not exist on type 'number'.

// Had you annotated the intended return type (Promise<number>), the error would
// have been reported in the correct place:

function getQuote3(ticker: string): Promise<number> {
  if (ticker in cache) {
    return cache[ticker];
    // Type 'number' is not assignable to type 'Promise<number>'.
  }
  return fetch(`https://quotes.example.com/?q=${ticker}`)
    .then((response) => response.json())
    .then((quote) => {
      cache[ticker] = quote;
      return quote;
    });
}

// When you annotate the return type, it keeps implementation errors from manifesting
// as errors in user code. (See Item 25 for a discussion of async functions, which are an
// effective way to avoid this specific error with Promises.)

// Writing out the return type may also help you think more clearly about your function:
// you should know what its input and output types are before you implement it.
// While the implementation may shift around a bit, the function’s contract (its type signature)
// generally should not. This is similar in spirit to test-driven development
// (TDD), in which you write the tests that exercise a function before you implement it.
// Writing the full type signature first helps get you the function you want, rather than
// the one the implementation makes expedient.

// A final reason to annotate return values is if you want to use a named type. You might
// choose not to write a return type for this function, for example:

interface Vector2D { x: number; y: number; }

function addVectors(a: Vector2D, b: Vector2D) {
  return { x: a.x + b.x, y: a.y + b.y };
}

// TypeScript infers the return type as { x: number; y: number; }. This is compatible
// with Vector2D, but it may be surprising to users of your code when they see Vector2D
// as a type of the input and not of the output (as shown in Figure 3-2).

addVectors(); // add(a: Vector2D, b: Vector2D): { x: number; y: number; }

// If you annotate the return type, the presentation is more straightforward. And if
// you’ve written documentation on the type (Item 48) then it will be associated with the
// returned value as well. As the complexity of the inferred return type increases, it
// becomes increasingly helpful to provide a name.

// If you are using a linter, the eslint rule no-inferrable-types (note the variant spelling)
// can help ensure that all your type annotations are really necessary.

// Things to Remember

// • Avoid writing type annotations when TypeScript can infer the same type.

// • Ideally your code has type annotations in function/method signatures but not on
// local variables in their bodies.

// • Consider using explicit annotations for object literals and function return types
// even when they can be inferred. This will help prevent implementation errors
// from surfacing in user code.
