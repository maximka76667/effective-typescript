// Item 14: Use Type Operations and Generics to Avoid Repeating Yourself

// This script prints the dimensions, surface areas, and volumes of a few cylinders:

console.log(
  "Cylinder 1 x 1 ",
  "Surface area:",
  6.283185 * 1 * 1 + 6.283185 * 1 * 1,
  "Volume:",
  3.14159 * 1 * 1 * 1,
);

console.log(
  "Cylinder 1 x 2 ",
  "Surface area:",
  6.283185 * 1 * 1 + 6.283185 * 2 * 1,
  "Volume:",
  3.14159 * 1 * 2 * 1,
);

console.log(
  "Cylinder 2 x 1 ",
  "Surface area:",
  6.283185 * 2 * 1 + 6.283185 * 2 * 1,
  "Volume:",
  3.14159 * 2 * 2 * 1,
);

// Is this code uncomfortable to look at? It should be. It’s extremely repetitive, as though
// the same line was copied and pasted, then modified. It repeats both values and con
// stants. This has allowed an error to creep in (did you spot it?). Much better would be
// to factor out some functions, a constant, and a loop:

type shapeFn = (radius: number, height: number) => number;

const surfaceArea: shapeFn = (radius, height) => 2 * Math.PI * radius * (radius + height);
const volume: shapeFn = (radius, height) => Math.PI * radius ** 2 * height;

for (const [radius, height] of [[1, 2], [2, 1], [2, 2]]) {
  console.log(
    `Cylinder ${radius} x ${height}`,
    `Surface area: ${surfaceArea(radius, height)}`,
    `Volume: ${volume(radius, height)}`,
  );
}

// This is the DRY principle: don’t repeat yourself.
// It’s the closest thing to universal
// advice that you’ll find in software development. Yet developers who assiduously avoid
// repetition in code may not think twice about it in types:

interface Person {
  firstName: string;
  lastName: string;
}

interface PersonWithBirthDate {
  firstName: string;
  lastName: string;
  birth: Date;
}

// Duplication in types has many of the same problems as duplication in code. What if
// you decide to add an optional middleName field to Person? Now Person and Person
// WithBirthDate have diverged.

// One reason that duplication is more common in types is that the mechanisms for factoring
// out shared patterns are less familiar than they are with code: what’s the type
// system equivalent of factoring out a helper function? By learning how to map
// between types, you can bring the benefits of DRY to your type definitions.

// The simplest way to reduce repetition is by naming your types. Rather than writing a
// distance function this way:

function distance(a: { x: number, y: number }, b: { x: number, y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
// create a name for the type and use that:

interface Point2D {
  x: number;
  y: number;
}

function distanceWithoutRepetitions(a: Point2D, b: Point2D) { /* ... */ }

// This is the type system equivalent of factoring out a constant instead of writing it
// repeatedly. Duplicated types aren’t always so easy to spot. Sometimes they can be
// obscured by syntax. If several functions share the same type signature, for instance:

function get(url: string, opts: Options): Promise<Response> { /* ... */ }
function post(url: string, opts: Options): Promise<Response> { /* ... */ }

// Then you can factor out a named type for this signature:

type HTTPFunction = (url: string, opts: Options) => Promise<Response>;
const getWithType: HTTPFunction = (url, opts) => { /* ... */ };
const postWithType: HTTPFunction = (url, opts) => { /* ... */ };

// For more on this, see Item 12.

// What about the Person/PersonWithBirthDate example? You can eliminate the repetition
// by making one interface extend the other:

interface Person {
  firstName: string,
  secondName: string,
}

interface PersonWithBirthDate extends Person {
  birth: Date,
}

// You can also use the intersection operator (&) to extend an existing type, though this
// is less common:

type PersonWithBirthDate2 = Person & { birth: Date };

// This technique is most useful when you want to add some additional properties to a
// union type (which you cannot extend). For more on this, see Item 13.

// You can also go the other direction. What if you have a type, State, which represents
// the state of an entire application, and another, TopNavState, which represents just a
// part?

interface State {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
  pageContents: string;
}

interface TopNavState {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
}

// Rather than building up State by extending TopNavState, you’d like to define TopNav
// State as a subset of the fields in State. This way you can keep a single interface
// defining the state for the entire app.

// You can remove duplication in the types of the properties by indexing into State:

type TopNavStateIndexed = {
  userId: State["userId"];
  pageTitle: State["pageTitle"];
  recentFiles: State["recentFiles"];
};

// While it’s longer, this is progress: a change in the type of pageTitle in State will get
// reflected in TopNavState. But it’s still repetitive. You can do better with a mapped
// type:

type TopNavStateMapped = {
  [k in "userId" | "pageTitle" | "recentFiles"]: State[k]
};

// Mousing over TopNavState shows that this definition is, in fact, exactly the same as
// the previous one.

// Mapped types are the type system equivalent of looping over the fields in an array.
// This particular pattern is so common that it’s part of the standard library, where it’s
// called Pick:

type PickDefinition<T, K extends keyof T> = { [k in K]: T[k] };
// (This definition isn’t quite complete, as you will see.) You use it like this:

type TopNavStatePicked = Pick<State, "userId" | "pageTitle" | "recentFiles">;

// Pick is an example of a generic type. Continuing the analogy to removing code duplication,
// using Pick is the equivalent of calling a function. Pick takes two types, T and
// K, and returns a third, much as a function might take two values and return a third.

// Another form of duplication can arise with tagged unions. What if you want a type
// for just the tag?

interface SaveAction {
  type: "save"
}

interface LoadAction {
  type: "load"
}

type Action = SaveAction | LoadAction;
type ActionType = "save" | "load"; // Repeated types!

// You can define ActionType without repeating yourself by indexing into the Action
// union:

type ActionTypeIndexed = Action["type"]; // Type is "save" | "load"

// As you add more types to the Action union, ActionType will incorporate them automatically.
// This type is distinct from what you’d get using Pick, which would give you
// an interface with a type property:

type ActionRec = Pick<Action, "type">; // { type: "save" | "load" }

// If you’re defining a class which can be initialized and later updated, the type for the
// parameter to the update method will optionally include most of the same parameters
// as the constructor:

interface User {
  id: number,
  name: string,
  workPlace: string,
  avatar: string,
}

interface UserUpdate {
  name?: string,
  workPlace?: string,
  avatar?: string,
}

class UIWidget {
  constructor(initData: User) { /* ... */ }

  update(newData: UserUpdate) { /* ... */ }
}

type UserUpdateMapped = { [k in keyof User]?: User[k] };

// The mapped type ([k in keyof Options]) iterates over these and looks up the corresponding
// value type in Options. The ? makes each property optional. This pattern
// is also extremely common and is enshrined in the standard library as Partial:

class UIWidget {
  constructor(initData: User) { /* ... */ }

  update(newData: Partial<User>) { /* ... */ }
}

const palette = {
  firstColor: "#fac5bc",
  secondColor: "#0abcab",
};

type Palette = typeof palette;

// This intentionally evokes JavaScript’s runtime typeof operator, but it operates at the
// level of TypeScript types and is much more precise. For more on typeof, see Item 8.
// Be careful about deriving types from values, however. It’s usually better to define
// types first and declare that values are assignable to them. This makes your types more
// explicit and less subject to the vagaries of widening (Item 21).

// Similarly, you may want to create a named type for the inferred return value of a
// function or method:

function getUserInfo(id: string): User {
  // ...
  return {
    id,
    name,
    workPlace,
    avatar,
  };
}

// Doing this directly requires conditional types (see Item 50). But, as we’ve seen before,
// the standard library defines generic types for common patterns like this one. In this
// case the ReturnType generic does exactly what you want:

type UserInfo = typeof getUserInfo; // Type is (userId: string) => User
type UserInfo2 = ReturnType<typeof getUserInfo>; // Type is User

// Note that ReturnType operates on typeof getUserInfo, the function’s type, rather
// than getUserInfo, the function’s value. As with typeof, use this technique judiciously.
// Don’t get mixed up about your source of truth.

// Generic types are the equivalent of functions for types. And functions are the key to
// DRY for logic. So it should come as no surprise that generics are the key to DRY for
// types. But there’s a missing piece to this analogy. You use the type system to constrain
// the values you can map with a function: you add numbers, not objects; you find the
// area of shapes, not database records. How do you constrain the parameters in a
// generic type?

interface Dancer {
  name: string,
  style: string
}

type DancingDuo<T extends Dancer> = [T, T];

const couple1: DancingDuo<Dancer> = [
  { name: "Luis", style: "Samba" },
  { name: "Maria", style: "Samba" },
];

const couple2: DancingDuo<{ name: string }> = [
  // Type '{ name: string; }' does not satisfy the constraint 'Dancer'.
  // Property 'style' is missing in type '{ name: string; }' but required in type 'Dancer'.
  { name: "Maxim" },
  { name: "Veronika" },
];

// At the moment, TypeScript always requires you to write out the
// generic parameter in a declaration. Writing DancingDuo instead of
// DancingDuo<Name> won’t cut it. If you want TypeScript to infer the
// type of the generic parameter, you can use a carefully typed identity
// function:

const dancingDuo = <T extends Dancer>(x: DancingDuo<T>) => x;

const couple3 = dancingDuo([
  { name: "James", style: "Hip Hop" },
  { name: "Jade", style: "Hip Hop" },
]);

// For a particularly useful variation on this, see inferringPick in
// Item 26.

// You can use extends to complete the definition of Pick from earlier. If you run the
// original version through the type checker, you get an error:

type PickDefinition2<T, K> = {
  [k in K]: T[k]
  // Type 'K' is not assignable to type 'string | number | symbol'.
}

// K is unconstrained in this type and is clearly too broad: it needs to be something that
// can be used as an index, namely, string | number | symbol. But you can get narrower
// than that—K should really be some subset of the keys of T, namely, keyof T:

type PickDefinition3<T, K extends keyof T> = {
  [k in K]: T[k]
};

// Thinking of types as sets of values (Item 7), it helps to read “extends” as “subset of ”
// here.

// As you work with increasingly abstract types, try not to lose sight of the goal: accepting
// valid programs and rejecting invalid ones. In this case, the upshot of the constraint
// is that passing Pick the wrong key will produce an error:

type FirstStyle = Pick<Dancer, "name" | "style">;
type FirstAge = Pick<Dancer, "name" | "age">;
// Type '"age"' is not assignable to type 'keyof Dancer'.

// Repetition and copy/paste coding are just as bad in type space as they are in value
// space. The constructs you use to avoid repetition in type space may be less familiar
// than those used for program logic, but they are worth the effort to learn. Don’t repeat
// yourself!

// Things to Remember

// • The DRY (don’t repeat yourself) principle applies to types as much as it applies to
// logic.

// • Name types rather than repeating them. Use extends to avoid repeating fields in
// interfaces.

// • Build an understanding of the tools provided by TypeScript to map between
// types. These include keyof, typeof, indexing, and mapped types.

// • Generic types are the equivalent of functions for types. Use them to map between
// types instead of repeating types. Use extends to constrain generic types.

// • Familiarize yourself with generic types defined in the standard library such as
// Pick, Partial, and ReturnType.
