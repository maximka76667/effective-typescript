// Item 23: Create Objects All at Once

// As Item 20 explained, while a variable’s value may change, its type in TypeScript generally
// does not. This makes some JavaScript patterns easier to model in TypeScript
// than others. In particular, it means that you should prefer creating objects all at once,
// rather than piece by piece.

// Here’s one way to create an object representing a two - dimensional point in JavaScript:
const pt = {};
pt.x = 3;
// Property 'x' does not exist on type '{}'.
pt.y = 4;
// Property 'y' does not exist on type '{}'.

// In TypeScript, this will produce errors on each assignment:

// This is because the type of pt on the first line is inferred based on its value {}, and
// you may only assign to known properties.

// You get the opposite problem if you define a Point interface:
interface Point { x: number, y: number }
const point: Point = {};
// Type '{}' is missing the following properties from type 'Point': x, y
point.x = 3;
point.y = 4;

// The solution is to define the object all at once:
const pointAllAtOnce = {
  x: 3,
  y: 4,
}; // OK

// If you must build the object piecemeal, you may use a type assertion (as) to silence
// the type checker:

const pointFromPieces = {} as Point;
pointFromPieces.x = 3;
pointFromPieces.y = 4;
pointFromPieces.z = 2;
// Property 'z' does not exist on type 'Point'.

// But the better way is by building the object all at once and using a declaration(see
// Item 9):

// If you need to build a larger object from smaller ones, avoid doing it in multiple steps:
const pointId = { name: "Max" };
const namedPoint = {};
Object.assign(namedPoint, pointAllAtOnce, pointId);
namedPoint.name;
// Property 'name' does not exist on type '{}'.

// You can build the larger object all at once instead using the object spread operator,
// ...:
const namedPoint2 = { ...pointAllAtOnce, ...pointId };
namedPoint2.name; // OK

// You can also use the object spread operator to build up objects field by field in a typesafe
// way. The key is to use a new variable on every update so that each gets a new
// type:

const pointStep1 = {}; // Type is {}
const pointStep2 = { ...pointStep1, x: 6 }; // Type is { x: number; }
const pointStep3: Point = { ...pointStep2, y: 14 }; // Type is Point. OK

// While this is a roundabout way to build up such a simple object, it can be a useful
// technique for adding properties to an object and allowing TypeScript to infer a new
// type.

// To conditionally add a property in a type-safe way, you can use object spread with
// null or {}, which add no properties:

declare let hasMiddle: boolean;
const presidentName = { first: "Donald", last: "Trump" };
const president = { ...presidentName, ...(hasMiddle ? { middle: "S" } : {}) };
// Type is { middle?: string | undefined; first: string;last: string; }

president.middle;
