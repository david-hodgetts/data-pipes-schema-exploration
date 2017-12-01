const Immutable  = require('immutable');
const pp = require("pretty-immutable");
const Type = require('./lib/type');
const inferSchema = require('./lib/schemaInferal');
const generateLiteral = require('./lib/generator');
const parseLiteral = require('./lib/parser');

// build a value to infer schema from
const value = Immutable.List([Immutable.Map({counts:Immutable.List([1, 2, 3]), name:"Mario", age:300})]);
const inferredSchema = inferSchema(value);

console.log("inferred schema:");
console.log(pp(inferredSchema));

// build the schema for the same value by hand
const fields = Immutable.Map({
  root: Type.ListType(Type.ObjectType("Anonymous_0", Immutable.Map({
    name: Type.StringType,
    counts: Type.ListType(Type.IntegerType),
    age: Type.IntegerType
  })))
});

const handmadeSchema = Type.ObjectType("Root", fields);
console.log("\nhandmade schema:");
console.log(pp(handmadeSchema));

console.log("\ninferred schema equals handmade schema?", handmadeSchema.equals(inferredSchema));

// lets generate a literal representation
console.log("\nliteral representation generated from inferredSchema:");
const literal = generateLiteral(inferredSchema);
console.log(literal);

const parsedSchema = parseLiteral(literal);
console.log("schema parsed from literal:");
console.log(pp(parsedSchema));
console.log("\nparsed schema equals handmade schema?", handmadeSchema.equals(parsedSchema));
