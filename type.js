const Immutable = require('immutable');
const pp = require("pretty-immutable");

// for leaf values
const ScalarType = Immutable.Record({ name:"", kind: "SCALAR", });

// does not support cyclical reference !
// check out thunks in graphql/type/definition.js
const ObjectType = Immutable.Record({ name:"", kind: "OBJECT", fields:Immutable.Map() });
const ListType = Immutable.Record({ kind: "LIST", ofType:null });

const Type = {
  ScalarType: (name) => new ScalarType({name:name}),
  StringType: new ScalarType({name:"String"}),
  IntegerType: new ScalarType({name:"Integer"}),
  FloatType: new ScalarType({name:"Double"}),

  ObjectType: (name, fields=Immutable.Map()) => new ObjectType({name:name, fields:fields}),
  ListType: (type) => new ListType({ofType:type}),
};

module.exports = Type;

// personFields = {
//   name: Type.StringType,
//   age: Type.IntegerType,
// };
// PersonType = Type.ObjectType("Person", Immutable.Map(personFields));

// schema = Type.ObjectType("Root", Immutable.Map({people: Type.ListType(PersonType)}));

// console.log(pp(schema));