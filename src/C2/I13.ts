// Item 13: Know the Differences Between type and interface

// If you want to define a named type in TypeScript, you have two options. You can use
// a type, as shown here:

type TypeState = {
  name: string,
  capital: string,
};

interface InterfaceState {
  name: string,
  capital: string,
}

// (You could also use a class, but that is a JavaScript runtime concept that also introduces
// a value. See Item 8.)

// Which should you use, type or interface? The line between these two options has
// become increasingly blurred over the years, to the point that in many situations you
// can use either. You should be aware of the distinctions that remain between type and
// interface and be consistent about which you use in which situation. But you should
// also know how to write the same types using both, so that you’ll be comfortable reading
// TypeScript that uses either.

// The examples in this item prefix type names with I or T solely to
// indicate how they were defined. You should not do this in your
// code! Prefixing interface types with I is common in C#, and this
// convention made some inroads in the early days of TypeScript. But
// it is considered bad style today because it’s unnecessary, adds little
// value, and is not consistently followed in the standard libraries.

// First, the similarities: the State types are nearly indistinguishable from one another. If
// you define an IState or a TState value with an extra property, the errors you get are
// character-by-character identical:

const colorado: TypeState = {
  name: "Colorado",
  capital: "Denver",
  population: 705576,
  // Type '{ name: string; capital: string; population: number; }'
  // is not assignable to type 'TypeState'.
  // Object literal may only specify known properties,
  // and 'population' does not exist in type 'TypeState'.
};

const alaska: InterfaceState = {
  name: "Alaska",
  capital: "Juneau",
  population: 32227,
  // Type '{ name: string; capital: string; population: number; }'
  // is not assignable to type 'InterfaceState'.
  // Object literal may only specify known properties,
  // and 'population' does not exist in type 'InterfaceState'.
};

// You can use an index signature with both interface and type:

type TypeDict = {
  [key: string]: string
};

interface InterfaceDict {
  [key: string]: string;
}

type TypeFunction = (x: number) => string;

interface InterfaceFunction {
  (x: number): string
}

const toStr1: TypeFunction = (x) => `${x}`;
const toStr2: TypeFunction = (x) => `${x}`;

type TypeFunctionWithProps = {
  (x: number): string,
  prop: string
};

interface InterfaceFunctionWithProps {
  (x: number): string,
  prop: string
}

// You can remember this syntax by reminding yourself that in JavaScript, functions are
// callable objects.

// Both type aliases and interfaces can be generic:

type TypePair<T> = {
  first: T,
  second: T,
};

interface InterfacePair<T> {
  first: T,
  second: T,
}

interface InterfaceStateWithPopulation extends InterfaceState {
  population: number,
}

type TypeStateWithPopulation = TypeState & { population: number };

const arizona: TypeStateWithPopulation = {
  name: "Arizona",
  capital: "Phoenix",
  population: 1633000,
};

const texas: InterfaceStateWithPopulation = {
  name: "Texas",
  capital: "Austin",
  population: 950807,
};

// Again, these types are identical. The caveat is that an interface cannot extend a
// complex type like a union type. If you want to do that, you’ll need to use type and &.

// A class can implement either an interface or a simple type:

class StateOfType implements TypeState {
  name: string = "New Your";

  capital: string = "Albany";

  population: number = 97478;
  // Even if there is no population property on TypeState type
}

class StateOfInterface implements InterfaceState {
  name: string = "Michigan";

  capital: string = "Lansing";
}

// Those are the similarities. What about the differences? You’ve seen one already—
// there are union types but no union interfaces:

type TypeAOrB = "A" | "B";

type Input = { /* ... */ };
type Output = { /* ... */ };

interface InterfaceVariableMap {
  [name: string]: Input | Output,
}

type TypeNamedVariable = (Input | Output) & { name: string };

// This type cannot be expressed with interface. A type is, in general, more capable
// than an interface. It can be a union, and it can also take advantage of more
// advanced features like mapped or conditional types.

// It can also more easily express tuple and array types:

type Pair = [number, number];
type StringList = string[];
type NamedNums = [string, ...number[]];

// You can express something like a tuple using interface:

interface TupleLike {
  0: number,
  1: number,
  length: 2,
}

const tuple: TupleLike = [10, 20];

// But this is awkward and drops all the tuple methods like concat. Better to use a type.
// For more on the problems of numeric indices, see Item 16.

// An interface does have some abilities that a type doesn’t, however. One of these is
// that an interface can be augmented. Going back to the State example, you could
// have added a population field in another way:

interface InterfaceState {
  name: string,
  capital: string,
}

interface InterfaceState {
  population: number,
}

const wisconsin: InterfaceState = {
  name: "Wisconsin",
  capital: "Madison",
  population: 254977,
};
