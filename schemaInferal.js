const Immutable  = require('immutable');
const pp = require("pretty-immutable");
const Type = require('./type');
const inferType = require('./typeInferal');

function* anonymousTypeMaker() {
  var index = 0;
  while(true)
    yield `Anonymous_${index++}`;
}

// infers schema from valid value (js scalar, Map or List)
// breadth first traversal
function inferSchema(value){
  
  let rootType = Type.ObjectType("Root");

  const anonymousTypeGen= anonymousTypeMaker();

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
      let path = descriptor.path.concat("ofType");
      // examine type of first item in list
      queue.push({path:path, value: descriptor.value.get(0)});
    }

    if(type.name === "ObjectType"){
      // console.log("set an object in", descriptor.path);
      const typeName = anonymousTypeGen.next().value;
      rootType = rootType.setIn(descriptor.path, type(typeName));
      let path = descriptor.path.concat("fields");
      let entries = descriptor.value.entries();
      // enumerate fields of Map
      for([fieldName, val] of entries){
        queue.push({path:path.concat(fieldName), value: val});
      } 
    }
  }

  return rootType;
}

module.exports = inferSchema;