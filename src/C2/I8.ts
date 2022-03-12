// Item 8: Know How to Tell Whether a Symbol Is in the Type Space or Value Space

// A symbol in TypeScript exists in one of two spaces:
// • Type space
// • Value space

// Type space
interface Cylinder {
  radius: number;
  height: number;
 }

// Value space
const Cylinder = (radius: number, height: number) => ({ radius, height });

function calculateVolume(shape: unknown) {
  if (shape instanceof Cylinder) {
    // shape.radius;
    // Property 'radius' does not exist on type '{}'
  }
}

// It’s not always obvious at first glance whether a symbol is in type space or value space.
// You have to tell from the context in which the symbol occurs. This can get especially
// confusing because many type-space constructs look exactly the same as value-space
// constructs.

// Type space
type T1 = "string literal";
type T2 = 123;

// Value space
const v1 = "string literal";
const v2 = 123;

// Generally the symbols after a type or interface are in type space
// while those introduced in a const or let declaration are values.

// One of the best ways to build an intuition for the two spaces is through the Type‐
// Script Playground, which shows you the generated JavaScript for your TypeScript
// source. Types are erased during compilation (Item 3), so if a symbol disappears then
// it was probably in type space

// Statements in TypeScript can alternate between type space and value space. The sym‐
// bols after a type declaration (:) or an assertion (as) are in type space while everything
// after an = is in value space. For example:

interface Person1 {
  first: string;
  last: string;
 }

//       -Type-    -----------Values--------------
const p: Person1 = { first: "Jane", last: "Jacobs" };

function email(p: Person1, subject: string, body: string): string {
  //     @@@@@ @          @@@@@@@          @@@@ Values
  //              @@@@@@           @@@@@@        @@@@@@    @@@@@@@ Types
  return subject;
}

// The class and enum constructs introduce both a type and a value. In the first exam‐
// ple, Cylinder should have been a class

class Cylinder2 {
  radius = 1;

  height = 1;
}

function calculateVolume2(shape: unknown) {
  if (shape instanceof Cylinder2) {
    shape; // OK, type is Cylinder
    shape.radius; // OK, type is number
  }
}

// There are many operators and keywords that mean different things in a type or value
// context. typeof, for instance:

type Type1 = typeof p; // Type is Person
type Type2 = typeof email;
// Type is (p: Person, subject: string, body: string) => Response
const value1 = typeof p; // Value is "object"
const value2 = typeof email; // Value is "function"

const cylinderValue = typeof Cylinder2; // Value is "function"
type cylinderType = typeof Cylinder2; // Type is typeof Cylinder

declare let Fn: cylinderType;
const c = new Fn(); // Type is Cylinder2

type c = InstanceType<typeof Cylinder2>;

// The [] property accessor also has an identical-looking equivalent in type space. But
// be aware that while obj['field'] and obj.field are equivalent in value space, they
// are not in type space. You must use the former to get the type of another type’s
// property:

// const first: Person['first'] = p['first'];
const { first } = p;

type PersonEl = Person1["first" | "last"]; // Type is string
type Tuple = [PersonEl, number, Date];
type TupleEl = Tuple[number]; // Type is string | number | Date

// There are many other constructs that have different meanings in the two spaces:

// • this in value space is JavaScript’s this keyword (Item 49). As a type, this is the
// TypeScript type of this, aka “polymorphic this.” It’s helpful for implementing
// method chains with subclasses.

class This {
  getThis(): this {
    return this; // this has type this
  }
}

// • In value space & and | are bitwise AND and OR. In type space they are the inter‐
// section and union operators.

// • const introduces a new variable, but as const changes the inferred type of a lit‐
// eral or literal expression (Item 21).

const a = "Hello" as const;

// a = "Hi";

// • extends can define a subclass (class A extends B) or a subtype (interface A
// extends B) or a constraint on a generic type (Generic<T extends number>).

// • in can either be part of a loop (for (key in object)) or a mapped type (Item 14)

// If TypeScript doesn’t seem to understand your code at all, it may be because of confu‐
// sion around type and value space. For example, say you change the email function
// from earlier to take its arguments in a single object parameter:

function email2(options: {person: Person1, subject: string, body: string}) {
  // ...
}

// In JavaScript you can use destructuring assignment to create local variables for each
// property in the object

// function email({ person, subject, body }) {
// ...
// }

// If you try to do the same in TypeScript, you get some confusing errors:

// function email({
//   person: Person,
//   // ~~~~~~ Binding element 'Person' implicitly has an 'any' type
//   subject: string,
//   // ~~~~~~ Duplicate identifier 'string'
//   // Binding element 'string' implicitly has an 'any' type
//   body: string,
// },
//   // ~~~~~~ Duplicate identifier 'string'
//   // Binding element 'string' implicitly has an 'any' type
// ) { /* ... */ }

// The problem is that Person and string are being interpreted in a value context.
// You’re trying to create a variable named Person and two variables named string.
// Instead, you should separate the types and values:

function email3(
  { person, subject, body }: {person: Person1, subject: string, body: string},
) {
  // ...
}

// This is significantly more verbose, but in practice you may have a named type for the
// parameters or be able to infer them from context (Item 26).

// While the similar constructs in type and value can be confusing at first, they’re even‐
// tually useful as a mnemonic once you get the hang of it

// Things to Remember

// • Know how to tell whether you’re in type space or value space while reading a
// TypeScript expression. Use the TypeScript playground to build an intuition for
// this.

// • Every value has a type, but types do not have values. Constructs such as type and
// interface exist only in the type space.

// • "foo" might be a string literal, or it might be a string literal type. Be aware of this
// distinction and understand how to tell which it is.

// • typeof, this, and many other operators and keywords have different meanings
// in type space and value space.

// • Some constructs such as class or enum introduce both a type and a value
