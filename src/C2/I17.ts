// Item 17: Use readonly to Avoid Errors Associated with Mutation

// Here’s some code to print the triangular numbers (1, 1+2, 1+2+3, etc.):

function arraySum(arr: number[]) {
  let sum = 0; let
    num;
  while ((num = arr.pop()) !== undefined) {
    sum += num;
  }
  return sum;
}

// The problem is that you’ve made an assumption about arraySum, namely, that it
// doesn’t modify nums. But here’s my implementation:

function printTriangles(n: number) {
  const nums = [];
  for (let i = 0; i < n; i++) {
    nums.push(i);
    console.log(arraySum2(nums));
  }
}

printTriangles(5);

// This function does calculate the sum of the numbers in the array. But it also has the
// side effect of emptying the array! TypeScript is fine with this, because JavaScript
// arrays are mutable.

// It would be nice to have some assurances that arraySum does not modify the array.
// This is what the readonly type modifier does:

function arraySum1(arr: readonly number[]) {
  let sum = 0; let
    num;
  while ((num = arr.pop()) !== undefined) {
    // ~~~ 'pop' does not exist on type 'readonly number[]'
    sum += num;
  }
  return sum;
}

// This error message is worth digging into. readonly number[] is a type, and it is distinct
// from number[] in a few ways:

// • You can read from its elements, but you can’t write to them.

// • You can read its length, but you can’t set it (which would mutate the array).

// • You can’t call pop or other methods that mutate the array.

// Because number[] is strictly more capable than readonly number[], it follows that
// number[] is a subtype of readonly number[]. (It’s easy to get this backwards—
// remember Item 7!) So you can assign a mutable array to a readonly array, but not
// vice versa:

const aNumber: number[] = [1, 2, 3];
const bNumber: readonly number[] = aNumber;
const cNumber: number[] = bNumber;
// The type 'readonly number[]' is 'readonly' and cannot be assigned to the mutable type 'number[]'.

// The fix for arraySum is simple: don’t mutate the array!

function arraySum2(arr: readonly number[]) {
  let sum = 0;
  for (const num of arr) {
    sum += num;
  }
  return sum;
}

printTriangles(5);

// Now printTriangles does what you expect:

// > printTriangles(5)
// 0
// 1
// 3
// 6
// 10

// If your function does not mutate its parameters, then you should declare them
// readonly. There’s relatively little downside: users will be able to call them with a
// broader set of types (Item 29), and inadvertent mutations will be caught.

// One downside is that you may need to call functions that haven’t marked their
// parameters readonly. If these don’t mutate their parameters and are in your control,
// make them readonly! readonly tends to be contagious: once you mark one function
// with readonly, you’ll also need to mark all the functions that it calls. This is a good
// thing since it leads to clearer contracts and better type safety. But if you’re calling a
// function in another library, you may not be able to change its type declarations, and
// you may have to resort to a type assertion (param as number[]).

// readonly can also be used to catch a whole class of mutation errors involving local
// variables. Imagine you’re writing a tool to process a novel. You get a sequence of lines
// and would like to collect them into paragraphs, which are separated by blanks:

// Frankenstein; or, The Modern Prometheus
// by Mary Shelley

// You will rejoice to hear that no disaster has accompanied the commencement
// of an enterprise which you have regarded with such evil forebodings. I arrived
// here yesterday, and my first task is to assure my dear sister of my welfare and
// increasing confidence in the success of my undertaking.

// I am already far north of London, and as I walk in the streets of Petersburgh,
// I feel a cold northern breeze play upon my cheeks, which braces my nerves and
// fills me with delight.

// Here’s an attempt:

function parseTaggedText(lines: string[]): string[][] {
  const paragraphs: string[][] = [];
  const currPara: string[] = [];
  const addParagraph = () => {
    if (currPara.length) {
      paragraphs.push(currPara);
      currPara.length = 0; // Clear the lines
    }
  };
  for (const line of lines) {
    if (!line) {
      addParagraph();
    } else {
      currPara.push(line);
    }
  }
  addParagraph();
  return paragraphs;
}

// When you run this on the example at the beginning of the item, here’s what you get:
// [ [], [], [] ]

// Well that went horribly wrong!

// The problem with this code is a toxic combination of aliasing (Item 24) and mutation.
// The aliasing happens on this line:

// paragraphs.push(currPara);

// Rather than pushing the contents of currPara, this pushes a reference to the array.
// When you push a new value to currPara or clear it, this change is also reflected in the
// entries in paragraphs because they point to the same object.

// In other words, the net effect of this code:

// paragraphs.push(currPara);
// currPara.length = 0; // Clear lines

// is that you push a new paragraph onto paragraphs and then immediately clear it.

// The problem is that setting currPara.length and calling currPara.push both mutate
// the currPara array. You can disallow this behavior by declaring it to be readonly.
// This immediately surfaces a few errors in the implementation:

function parseTaggedText(lines: string[]): string[][] {
  const paragraphs: string[][] = [];
  const currPara: readonly string[] = [];
  const addParagraph = () => {
    if (currPara.length) {
      paragraphs.push(currPara);
      currPara.length = 0; // Clear the lines
    }
  };
  for (const line of lines) {
    if (!line) {
      addParagraph();
    } else {
      currPara.push(line);
    }
  }
  addParagraph();
  return paragraphs;
}

// You can fix two of the errors by declaring currPara with let and using nonmutating
// methods:

function parseTaggedText(lines: string[]): string[][] {
  const paragraphs: string[][] = [];
  let currPara: readonly string[] = [];
  const addParagraph = () => {
    if (currPara.length) {
      paragraphs.push(currPara);
      currPara = []; // Clear the lines
    }
  };
  for (const line of lines) {
    if (!line) {
      addParagraph();
    } else {
      currPara = currPara.concat([line]);
    }
  }
  addParagraph();
  return paragraphs;
}

// Unlike push, concat returns a new array, leaving the original unmodified. By changing
// the declaration from const to let and adding readonly, you’ve traded one sort of
// mutability for another. The currPara variable is now free to change which array it
// points to, but those arrays themselves are not allowed to change.

// This leaves the error about paragraphs. You have three options for fixing this.

// First, you could make a copy of currPara:

// paragraphs.push([...currPara]);

// This fixes the error because, while currPara remains readonly, you’re free to mutate
// the copy however you like.

// Second, you could change paragraphs (and the return type of the function) to be an
// array of readonly string[]:

// const paragraphs: (readonly string[])[] = [];

// (The grouping is relevant here: readonly string[][] would be a readonly array of
// mutable arrays, rather than a mutable array of readonly arrays.)

// This works, but it seems a bit rude to users of parseTaggedText. Why do you care
// what they do with the paragraphs after the function returns?

// Third, you could use an assertion to remove the readonly-ness of the array:

// paragraphs.push(currPara as string[]);

// Since you’re assigning currPara to a new array in the very next statement, this doesn’t
// seem like the most offensive assertion.

// An important caveat to readonly is that it is shallow. You saw this with readonly
// string[][] earlier. If you have a readonly array of objects, the objects themselves are
// not readonly:

const dates: readonly Date[] = [new Date()];
dates.push(new Date());
// ~~~~ Property 'push' does not exist on type 'readonly Date[]'
dates[0].setFullYear(2037); // OK

// Similar considerations apply to readonly’s cousin for objects, the Readonly generic:

interface Outer {
  inner: {
    x: number,
  }
}

const o: Readonly<Outer> = { inner: { x: 0 } };

o.inner = { x: 2 };
// Cannot assign to 'inner' because it is a read-only property.

o.inner.x = 5; // OK

type ReadonlyType = Readonly<Outer>;
// type ReadonlyType = {
//   readonly inner: {
//       x: number;
//   };
// }

// The important thing to note is the readonly modifier on inner but not on x. There is
// no built-in support for deep readonly types at the time of this writing, but it is possible
// to create a generic to do this. Getting this right is tricky, so I recommend using a
// library rather than rolling your own. The DeepReadonly generic in ts-essentials is
// one implementation.

type DeepReadonlyType = DeepReadonly<Outer>;

// You can also write readonly on an index signature. This has the effect of preventing
// writes but allowing reads:

let bills: { readonly [consumption: string]: number } = {};

bills.light = 200;
// Index signature in type '{ readonly [consumption: string]: number; }' only permits reading.

bills = { ...bills, electricity: 1000 }; // OK
bills = { ...bills, gas: 800 };

// This can prevent issues with aliasing and mutation involving objects rather than
// arrays.

// Things to Remember

// • If your function does not modify its parameters then declare them readonly.
// This makes its contract clearer and prevents inadvertent mutations in its
// implementation.

// • Use readonly to prevent errors with mutation and to find the places in your code
// where mutations occur.

// • Understand the difference between const and readonly.

// • Understand that readonly is shallow.
