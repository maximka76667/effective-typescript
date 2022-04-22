// Item 27: Use Functional Constructs and Libraries to Help Types Flow

import _ from "lodash";

const csvData = "...";
const rawRows = csvData.split("\n");
const headers = rawRows[0].split(",");

const rows = rawRows.slice(1).map((rowStr) => {
  const row = {};
  rowStr.split(",").forEach((val, j) => {
    row[headers[j]] = val;
  });
  return row;
});

// More functionally minded JavaScripters might prefer to build the row objects with
// reduce:

const rows = rawRows.slice(1)
  .map((rowStr) => rowStr.split(",").reduce(
    (row, val, i) => (row[headers[i]] = val, row),
    {},
  ));

const rows = rawRows.slice(1)
  .map((rowStr) => _.zipObject(headers, rowStr.split(",")));

// I find this the clearest of all. But is it worth the cost of adding a dependency on a
// third-party library to your project? If you’re not using a bundler and the overhead of
// doing this is significant, then the answer may be “no.”

// Both vanilla JS versions of the CSV parser produce the same error in TypeScript:

const rows = rawRows.slice(1).map((rowStr) => {
  const row = {};
  rowStr.split(",").forEach((val, j) => {
    row[headers[j]] = val;
  });
  return row;
});

// The solution in each case is to provide a type annotation for {}, either {[column:
// string]: string} or Record<string, string>.

const rows = rawRows.slice(1).map((rowStr) => {
  const row: { [column: string]: string } = {};
  rowStr.split(",").forEach((val, j) => {
    row[headers[j]] = val;
  });
  return row;
});

const rows = rawRows.slice(1).map((rowStr) => {
  const row: Record<string, string> = {};
  rowStr.split(",").forEach((val, j) => {
    row[headers[j]] = val;
  });
  return row;
});

// The Lodash version, on the other hand, passes the type checker without modification:
const rows = rawRows.slice(1)
  .map((rowStr) => _.zipObject(headers, rowStr.split(",")));
// Type is _.Dictionary<string>[]

// Dictionary is a Lodash type alias. Dictionary<string> is the same as {[key:
// string]: string} or Record<string, string>. The important thing here is that the
// type of rows is exactly correct, no type annotations needed.

// These advantages get more pronounced as your data munging gets more elaborate.
// For example, suppose you have a list of the rosters for all the NBA teams:

interface BasketballPlayer {
  name: string,
  team: string,
  salary: number,
}

declare const rosters: { [team: string]: BasketballPlayer };

// To build a flat list using a loop, you might use concat with an array. This code runs
// fine but does not type check:

let allPlayers = [];
// Variable 'allPlayers' implicitly has type 'any[]' in some locations where
// its type cannot be determined.

for (const team of Object.values(rosters)) {
  allPlayers = allPlayers.concat(team);
}

// To fix the error you need to add a type annotation to allPlayers:

let allPlayers: BasketballPlayer[] = [];

for (const team of Object.values(rosters)) {
  allPlayers = allPlayers.concat(team);
}

// But a better solution is to use Array.prototype.flat:

const allPlayers = Object.values(rosters).flat();

// Say you want to start with allPlayers and make a list of the highest-paid players on
// each team ordered by salary.

const teamToPlayers: Record<string, BasketballPlayer[]> = {};
for (const player of allPlayers) {
  const { team } = player;
  teamToPlayers[team] = teamToPlayers[team] || [];
  teamToPlayers[team].push(player);
}

for (const players of Object.values(teamToPlayers)) {
  players.sort((a, b) => b.salary - a.salary);
}

const bestPaid = Object.values(teamToPlayers).map((players) => players[0]);
bestPaid.sort((playerA, playerB) => playerB.salary - playerA.salary);
console.log(bestPaid);

// Here’s the output:
// [
//  { team: 'GSW', salary: 37457154, name: 'Stephen Curry' },
//  { team: 'HOU', salary: 35654150, name: 'Chris Paul' },
//  { team: 'LAL', salary: 35654150, name: 'LeBron James' },
//  { team: 'OKC', salary: 35654150, name: 'Russell Westbrook' },
//  { team: 'DET', salary: 32088932, name: 'Blake Griffin' },
//  ...
// ]

// Here’s the equivalent with Lodash:

const bestPaid = _(allPlayers)
  .groupBy((player) => player.team)
  .mapValues((players) => _.maxBy(players, (p) => p.salary)!)
  .values()
  .sortBy((p) => -p.salary)
  .value(); // Type is BasketballPlayer[]

//   In addition to being half the length, this code is clearer and requires only a single
// non-null assertion (the type checker doesn’t know that the players array passed to
// _.maxBy is non-empty). It makes use of a “chain,” a concept in Lodash and Underscore
// that lets you write a sequence of operations in a more natural order. Instead of
// writing:

_.a(_.b(_.c(v)));

// you write:

_(v).a().b().c()
  .value();

// The _(v) “wraps” the value, and the .value() “unwraps” it.

// You can inspect each function call in the chain to see the type of the wrapped value.
// It’s always correct.

// Even some of the quirkier shorthands in Lodash can be modeled accurately in Type‐
// Script. For instance, why would you want to use _.map instead of the built-in

// Array.prototype.map? One reason is that instead of passing in a callback you can
// pass in the name of a property. These calls all produce the same result:

const namesA = allPlayers.map((player) => player.name); // Type is string[]

const namesB = _.map(allPlayers, (player) => player.name); // Type is string[]

const namesC = _.map(allPlayers, "name"); // Type is string[]

// It’s a testament to the sophistication of TypeScript’s type system that it can model a
// construct like this accurately, but it naturally falls out of the combination of string literal
// types and index types (see Item 14). If you’re used to C++ or Java, this sort of type
// inference can feel quite magical!

const salaries = _.map(allPlayers, "salary"); // Type is number[]

const teams = _.map(allPlayers, "team"); // Type is string[]

const mix = _.map(allPlayers, Math.random() < 0.5 ? "name" : "salary");

// Type is (string | number)[]
// It’s not a coincidence that types flow so well through built-in functional constructs
// and those in libraries like Lodash. By avoiding mutation and returning new values
// from every call, they are able to produce new types as well (Item 20). And to a large
// extent, the development of TypeScript has been driven by an attempt to accurately
// model the behavior of JavaScript libraries in the wild. Take advantage of all this work
// and use them!

// Things to Remember

// • Use built-in functional constructs and those in utility libraries like Lodash
// instead of hand-rolled constructs to improve type flow, increase legibility, and
// reduce the need for explicit type annotations.
