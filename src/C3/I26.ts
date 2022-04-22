// Item 26: Understand How Context Is Used in Type Inference

type Language = "JavaScript" | "TypeScript" | "Python";
function setLanguage(language: Language) { /* ... */ }

setLanguage("JavaScript");

let language = "Python";
language = "TypeScript";
setLanguage(language);
// Argument of type 'string' is not assignable to parameter of type 'Language'.

// What went wrong? With the inline form, TypeScript knows from the function declaration
// that the parameter is supposed to be of type Language. The string literal 'Java
// Script' is assignable to this type, so this is OK. But when you factor out a variable,
// TypeScript must infer its type at the time of assignment. In this case it infers string,
// which is not assignable to Language. Hence the error.

// (Some languages are able to infer types for variables based on their eventual usage.
// But this can also be confusing. Anders Hejlsberg, the creator of TypeScript, refers to it
// as “spooky action at a distance.” By and large, TypeScript determines the type of a
// variable when it is first introduced. For a notable exception to this rule, see Item 41.)

// There are two good ways to solve this problem. One is to constrain the possible values
// of language with a type declaration:

let languageWithTypeDeclaration: Language = "Python";
setLanguage(languageWithTypeDeclaration);

// This also has the benefit of flagging an error if there’s a typo in the language—for
// example 'Typescript' (it should be a capital “S”).

// The other solution is to make the variable constant:

const languageConst = "TypeScript";
setLanguage(languageConst);

// By using const, we’ve told the type checker that this variable cannot change. So Type‐
// Script can infer a more precise type for language, the string literal type "Java
// Script". This is assignable to Language so the code type checks. Of course, if you do
// need to reassign language, then you’ll need to use the type declaration. (For more on
// this, see Item 21.)

// The fundamental issue here is that we’ve separated the value from the context in
// which it’s used. Sometimes this is OK, but often it is not. The rest of this item walks
// through a few cases where this loss of context can cause errors and shows you how to
// fix them.

// Tuple Types

function panTo(where: [number, number]) { /* ... */ }

panTo([10, 20]);

const locationCoords = [10, 20];
panTo(locationCoords);
// Argument of type 'number[]' is not assignable to parameter of type '[number, number]'.

// So how can you fix this error without resorting to any? You’ve already declared it
// const, so that won’t help. But you can still provide a type declaration to let TypeScript
// know precisely what you mean:

const locationCoordsWithTypeDeclaration: [number, number] = [10, 20];
panTo(locationCoordsWithTypeDeclaration);

// Another way is to provide a “const context.” This tells TypeScript that you intend the
// value to be deeply constant, rather than the shallow constant that const gives:

const locationCoordsConst = [10, 20] as const;
panTo(locationCoordsConst);
// Argument of type 'readonly [10, 20]' is not assignable to parameter of type '[number, number]'.

// The best solution
// here is to add a readonly annotation to the panTo function:

function panTo(where: readonly [number, number]) { /* ... */ }

// const contexts can neatly solve issues around losing context in inference, but they do
// have an unfortunate downside: if you make a mistake in the definition (say you add a
// third element to the tuple) then the error will be flagged at the call site, not at the
// definition. This may be confusing, especially if the error occurs in a deeply nested
// object:

const locationCoordsConst2 = [10, 20, 30] as const;
panTo(locationCoordsConst2);

// Argument of type 'readonly [10, 20, 30]' is not assignable
// to parameter of type '[number, number]'.

// Objects

type Language = "JavaScript" | "TypeScript" | "Python";

interface GovernedLanguage {
  language: Language;
  organization: string;
}

function complain(language: GovernedLanguage) { /* ... */ }

complain({ language: "TypeScript", organization: "Microsoft" });

const complaint = { language: "TypeScript", organization: "Microsoft" };

complain(complaint);
// Argument of type '{ language: string; organization: string; }' is not assignable to parameter
// of type 'GovernedLanguage'.
//  Types of property 'language' are incompatible.
//  Type 'string' is not assignable to type 'Language'.

// In the ts object, the type of language is inferred as string. As before, the solution is
// to add a type declaration (const ts: GovernedLanguage = ...) or use a const assertion
// (as const).

function sumRandomNumbers(fn: (a: number, b: number) => number, multiplier: number) {
  fn(Math.random() * multiplier, Math.random() * multiplier);
}

function sum(a, b) {
  // Parameter 'a' implicitly has an 'any' type.
  // Parameter 'b' implicitly has an 'any' type.
  return a + b;
}

sumRandomNumbers(sum, 5);

// The solution is either to add type annotations to the parameters:

function sum(a: number, b: number) {
  // Parameter 'a' implicitly has an 'any' type.
  // Parameter 'b' implicitly has an 'any' type.
  return a + b;
}

// or to apply a type declaration to the entire function expression if one is available. See
// Item 12.

type numericFunction = (a: number, b: number) => number;

const sumWithTypeDeclaration: numericFunction = (a, b) => a + b;

// Things to Remember

// • Be aware of how context is used in type inference.

// • If factoring out a variable introduces a type error, consider adding a type declaration.

// • If the variable is truly a constant, use a const assertion (as const). But be aware
// that this may result in errors surfacing at use, rather than definition.
