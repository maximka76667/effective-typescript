// Item 26: Understand How Context Is Used in Type Inference

type Language = "JavaScript" | "TypeScript" | "Python";
function setLanguage(language: Language) { /* ... */ }

setLanguage("JavaScript");

let language = "Python";
language = "TypeScript";
setLanguage(language);
// Argument of type 'string' is not assignable to parameter of type 'Language'.
