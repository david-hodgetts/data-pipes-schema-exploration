const Immutable  = require('immutable');
const pp = require("pretty-immutable");
const inferType = require('./typeInferal');
const graphqlTools = require('graphql-tools');

function* anonymousTypeNameGenerator() {
  var index = 0;
  while(true)
    yield `AnonymousType_${index++}`;
}

function reduceFieldValue(field){
  if(typeof field.ofType === 'object'){
    // list of list case
    return `[${reduceFieldValue(field.ofType)}]`;
  } else if (typeof field.ofType === 'string'){
    // list of T case
    return `[${field.ofType}]`;
  } else{
    // just T
    return field.typeName;
  }
}

// given a type map return the literal representation in the form of the
// graphql schema description language
function printTypeMap(typeMap){
  const typeNames = Object.keys(typeMap);
  let result = ""
  for(typeName of typeNames){
    result += `type ${typeName} {\n`;
    const fieldMap = typeMap[typeName].fields; 
    const fieldNames = Object.keys(fieldMap);
    for(fieldName of fieldNames){
      const fieldValue = fieldMap[fieldName];
      result += `\t${fieldName}: ${reduceFieldValue(fieldValue)}\n`;
    }
    result += '}\n\n'; 
  }
  return result;
}

// infers schema from value (js primitive scalar, Map or List)
function inferSchema(value){
  
  // to conform to the graphql format, we expect value to be an object type
  // we map it to the graphql entry point of type Query

  if(!Immutable.Map.isMap(value)){
    throw new SyntaxError("expected value to be an object type");
  }

  // we have no way of infering type names for objects
  // therefore we simply assign an incremental identifier to each new object we find
  const anonymousTypeName = anonymousTypeNameGenerator();

  // intermediary representation
  let typeMap = {};
  const queue = [];
  queue.push({objectTypeName:'Query', belongsToList:null, value:value });

  while(queue.length > 0){
    let next = queue.pop();
    let objectTypeName = next.objectTypeName;
    let belongsToList = next.belongsToList;
    let value = next.value; 
    
    const type = inferType(value);

    if(type === 'Object'){
      let typeName = objectTypeName || anonymousTypeName.next().value;
      if(!(typeName in typeMap)){
        typeMap[typeName] = {typeName:typeName, fields:{}, kind:'OBJECT'};
      }

      if(belongsToList){
        belongsToList.ofType = typeName;
      }
      // handle fields
      for([fieldName, fieldVal] of value.entries()){
        const fieldType = inferType(fieldVal);
        if(fieldType === 'Object'){
          let fieldObjectTypeName = anonymousTypeName.next().value;
          let fieldTypeObj = {typeName:fieldObjectTypeName};
          typeMap[typeName].fields[fieldName] = fieldTypeObj;
          queue.push({objectTypeName:fieldObjectTypeName, belongsToList: null, value: fieldVal});
        }else if(fieldType === 'List'){
          let listTypeObj = {typeName:"", ofType:null};
          typeMap[typeName].fields[fieldName] = listTypeObj;
          queue.push({objectTypeName:null, belongsToList: listTypeObj, value: fieldVal.get(0)});
        }else{
          // scalar
          let fieldTypeObj = {typeName:fieldType};
          typeMap[typeName].fields[fieldName] = fieldTypeObj;
        }
      }
    }else if (type === "List"){
      if(belongsToList){
        let listTypeObj = {typeName:"", ofType:null};
        belongsToList.ofType = listTypeObj;
        queue.push({objectTypeName:null, belongsToList: listTypeObj, value: value.get(0)});
      }
    }else{
      // scalar, check if we belong to a list
      if(belongsToList){
        belongsToList.ofType = type;
      }
    }
  }
  const typeDefs = printTypeMap(typeMap);
  return {
    typeDefs: typeDefs,
    structural: graphqlTools.buildSchemaFromTypeDefinitions(typeDefs),
  }
}

const schema = inferSchema(Immutable.Map({name:"foo", 
                                          age:Immutable.fromJS([[42.3]]), 
                                          friend:Immutable.Map({name:'bob',
                                                                accounts:Immutable.fromJS([{id:42}])})}));

console.dir(schema);
module.exports = inferSchema;