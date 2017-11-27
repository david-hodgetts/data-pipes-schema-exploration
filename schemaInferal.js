Immutable  = require('immutable');
pp = require("pretty-immutable");

Type = require('./type');
inferType = require('./typeInferal');


// infers schema from valid value (js scalar, Map or List)
// breadth first traversal
function inferSchema(value){
  
  let rootType = Type.ObjectType("Root");

  const queue = [];
  // TODO remove parentType
  queue.push({path: ["fields", "root"], value:value});

  while(queue.length > 0){
    let descriptor = queue.pop();

    console.log("path", descriptor.path, "value", pp(value));
    
    let type = inferType(descriptor.value);

    if(type.kind === "SCALAR"){
      // console.log("set in", descriptor.path);
      rootType = rootType.setIn(descriptor.path, type);
      continue; 
    }

    if(type.name === "ListType"){
      // console.log("set a list in", descriptor.path);
      rootType = rootType.setIn(descriptor.path, type());
      let path = descriptor.path.concat("ofType");
      queue.push({path:path, value: descriptor.value.get(0)});
    }

    if(type.name === "ObjectType"){
      // console.log("set an object in", descriptor.path);
      rootType = rootType.setIn(descriptor.path, type());
      let path = descriptor.path.concat("fields");
      let entries = descriptor.value.entries();
      for([fieldName, val] of entries){
        queue.push({path:path.concat(fieldName), value: val});
      } 
    }
  }

  return rootType;
}

let value = Immutable.List([Immutable.Map({counts:Immutable.List([1, 2, 3]), name:"Mario", age:300})]);
let schema = inferSchema(value);
console.log(pp(schema));


let fields = Immutable.Map({
  root: Type.ListType(Type.ObjectType("", Immutable.Map({
    name: Type.StringType,
    counts: Type.ListType(Type.IntegerType),
    age: Type.IntegerType
  })))
});

let schema2 = Type.ObjectType("Root", fields);
console.log(pp(schema2));

console.log(schema2.equals(schema));

`
{
  type Root
  {
    root:[Anonymous]
  }
  type Anonymous
  {
    foo:[Integer]
    bar:String
  }
`

