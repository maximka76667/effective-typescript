// Item 15: Use Index Signatures for Dynamic Data

// One of the best features of JavaScript is its convenient syntax for creating objects:

const rocket = {
  name: "Falcon 9",
  variant: "Block 5",
  thrust: "7,607 kN",
};

// Objects in JavaScript map string keys to values of any type. TypeScript lets you represent
// flexible mappings like this by specifying an index signature on the type:

type Rocket = { [property: string]: string };

const rocket2: Rocket = {
  name: "Falcon 9",
  variant: "v1.0",
  thrust: "4,940 kN",
};

// The [property: string]: string is the index signature. It specifies three things:

// A name for the keys
// This is purely for documentation; it is not used by the type checker in any way.

// A type for the key
// This needs to be some combination of string, number, or symbol, but generally
// you just want to use string (see Item 16).

// A type for the values
// This can be anything.

// While this does type check, it has a few downsides:

// • It allows any keys, including incorrect ones. Had you written Name instead of
// name, it would have still been a valid Rocket type.

// • It doesn’t require any specific keys to be present. {} is also a valid Rocket.

// • It cannot have distinct types for different keys. For example, thrust should probably
// be a number, not a string.

// • TypeScript’s language services can’t help you with types like this. As you’re typing
// name:, there’s no autocomplete because the key could be anything.

// In short, index signatures are not very precise. There are almost always better alternatives
// to them. In this case, Rocket should clearly be an interface:

interface Rocket2 {
  name: string,
  variant: string,
  thrust_kN: number,
}

const falconHeavy: Rocket2 = {
  name: "Falcon Heavy",
  variant: "v1",
  thrust_kN: 15_200,
};

// Now thrust_kN is a number and TypeScript will check for the presence of all required
// fields. All the great language services that TypeScript provides are available: autocomplete,
// jump to definition, rename—and they all work.

// What should you use index signatures for? The canonical case is truly dynamic data.
// This might come from a CSV file, for instance, where you have a header row and
// want to represent data rows as objects mapping column names to values:

function parseCSV(input: string): { [columnName: string]: string }[] {
  const lines = input.split("\n");
  const [header, ...rows] = lines;
  return rows.map((rowStr) => {
    const row: { [columnName: string]: string } = {};
    rowStr.split(",").forEach((cell, i) => {
      row[header[i]] = cell;
    });
    return row;
  });
}

interface ProductRow {
  productId: string;
  name: string;
  price: string;
}

declare let csvData: string;
const products = parseCSV(csvData) as unknown as ProductRow[];

// Of course, there’s no guarantee that the columns at runtime will actually match your
// expectation. If this is something you’re concerned about, you can add undefined to
// the value type:

function safeParseCSV(
  input: string,
): { [columnName: string]: string | undefined }[] {
  return parseCSV(input);
}

// Now every access requires a check:

const rows = parseCSV(csvData);
const prices: { [produt: string]: number } = {};
for (const row of rows) {
  prices[row.productId] = Number(row.price);
}

const safeRows = safeParseCSV(csvData);
for (const row of safeRows) {
  prices[row.productId] = Number(row.price);
  //     ~~~~~~~~~~~~~ Type 'undefined' cannot be used as an index type
}

// Of course, this may make the type less convenient to work with. Use your judgment.

interface Row1 { [column: string]: number } // Too broad
interface Row2 { a: number; b?: number; c?: number; d?: number } // Better
type Row3 =
  | { a: number; }
  | { a: number; b: number; }
  | { a: number; b: number; c: number; }
  | { a: number; b: number; c: number; d: number };

// If the problem with using an index signature is that string is too broad, then there
// are a few alternatives.

// One is using Record. This is a generic type that gives you more flexibility in the key
// type. In particular, you can pass in subsets of string:

type Vec3D = Record<"x" | "y" | "z", number>;
// type Vec3D = {
//   x: number;
//   y: number;
//   z: number;
// }

type Vec3D_2 = { [k in "x" | "y" | "z"]: number };
// Same as above

type ABC = { [k in "a" | "b" | "c"]: k extends "b" ? string : number };
// Type ABC = {
// a: number;
// b: string;
// c: number;
// }

// Things to Remember

// • Use index signatures when the properties of an object cannot be known until
// runtime—for example, if you’re loading them from a CSV file.

// • Consider adding undefined to the value type of an index signature for safer
// access.

// • Prefer more precise types to index signatures when possible: interfaces,
// Records, or mapped types.
