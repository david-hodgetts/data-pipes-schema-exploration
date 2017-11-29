const Immutable = require('immutable');
const pp = require("pretty-immutable");

// factory for scalar values
const ScalarType = Immutable.Record({ name:"", kind: "SCALAR", });

// factory for composite values
// does not support cyclical reference !
// check out thunks in graphql/type/definition.js
const ObjectType = Immutable.Record({ name:"", kind: "OBJECT", fields:Immutable.Map() });
const ListType = Immutable.Record({ kind: "LIST", ofType:null });

// type namespace
const Type = {
  // helper fn to create a new named scalar type
  ScalarType: (name) => new ScalarType({name:name}),
  StringType: new ScalarType({name:"String"}),
  IntegerType: new ScalarType({name:"Integer"}),
  FloatType: new ScalarType({name:"Float"}),

  // helper fns to create composite types
  ObjectType: (name, fields=Immutable.Map()) => new ObjectType({name:name, fields:fields}),
  ListType: (type) => new ListType({ofType:type}),
};

module.exports = Type;