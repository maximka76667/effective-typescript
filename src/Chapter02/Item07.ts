// Item 7. Think of Types as Sets of Values

type rule = "off" | "warn" | "error";

const rule1: rule = "warn";

// const rule2: rule = "yes";
// Type '"yes"' is not assignable to type 'rule'.

interface Person {
  name: string;
}
interface Lifespan {
  birth: Date;
  death?: Date;
}
type PersonSpan = Person & Lifespan;

const ps: PersonSpan = {
  name: "Alan Turing",
  birth: new Date("1912/06/23"),
  death: new Date("1954/06/07"),
  // eyeColor: "green",
  // Type '{ name: string; birth: Date; death: Date; eyeColor: string; }'
  // is not assignable to type 'PersonSpan'.
  // Object literal may only specify known properties,
  // and 'eyeColor' does not exist in type 'PersonSpan'.
}; // OK

interface PersonSpan2 extends Person {
  birth: Date;
  death?: Date;
}

// interface Vector1D { x: number; }
// interface Vector2D { x: number; y: number; }
// interface Vector3D { x: number; y: number; z: number; }

interface Vector1D { x: number }
interface Vector2D extends Vector1D { y: number }
interface Vector3D extends Vector2D { z: number }

function getKey<K extends string>(val: any, key: K) {
  // ...
}

getKey({}, "x"); // OK, 'x' extends string
getKey({}, Math.random() < 0.5 ? "a" : "b"); // OK, 'a'|'b' extends string
getKey({}, document.title); // OK, string extends string
// getKey({}, 12); // Argument of type 'number' is not assignable to parameter of type 'string'.

interface Point {
  x: number;
  y: number;
}

type PointKeys = keyof Point; // Type is "x" | "y"

function sortBy<T, K extends keyof T>(vals: T[], key: K): T[] {
  // ...
  return [];
}

const pts: Point[] = [{ x: 2, y: 2 }, { x: 5, y: 4 }];
sortBy(pts, "x");
sortBy(pts, "y");
sortBy(pts, Math.random() < 0.5 ? "x" : "y");
// sortBy(pts, "z"); // Argument of type '"z"' is not assignable
// to parameter of type 'keyof Point'.

const triple: [number, number, number] = [1, 2, 3];
// const double: [number, number] = triple; // Type '[number, number, number]'
// is not assignable to type '[number, number]'.
// Source has 3 element(s) but target allows only 2.

type T = Exclude<Date | number, string | number>; // Type is Date
type NonZeroNums = Exclude<number, 0>; // Type is still just number

//      --TypeScript term--        --Set term--
//      never                      ∅ (empty set)
//      Literal type               Single element set
//      Value assignable to T      Value ∈ T (member of)
//      T1 assignable to T2        T1 ⊆ T2 (subset of)
//      T1 extends T2              T1 ⊆ T2 (subset of)
//      T1 | T2                    T1 ∪ T2 (union)
//      T1 & T2                    T1 ∩ T2 (intersection)
//      unknown                    Universal set

// Things to remember

// • Think of types as sets of values (the type’s domain). These sets can either be finite
// (e.g., boolean or literal types) or infinite (e.g., number or string).

// • TypeScript types form intersecting sets (a Venn diagram) rather than a strict hierarchy.
// Two types can overlap without either being a subtype of the other.

// • Remember that an object can still belong to a type even if it has additional properties
// that were not mentioned in the type declaration.

// • Type operations apply to a set’s domain. The intersection of A and B is the intersection
// of A’s domain and B’s domain. For object types, this means that values in A
// & B have the properties of both A and B.

// • Think of “extends,” “assignable to,” and “subtype of ” as synonyms for “subset of.”
