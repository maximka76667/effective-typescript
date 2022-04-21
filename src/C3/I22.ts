// Item 22: Understand Type Narrowing

// The opposite of widening is narrowing. This is the process by which TypeScript goes
// from a broad type to a narrower one. Perhaps the most common example of this is
// null checking:

const el = document.getElementById("elId");
if (el) {
  el;
  el.innerHTML = "Hop";
} else {
  el;
  alert("Not found");
}

// If el is null, then the code in the first branch won’t execute. So TypeScript is able to
// exclude null from the type union within this block, resulting in a narrower type
// which is much easier to work with. The type checker is generally quite good at narrowing
// types in conditionals like these, though it can occasionally be thwarted by aliasing
// (Item 24).

// You can also narrow a variable’s type for the rest of a block by throwing or returning
// from a branch. For example:

const el2 = document.getElementById("foo"); // Type is HTMLElement | null
if (!el) throw new Error("Unable to find #foo");
el; // Now type is HTMLElement
el.innerHTML = "Party Time".blink();

// There are many ways that you can narrow a type. Using instanceof works:

function contains(text: string, search: string | RegExp) {
  if (search instanceof RegExp) {
    search; // Type is RegExp
    return !!search.exec(text);
  }
  search; // Type is string
  return text.includes(search);
}

interface A { a: number }
interface B { b: number }

function pickAB(ab: A | B) {
  if ("a" in ab) {
    ab; // Type is A
  } else {
    ab; // Type is B
  }
  ab; // Type is A | B
}

// Some built-in functions such as Array.isArray are able to narrow types:

function contains2(text: string, terms: string | string[]) {
  const termList = Array.isArray(terms) ? terms : [terms];
  termList; // Type is string[]
  // ...
}

// TypeScript is generally quite good at tracking types through conditionals. Think twice
// before adding an assertion—it might be onto something that you’re not! For example,
// this is the wrong way to exclude null from a union type:

const el3 = document.getElementById("foo"); // type is HTMLElement | null
if (typeof el === "object") {
  el; // Type is HTMLElement | null
}

// Because typeof null is "object" in JavaScript, you have not, in fact, excluded null
// with this check! Similar surprises can come from falsy primitive values:

function foo(x?: number | string | null) {
  if (!x) {
    x; // Type is string | number | null | undefined
  }
}

// Because the empty string and 0 are both falsy, x could still be a string or number in
// that branch. TypeScript is right!

// Another common way to help the type checker narrow your types is by putting an
// explicit “tag” on them:

interface UploadEvent { type: "upload"; filename: string; contents: string }
interface DownloadEvent { type: "download"; filename: string; }
type AppEvent = UploadEvent | DownloadEvent;
function handleEvent(e: AppEvent) {
  switch (e.type) {
    case "download":
      e; // Type is DownloadEvent
      break;
    case "upload":
      e; // Type is UploadEvent
      break;
    default:
      break;
  }
}

// This pattern is known as a “tagged union” or “discriminated union,” and it is ubiquitous
// in TypeScript.

function isInputElement(el: HTMLElement): el is HTMLInputElement {
  return "value" in el;
}

function getElementContent(el: HTMLElement) {
  if (isInputElement(el)) {
    el; // Type is HTMLInputElement
    return el.value;
  }
  el; // Type is HTMLElement
  return el.textContent;
}

// This is known as a “user-defined type guard.” The el is HTMLInputElement as a
// return type tells the type checker that it can narrow the type of the parameter if the
// function returns true.

// Some functions are able to use type guards to perform type narrowing across arrays
// or objects. If you do some lookups in an array, for instance, you may wind up with an
// array of nullable types:

const michael5 = ["Jackie", "Tito", "Jermaine", "Marlon", "Michael"];
const members = ["Janet", "Michael"].map(
  (who) => michael5.find((n) => n === who),
); // Type is (string | undefined)[]

// If you filter out the undefined values using filter, TypeScript isn’t able to follow
// along:

const members2 = ["Janet", "Michael"].map(
  (who) => michael5.find((n) => n === who),
).filter((who) => who !== undefined); // Type is (string | undefined)[]

// But if you use a type guard, it can:
function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

const members3 = ["Maxim", "Michael"].map(
  (who) => michael5.find((m) => m === who),
).filter(isDefined); // Type is string[]

// As always, inspecting types in your editor is key to building an intuition for how narrowing
// works.

// Understanding how types in TypeScript narrow will help you build an intuition for
// how type inference works, make sense of errors, and generally have a more productive
// relationship with the type checker.

// Things to Remember

// • Understand how TypeScript narrows types based on conditionals and other types
// of control flow.

// • Use tagged/discriminated unions and user-defined type guards to help the process
// of narrowing.
