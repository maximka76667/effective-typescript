// Getting to Know TypeScript
interface Square {
  width: number;
}

interface Rectangle extends Square {
  height: number;
}

type Shape = Square | Rectangle;

function calculateArea(shape: Shape) {
  if ("height" in shape) {
    shape; // Type is Rectangle
    return shape.width * shape.height;
  }
  shape; // Type is Square
  return shape.width * shape.width;
}

// Type Operations Cannot Affect Runtime Values

// .ts
function asNumberTS(val: number | string): number {
  return val as number;
}

// Item 4: Get Comfortable with Structural Typing

interface Vector2D {
  x: number;
  y: number;
}

function calculateLength(v: Vector2D) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

interface NamedVector {
  name: string;
  x: number;
  y: number;
}

const v: NamedVector = { x: 3, y: 4, name: "Zee" };
calculateLength(v); // OK. Result is 5

interface Vector3D {
  x: number;
  y: number;
  z: number;
}

function normalize(v: Vector3D) {
  const length = calculateLength(v);
  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length,
  };
}

console.log(normalize({ x: 3, y: 4, z: 5 }));

function calculateLengthL1(v: Vector3D) {
  let length = 0;
  for (const axis of Object.keys(v)) {
    const coord = v[axis];
    // ~~~~~~~ Element implicitly has an 'any' type because ...
    // 'string' can't be used to index type 'Vector3D'
    length += Math.abs(coord);
  }
  return length;
}

// Is this error a false positive? No! TypeScript is correct to complain. The logic in the
// previous paragraph assumes that Vector3D is sealed and does not have other properties.
// But it could:
const vec3D = {
  x: 3, y: 4, z: 1, address: "123 Broadway",
};

calculateLengthL1(vec3D); // OK, returns NaN

// Since v could conceivably have any properties,
// the type of axis is string. TypeScript
// has no reason to believe that v[axis] is a number because,
// as you just saw, it might
// not be.Iterating over objects can be tricky to type correctly.
// We’ll return to this topic
// in Item 54, but in this case an implementation without loops would be better:
function calculateLengthL2(v: Vector3D) {
  return Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z);
}

// Things to Remember

// Item 3
// Code generation is independent of the type system. This means that TypeScript
// types cannot affect the runtime behavior or performance of your code.

// It is possible for a program with type errors to produce code (“compile”).

// TypeScript types are not available at runtime. To query a type at runtime, you
// need some way to reconstruct it. Tagged unions and property checking are common
// ways to do this. Some constructs, such as class, introduce both a Type‐
// Script type and a value that is available at runtime.

// Item 4
// Understand that JavaScript is duck typed and TypeScript uses structural typing to
// model this: values assignable to your interfaces might have properties beyond
// those explicitly listed in your type declarations. Types are not “sealed.”

// Be aware that classes also follow structural typing rules. You may not have an
// instance of the class you expect!

// Use structural typing to facilitate unit testing.

// Item 5
// The any type effectively silences the type checker and TypeScript language services.
// It can mask real problems, harm developer experience, and undermine confidence
// in the type system. Avoid using it when you can!
