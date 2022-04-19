// Item 19: Avoid Cluttering Your Code with Inferable Types

// The first thing that many new TypeScript developers do when they convert a codebase
// from JavaScript is fill it with type annotations. TypeScript is about types, after all!
// But in TypeScript many annotations are unnecessary. Declaring types for all your
// variables is counterproductive and is considered poor style.

// Don’t write:
let x: number = 12;

// Instead, just write:
let x1 = 12;

// TypeScript will also infer the types of more complex objects. Instead of:

const person: {
  name: string;
  born: {
    where: string;
    when: string;
  };
  died: {
    where: string;
    when: string;
  }
} = {
  name: "Sojourner Truth",
  born: {
    where: "Swartekill, NY",
    when: "c.1797",
  },
  died: {
    where: "Battle Creek, MI",
    when: "Nov. 26, 1883",
  },
};

// you can just write:

const personWithoutTypeAnnotation = {
  name: "Sojourner Truth",
  born: {
    where: "Swartekill, NY",
    when: "c.1797",
  },
  died: {
    where: "Battle Creek, MI",
    when: "Nov. 26, 1883",
  },
};
