// Item 20: Use Different Variables for Different Types

// In JavaScript it’s no problem to reuse a variable to hold a differently typed value for a
// different purpose:
let id = "12-34-56";
fetchProduct(id); // Expects a string

id = 123456;
fetchProductBySerialNumber(id); // Expects a number

// In TypeScript, this results in two errors:
let id = "12-34-56";
fetchProduct(id);

id = 123456;
// '123456' is not assignable to type 'string'.
fetchProductBySerialNumber(id);
// Argument of type 'string' is not assignable to
// parameter of type 'number'

// Based on the value "12-34-56", TypeScript has inferred id’s type as string. You can’t
// assign a number to a string and hence the error.

// This leads us to a key insight about variables in TypeScript: while a variable’s value can
// change, its type generally does not. The one common way a type can change is to narrow
// (Item 22), but this involves a type getting smaller, not expanding to include new
// values. There are some important exceptions to this rule (Item 41), but they are the
// exceptions and not the rule.

// How can you use this idea to fix the example? In order for id’s type to not change, it
// must be broad enough to encompass both strings and numbers. This is the very definition
// of the union type, string|number:

let idWithUnionType: string | number = "12-34-56";
fetchProduct(idWithUnionType);

idWithUnionType = 123456; // OK
fetchProductBySerialNumber(idWithUnionType); // OK

// This fixes the errors. It’s interesting that TypeScript has been able to determine that id
// is really a string in the first call and really a number in the second. It has narrowed
// the union type based on the assignment.

// While a union type does work, it may create more issues down the road. Union types
// are harder to work with than simple types like string or number because you usually
// have to check what they are before you do anything with them.

// The better solution is to introduce a new variable:
const idNewVariable = "12-34-56";
fetchProduct(idNewVariable);

const serialNewVariable = 123456; // OK
fetchProductBySerialNumber(serialNewVariable); // OK

// In the previous version, the first and second id were not semantically related to one
// another. They were only related by the fact that you reused a variable. This was confusing
// for the type checker and would be confusing for a human reader, too.

// The version with two variables is better for a number of reasons:
// • It disentangles two unrelated concepts (ID and serial number).
// • It allows you to use more specific variable names.
// • It improves type inference. No type annotations are needed.
// • It results in simpler types (string and number, rather than string|number).
// • It lets you declare the variables const rather than let. This makes them easier for
// people and the type checker to reason about.

// Try to avoid type-changing variables. If you can use different names for different concepts,
// it will make your code clearer both to human readers and to the type checker.

// This is not to be confused with “shadowed” variables as in this example:

const id2 = "12-34-56";
fetchProduct(id2);
{
  const id2 = 123456; // OK
  fetchProductBySerialNumber(id2); // OK
}

// While these two ids share a name, they are actually two distinct variables with no
// relationship to one another. It’s fine for them to have different types. While Type‐
// Script is not confused by this, your human readers might be. In general it’s better to
// use different names for different concepts. Many teams choose to disallow this sort of
// shadowing via linter rules.

// This item focused on scalar values, but similar considerations apply to objects. For
// more on that, see Item 23.

// Things to Remember

// • While a variable’s value can change, its type generally does not.

// • To avoid confusion, both for human readers and for the type checker, avoid reusing
// variables for differently typed values.
