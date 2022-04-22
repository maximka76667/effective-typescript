// Item 25: Use async Functions Instead of Callbacks for Asynchronous Code

// Classic JavaScript modeled asynchronous behavior using callbacks. This leads to the
// infamous “pyramid of doom”:

fetchURL(url1, (response1) => {
  fetchURL(url2, (response2) => {
    fetchURL(url3, (response3) => {
      // ...
      console.log(1);
    });
    console.log(2);
  });
  console.log(3);
});
console.log(4);

// Logs:
// 4
// 3
// 2
// 1

// As you can see from the logs, the execution order is the opposite of the code order.
// This makes callback code hard to read. It gets even more confusing if you want to run
// the requests in parallel or bail when an error occurs.
// ES2015 introduced the concept of a Promise to break the pyramid of doom. A
// Promise represents something that will be available in the future (they’re also sometimes
// called “futures”). Here’s the same code using Promises:

const page1Promise = fetch(url1);
page1Promise.then((response1) => fetch(url2)).then((response2) => fetch(url3)).then((response3) => {
  // ...
}).catch((error) => {
  // ...
});

// Now there’s less nesting, and the execution order more directly matches the code
// order. It’s also easier to consolidate error handling and use higher-order tools like
// Promise.all.
// ES2017 introduced the async and await keywords to make things even simpler:

async function fetchPages() {
  const response1 = await fetch(url1);
  const response2 = await fetch(url2);
  const response3 = await fetch(url3);
  // ...
}

// The await keyword pauses execution of the fetchPages function until each Promise
// resolves. Within an async function, awaiting a Promise that throws an exception.
// This lets you use the usual try/catch machinery:

async function fetchPages() {
  try {
    const response1 = await fetch(url1);
    const response2 = await fetch(url2);
    const response3 = await fetch(url3);
    // ...
  } catch (e) {
    // ...
  }
}

// When you target ES5 or earlier, the TypeScript compiler will perform some elaborate
// transformations to make async and await work. In other words, whatever your runtime,
// with TypeScript you can use async/await.
// There are a few good reasons to prefer Promises or async/await to callbacks:
// • Promises are easier to compose than callbacks.
// • Types are able to flow through Promises more easily than callbacks.
// If you want to fetch the pages in parallel, for example, you can compose Promises
// with Promise.all:

async function fetchPages() {
  const [response1, response2, response3] = await Promise.all([
    fetch(url1), fetch(url2), fetch(url3)
  ]);
  // ...
}

// Using destructuring assignment with await is particularly nice in this context.
// TypeScript is able to infer the types of each of the three response variables as
// Response. The equivalent code to do the requests in parallel with callbacks requires
// more machinery and a type annotation:

function fetchPagesCB() {
  let numDone = 0;
  const responses: string[] = [];
  const done = () => {
    const [response1, response2, response3] = responses;
    // ...
  };
  const urls = [url1, url2, url3];
  urls.forEach((url, i) => {
    fetchURL(url, r => {
      responses[i] = url;
      numDone++;
      if (numDone === urls.length) done();
    });
  });
}

// Extending this to include error handling or to be as generic as Promise.all is
// challenging.
// Type inference also works well with Promise.race, which resolves when the first of
// its input Promises resolves. You can use this to add timeouts to Promises in a general
// way:

function timeout(millis: number): Promise<never> {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject('timeout'), millis);
  });
}

async function fetchWithTimeout(url: string, ms: number) {
  return Promise.race([fetch(url), timeout(ms)]);
}


// The return type of fetchWithTimeout is inferred as Promise<Response>, no type
// annotations required. It’s interesting to dig into why this works: the return type of

// Promise.race is the union of the types of its inputs, in this case Promise<Response |
// never>. But taking a union with never (the empty set) is a no-op, so this gets simplified
// to Promise<Response>. When you work with Promises, all of TypeScript’s type
// inference machinery works to get you the right types.

// There are some times when you need to use raw Promises, notably when you are
// wrapping a callback API like setTimeout. But if you have a choice, you should generally
// prefer async/await to raw Promises for two reasons:

// • It typically produces more concise and straightforward code.

// • It enforces that async functions always return Promises.

// An async function always returns a Promise, even if it doesn’t involve awaiting anything.
// TypeScript can help you build an intuition for this:
// function getNumber(): Promise<number>

async function getNumber() {
  return 42;
}

// You can also create async arrow functions:

const getNumber = async () => 42; // Type is () => Promise<number>

The raw Promise equivalent is:

const getNumber = () => Promise.resolve(42); // Type is () => Promise<number>
// While it may seem odd to return a Promise for an immediately available value, this
// actually helps enforce an important rule: a function should either always be run synchronously
// or always be run asynchronously. It should never mix the two. For example,
// what if you want to add a cache to the fetchURL function? Here’s an attempt:
// Don't do this!

const _cache: { [url: string]: string } = {};

function fetchWithCache(url: string, callback: (text: string) => void) {
  if (url in _cache) {
    callback(_cache[url]);
  } else {
    fetchURL(url, text => {
      _cache[url] = text;
      callback(text);
    });
  }
}

// While this may seem like an optimization, the function is now extremely difficult for
// a client to use:

let requestStatus: 'loading' | 'success' | 'error';
function getUser(userId: string) {
  fetchWithCache(`/user/${userId}`, profile => {
    requestStatus = 'success';
  });
  requestStatus = 'loading';
}

// What will the value of requestStatus be after calling getUser? It depends entirely on
// whether the profile is cached. If it’s not, requestStatus will be set to “success.” If it is,
// it’ll get set to “success” and then set back to “loading.” Oops!
// Using async for both functions enforces consistent behavior:

const _cache: { [url: string]: string } = {};
async function fetchWithCache(url: string) {
  if (url in _cache) {
    return _cache[url];
  }
  const response = await fetch(url);
  const text = await response.text();
  _cache[url] = text;
  return text;
}

let requestStatus: 'loading' | 'success' | 'error';

async function getUser(userId: string) {
  requestStatus = 'loading';
  const profile = await fetchWithCache(`/user/${userId}`);
  requestStatus = 'success';
}

// Now it’s completely transparent that requestStatus will end in “success.” It’s easy to
// accidentally produce half-synchronous code with callbacks or raw Promises, but difficult
// with async.
// Note that if you return a Promise from an async function, it will not get wrapped in
// another Promise: the return type will be Promise<T> rather than
// Promise<Promise<T>>. Again, TypeScript will help you build an intuition for this:
// Function getJSON(url: string): Promise<any>

async function getJSON(url: string) {
  const response = await fetch(url);
  const jsonPromise = response.json(); // Type is Promise<any>
  return jsonPromise;
}

// Things to Remember

// • Prefer Promises to callbacks for better composability and type flow.

// • Prefer async and await to raw Promises when possible. They produce more concise,
// straightforward code and eliminate whole classes of errors.

// • If a function returns a Promise, declare it async.