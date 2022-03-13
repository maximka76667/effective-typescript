// Item 9: Prefer Type Declarations to Type Assertions

// TypeScript seems to have two ways of assigning a value to a variable and giving it a type:

interface Person { name: string }

const alice: Person = { }; // Type is Person (declaration)

// Property 'name' is missing in type '{}' but required in type 'Person'.
// Object literal may only specify known properties,
// and 'ocupation' does not exist in type 'Person'.

const bob = { // Type is Person (assertion)
  name: "James", ocupation: "JavaScript",
} as Person;

// It’s not always clear how to use a declaration with arrow functions. For example, what
// if you wanted to use the named Person interface in this code?

const people = ["alice", "bob", "jan"].map((name) => ({ name }));
// { name: string; }[]... but we want Person[]

// It’s tempting to use a type assertion here, and it seems to solve the problem:

const peopleAssertion = ["alice", "bob", "jan"].map(
  (name) => ({ name } as Person),
);

// But this suffers from all the same issues as a more direct use of type assertions. For
// example:

const peopleAssertion2 = ["alice", "bob", "jan"].map((name) => ({} as Person));
// No error

// You may also see code that looks like const bob = <Person>{}.
// This was the original syntax for assertions and is equivalent to {}
// as Person. It is less common now because <Person> is interpreted
// as a start tag in .tsx files (TypeScript + React)

const peopleDeclaration = ["alice", "bob", "jan"].map(
  (name): Person => ({ name }),
);

// Add return type on function
// The same is
function returnPerson(name: string): Person {
  return { name };
}

// So when should you use a type assertion? Type assertions make the most sense when
// you truly do know more about a type than TypeScript does, typically from context
// that isn’t available to the type checker. For instance, you may know the type of a
// DOM element more precisely than TypeScript does:

document.querySelector("#myButton")!.addEventListener("click", (e) => {
  e.currentTarget; // Type is EventTarget
  const button = e.currentTarget as HTMLButtonElement;
  button; // Type is HTMLButtonElement
});

// You may also run into the non-null assertion, which is so common that it gets a spe‐
// cial syntax:

const elNull = document.getElementById("foo"); // Type is HTMLElement | null
const el = document.getElementById("foo")!; // Type is HTMLElement

// The general idea is that you can use a type assertion to convert between A and B if
// either is a subset of the other. HTMLElement is a subtype of HTMLElement | null, so
// this type assertion is OK. HTMLButtonElement is a subtype of EventTarget, so that
// was OK, too. And Person is a subtype of {}, so that assertion is also fine

// But you can’t convert between a Person and an HTMLElement since neither is a sub‐
// type of the other:

const body = document.body as Person;

// Conversion of type 'HTMLElement' to type 'Person' may be a mistake because neither
// type sufficiently overlaps with the other. If this was intentional,
// convert the expression to 'unknown' first.

// The error suggests an escape hatch, namely, using the unknown type (Item 42). Every
// type is a subtype of unknown, so assertions involving unknown are always OK. This lets
// you convert between arbitrary types, but at least you’re being explicit that you’re
// doing something suspicious!

const escapeHatch = document.body as unknown as Person; // OK

// Things to Remember

// • Prefer type declarations (: Type) to type assertions (as Type).

// • Know how to annotate the return type of an arrow function.

// • Use type assertions and non-null assertions when you know something about
// types that TypeScript does not.

// Exercise:
interface Value {
  value: number;
}

const returnFunction = (value: number): Value => ({ value });
