Immutable  = require('immutable');
pp = require("pretty-immutable");

// schemaTree -> Map of types (key:type_name, value type)
function flattenSchema(schema){
  let result = Immutable.Map();

  let queue = [schema];
  while(queue.length > 0){
    type = queue.pop();
    
    if(type.kind === "OBJECT"){
      // add type if we don't know of it
      if(!result.has(type.name)) result = result.set(type.name, type);
      // add type of fields to queue
      for([_, fieldType] of type.fields.entries()){
        queue.push(fieldType);
      }
    }

    if(type.kind === "LIST"){
      //skip list 
      // we want the typeOf
      listType = type.get('ofType');
      if(!result.has(listType.name)) result = result.set(listType.name, listType);
      queue.push(listType);
    }

    if(type.kind === "SCALAR"){
      // add type if we don't know of it
      if(!result.has(type.name)) result = result.set(type.name, type);
    }
  }
  return result;
}


// given a syntax tree return a literal representation  
function generateLiteral(schema){
  const typeMap = flattenSchema(schema);

  let result = "";

  for([typeName, type] of typeMap.entries()){
    if(type.kind === 'OBJECT'){
      result += `type ${typeName} {\n`;
      for([fieldName, fieldType] of type.fields.entries()){
        let fieldTypeName = fieldType.kind === 'LIST' ? `[${fieldType.ofType.name}]` : fieldType.name;
        result += `  ${fieldName}: ${fieldTypeName}\n`;
      }
      result += '}\n\n';
    }
  }

  return result;
}

module.exports = generateLiteral;