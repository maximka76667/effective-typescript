// Item 11: Recognize the Limits of Excess Property Checking

interface Room {
  area: number;
  numWindows: number;
  name: String;
}

const room: Room = {
  area: 50,
  numWindows: 3,
  name: "Bedroom 1",
  numDoors: 1,
  // Object literal may only specify known properties,
  // and 'numDoors' does not exist in type 'Room'.
};

const strangeThing = {
  area: 30,
  numWindows: 2,
  name: "Kitchen",
  numDoors: 2,
};

const room2: Room = strangeThing; // Passes the type checker

// So what is different about these two examples? In the first you’ve triggered a process
// known as “excess property checking,” which helps catch an important class of errors
// that the structural type system would otherwise miss. But this process has its limits,
// and conflating it with regular assignability checks can make it harder to build an intuition
// for structural typing. Recognizing excess property checking as a distinct process
// will help you build a clearer mental model of TypeScript’s type system.

interface Theme {
  title: String,
  dark?: boolean,
}

function setDarkMode() {
  // ...
}

function applyTheme(options: Theme) {
  if (options.dark) {
    setDarkMode();
  }
  // ...
}

applyTheme({ title: "Dark Knight", darK: true });
// Object literal may only specify known properties,
// but 'darK' does not exist in type 'Theme'.
// Did you mean to write 'dark'?

const t1: Theme = document;
const t2: Theme = new HTMLAnchorElement();

// Both document and instances of HTMLAnchorElement have title properties that are
// strings, so these assignments are OK. Options is a broad type indeed!

// Object literals trigger type check.

const t: Theme = { darkmode: true, title: "Skewer" };
// Object literal may only specify known properties, and 'darkmode' does not exist in type 'Theme'.

// The same but without object literal
const themeObj = { darkmode: true, title: "Skewer" };
const theme: Theme = themeObj;

// Excess property checking does not happen when you use a type assertion:
const theme1: Theme = { darkmode: true, title: "Blue skyscraper" } as Theme;

// If you don’t want this sort of check, you can tell TypeScript to expect additional properties
// using an index signature:
interface Options {
  darkMode?: boolean,
  [otherOptions: string]: unknown
}

const options: Options = { theme: "Skyscraper", name: "Name 1" };

// Item 15 discusses when this is and is not an appropriate way to model your data.

// A related check happens for “weak” types, which have only optional properties:

interface Inventory {
  sword?: string,
  bow?: string,
  armor?: string,
}

const player = { boots: "Elf bow" };
const playerInventory: Inventory = player;
// Type '{ boots: string; }' has no properties in common with type 'Inventory'.

// From a structural point of view, the Inventory type should include almost all
// objects. For weak types like this, TypeScript adds another check to make sure that the
// value type and declared type have at least one property in common.

// Excess property checking is an effective way of catching typos and other mistakes in
// property names that would otherwise be allowed by the structural typing system. It’s
// particularly useful with types like Options that contain optional fields. But it is also
// very limited in scope: it only applies to object literals. Recognize this limitation and
// distinguish between excess property checking and ordinary type checking. This will
// help you build a mental model of both.

// Factoring out a constant made an error go away here, but it can also introduce an
// error in other contexts. See Item 26 for examples of this.

// Things to Remember

// • When you assign an object literal to a variable or pass it as an argument to a
// function, it undergoes excess property checking.

// • Excess property checking is an effective way to find errors, but it is distinct from
// the usual structural assignability checks done by the TypeScript type checker.
// Conflating these processes will make it harder for you to build a mental model of
// assignability.

// • Be aware of the limits of excess property checking: introducing an intermediate
// variable will remove these checks.
