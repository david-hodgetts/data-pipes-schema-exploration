Immutable  = require('immutable');
pp = require("pretty-immutable");

Type = require('./type');

// isInteger polyfill
// https://stackoverflow.com/questions/3885817/how-do-i-check-that-a-number-is-float-or-integer
if (!Number.isInteger) {
  Number.isInteger = function isInteger (nVal) {
    return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
  };
}

function isFloat(n){
  return Number(n) === n && n % 1 !== 0;
}

const TypeTests = [
  {
    type:Type.IntegerType,
    test: Number.isInteger,
  },
  {
    type:Type.FloatType,
    test: isFloat,
  },
  {
    type:Type.StringType,
    test: (v) => typeof v === 'string',
  },
  {
    type:Type.ObjectType,
    test: Immutable.Map.isMap,
  },
  {
    type:Type.ListType,
    test: Immutable.List.isList,
  },
];

function inferType(value){
  for(let i = 0; i < TypeTests.length; i++){
    const maybeType = TypeTests[i].test(value);
    if(maybeType) return TypeTests[i].type;
  }
  return null;
}

module.exports = inferType;

