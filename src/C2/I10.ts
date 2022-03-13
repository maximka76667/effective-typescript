// Primitives are distinguished from objects by being immutable and not having meth‐
// ods. You might object that strings do have methods:

"primitive".charAt(3); // 'm'

// But things are not quite as they seem. There’s actually something surprising and sub‐
// tle going on here. While a string primitive does not have methods, JavaScript also
// defines a String object type that does. JavaScript freely converts between these types.
// When you access a method like charAt on a string primitive, JavaScript wraps it in a
// String object, calls the method, and then throws the object away.

// You can instantiate a String object directly and it will sometimes behave like a string
// primitive. But not always. For example, a String object is only ever equal to itself

new String("hello") === "hello"; // false
new String("hello") === new String("hello"); // false

// The implicit conversion to object wrapper types explains an odd phenomenon in
// JavaScript—if you assign a property to a primitive, it disappears:

const x = "hello";
x.language = "English"; // 'English'
x.language; // undefined

// As a final note, it’s OK to call BigInt and Symbol without new, since these create
// primitives:

typeof BigInt(1234); // "bigint"
typeof Symbol("sym"); // "symbol"

// These are the BigInt and Symbol values, not the TypeScript types (Item 8). Calling
// them results in values of type bigint and symbol.
