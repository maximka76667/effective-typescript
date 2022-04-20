// Item 21: Understand Type Widening

// As Item 7 explained, at runtime every variable has a single value. But at static analysis
// time, when TypeScript is checking your code, a variable has a set of possible values,
// namely, its type. When you initialize a variable with a constant but don’t provide a
// type, the type checker needs to decide on one. In other words, it needs to decide on a
// set of possible values from the single value that you specified. In TypeScript, this process
// is known as widening. Understanding it will help you make sense of errors and
// make more effective use of type annotations.

// Suppose you’re writing a library to work with vectors. You write out a type for a 3D
// vector and a function to get the value of any of its components:

interface Vector3D { x: number, y: number, z: number }

function getComponent(vector: Vector3D, axis: "x" | "y" | "z") {
  return vector[axis];
}

let axisX = "x";
axisX = "y";
const vector = { x: 10, y: 20, z: 30 };

getComponent(vector, axisX);
// Argument of type 'string' is not assignable to parameter of type '"x" | "y" | "z"'.

// This code runs fine, so why the error?

// The issue is that x’s type is inferred as string, whereas the getComponent function
// expected a more specific type for its second argument. This is widening at work, and
// here it has led to an error.

// This process is ambiguous in the sense that there are many possible types for any
// given value. In this statement, for example:

const mixed = ["x", 2];

// what should the type of mixed be? Here are a few possibilities:

// • ('x' | 1)[]
// • ['x', 1]
// • [string, number]
// • readonly [string, number]
// • (string|number)[]
// • readonly (string|number)[]
// • [any, any]
// • any[]

// Without more context, TypeScript has no way to know which one is “right.” It has to
// guess at your intent. (In this case, it guesses (string|number)[].) And smart as it is,
// TypeScript can’t read your mind. It won’t get this right 100% of the time. The result is
// inadvertent errors like the one we just looked at.

// In the initial example, the type of x is inferred as string because TypeScript chooses
// to allow code like this:

let x = "x";
x = "a";
x = "Four score and seven years ago...";

// But it would also be valid JavaScript to write:

let x = "x";
x = /x|y|z/;
x = ["x", "y", "z"];

// In inferring the type of x as string, TypeScript attempts to strike a balance between
// specificity and flexibility. The general rule is that a variable’s type shouldn’t change
// after it’s declared (Item 20), so string makes more sense than string|RegExp or
// string|string[] or any.

// TypeScript gives you a few ways to control the process of widening. One is const. If
// you declare a variable with const instead of let, it gets a narrower type. In fact, using

// const fixes the error in our original example:

const axisX = "x"; // type is "y"
const vec = { x: 10, y: 20, z: 30 };
getComponent(vec, axisX); // OK

// Because x cannot be reassigned, TypeScript is able to infer a narrower type without
// risk of inadvertently flagging errors on subsequent assignments. And because the
// string literal type "x" is assignable to "x"|"y"|"z", the code passes the type checker.

// const isn’t a panacea, however. For objects and arrays, there is still ambiguity. The
// mixed example here illustrates the issue for arrays: should TypeScript infer a tuple
// type? What type should it infer for the elements? Similar issues arise with objects.

// This code is fine in JavaScript:

const obj = {
  x: 1,
};
obj.x = 3;
obj.x = "3";
// Type 'string' is not assignable to type 'number'.
obj.y = 4;
// Property 'y' does not exist on type '{ x: number; }'.
obj.name = "Pythagoras";
// Property 'name' does not exist on type '{ x: number; }'.

// The type of v could be inferred anywhere along the spectrum of specificity. At the
// specific end is {readonly x: 1}. More general is {x: number}. More general still
// would be {[key: string]: number} or object. In the case of objects, TypeScript’s
// widening algorithm treats each element as though it were assigned with let. So the
// type of v comes out as {x: number}. This lets you reassign v.x to a different number,
// but not to a string. And it prevents you from adding other properties. (This is a
// good reason to build objects all at once, as explained in Item 23.)

// So the last three statements are errors:

// Again, TypeScript is trying to strike a balance between specificity and flexibility. It
// needs to infer a specific enough type to catch errors, but not so specific that it creates
// false positives. It does this by inferring a type of number for a property initialized to a
// value like 1.

// If you know better, there are a few ways to override TypeScript’s default behavior. One
// is to supply an explicit type annotation:

const obj2: { x: 1 | 3 | 5 } = { x: 3 }; // Type is { x: 1 | 3 | 5 }

// Another is to provide additional context to the type checker (e.g., by passing the
// value as the parameter of a function). For much more on the role of context in type
// inference, see Item 26.

// A third way is with a const assertion. This is not to be confused with let and const,
// which introduce symbols in value space. This is a purely type-level construct. Look at
// the different inferred types for these variables:

const obj3 = {
  x: 1,
  y: 2,
}; // Type is { x: number; y: number; }

const obj4 = {
  x: 1 as const,
  y: 2,
}; // Type is { x: 1; y: number; }

const obj5 = {
  x: 1,
  y: 2,
} as const; // Type is { readonly x: 1; readonly y: 2; }

// When you write as const after a value, TypeScript will infer the narrowest possible
// type for it. There is no widening. For true constants, this is typically what you want.
// You can also use as const with arrays to infer a tuple type:

const arr1 = [1, 2, 3]; // Type is number[]
const arr2 = [1, 2, 3] as const; // Type is readonly [1, 2, 3]

// If you’re getting incorrect errors that you think are due to widening, consider adding
// some explicit type annotations or const assertions. Inspecting types in your editor is
// the key to building an intuition for this (see Item 6).

// Experiment
let tuple1 = [1, 4, 6] as [1 | 3, 2 | 4, 5 | 6];
tuple1 = [1, 2, 5];

let tuple2: [1 | 3, 2 | 4, 5 | 6] = [1, 4, 6];
tuple2 = [1, 2, 5];

// Things to Remember

// • Understand how TypeScript infers a type from a constant by widening it.

// • Familiarize yourself with the ways you can affect this behavior: const, type annotations,
// context, and as const.
