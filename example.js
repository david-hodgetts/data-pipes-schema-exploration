const Immutable  = require('immutable');
const pp = require("pretty-immutable");
const Type = require('./type');
const inferSchema = require('./schemaInferal');

// build a value to infer schema from
const value = Immutable.List([Immutable.Map({counts:Immutable.List([1, 2, 3]), name:"Mario", age:300})]);
const inferredSchema = inferSchema(value);

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
console.log(pp(handmadeSchema));

console.log("inferred schema equals handmade schema?", handmadeSchema.equals(inferredSchema));
