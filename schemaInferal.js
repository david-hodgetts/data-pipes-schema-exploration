const Immutable  = require('immutable');
const pp = require("pretty-immutable");
const Type = require('./type');
const inferType = require('./typeInferal');

function* anonymousTypeNameGenerator() {
  var index = 0;
  while(true)
    yield `Anonymous_${index++}`;
}

// infers schema from value (js primitive scalar, Map or List)
// returns syntax tree if successful
// implements a simple breadth first traversal (no cycle testing!!)
// TODO: error handling 
function inferSchema(value){
  
  // we have no way of infering type names for objects
  // therefore we simply assign an incremental identifier to each new object we find
  const anonymousTypeName = anonymousTypeNameGenerator();

  // entry point of schema
  let rootType = Type.ObjectType("Root");

  const queue = [];
  queue.push({path: ["fields", "root"], value:value});

  while(queue.length > 0){
    let descriptor = queue.pop();

    // console.log("path", descriptor.path, "value", pp(value));
    
    let type = inferType(descriptor.value);

    if(type.kind === "SCALAR"){
      // console.log("set in", descriptor.path);
      rootType = rootType.setIn(descriptor.path, type);
      continue; 
    }

    if(type.name === "ListType"){
      // console.log("set a list in", descriptor.path);
      rootType = rootType.setIn(descriptor.path, type());
      const path = descriptor.path.concat("ofType");
      // examine type of first item in list
      queue.push({path:path, value: descriptor.value.get(0)});
    }

    if(type.name === "ObjectType"){
      // console.log("set an object in", descriptor.path);
      const typeName = anonymousTypeName.next().value;
      rootType = rootType.setIn(descriptor.path, type(typeName));
      const path = descriptor.path.concat("fields");
      const entries = descriptor.value.entries();
      // enumerate fields of Map
      for([fieldName, val] of entries){
        queue.push({path:path.concat(fieldName), value: val});
      } 
    }
  }

  return rootType;
}

module.exports = inferSchema;