const Immutable  = require('immutable');
const pp = require("pretty-immutable");
const inferType = require('./typeInferal');
const graphqlTools = require('graphql-tools');

function* anonymousTypeNameGenerator() {
  var index = 0;
  while(true)
    yield `Anonymous_${index++}`;
}

// infers schema from value (js primitive scalar, Map or List)
function inferSchema(value){
  
  // to conform to the graphql format, we expect value to be an object type
  // it will map to the high-jacked Query type

  if(!Immutable.Map.isMap(value)){
    throw new SyntaxError("expected value to be an object type");
  }

  // we have no way of infering type names for objects
  // therefore we simply assign an incremental identifier to each new object we find
  const anonymousTypeName = anonymousTypeNameGenerator();

  // entry point of schema

  let typeMap = {};

  const queue = [];
  queue.push({objectTypeName:'Query', belongsToList:null, value:value });

  while(queue.length > 0){
    let next = queue.pop();
    let objectTypeName = next.objectTypeName;
    let belongsToList = next.belongsToList;
    let value = next.value; 
    
    console.log("objectTypeName", objectTypeName,"value", value, "belongsToList", belongsToList);
    const type = inferType(value);

    console.log("type", type);

    if(type === 'Object'){
      let typeName = objectTypeName || anonymousTypeName.next().value;
      console.log(typeName, typeName in typeMap);
      if(!(typeName in typeMap)){
        console.log("add to typeMap ", typeName);
        typeMap[typeName] = {typeName:typeName, fields:{}, kind:'OBJECT'};
      }

      if(belongsToList){
        console.log("define a list of object type")
        belongsToList.ofType = typeName;
      }
      // handle fields
      for([fieldName, fieldVal] of value.entries()){
        const fieldType = inferType(fieldVal);
        console.log("enumerate field", fieldName, fieldVal, fieldType);
        if(fieldType === 'Object'){
          let fieldObjectTypeName = anonymousTypeName.next().value;
          let fieldTypeObj = {typeName:fieldObjectTypeName};
          typeMap[typeName].fields[fieldName] = fieldTypeObj;
          queue.push({objectTypeName:fieldObjectTypeName, belongsToList: null, value: fieldVal});
          console.log("push", fieldObjectTypeName, null, fieldVal);
        }else if(fieldType === 'List'){
          let listTypeObj = {typeName:"", ofType:null};
          typeMap[typeName].fields[fieldName] = listTypeObj;
          queue.push({objectTypeName:null, belongsToList: listTypeObj, value: fieldVal.get(0)});
          console.log("push");
          console.dir(queue[queue.length -1]);
        }else{
          // scalar
          let fieldTypeObj = {typeName:fieldType};
          typeMap[typeName].fields[fieldName] = fieldTypeObj;
        }
      }
    }else if (type === "List"){
      if(belongsToList){
        console.log("we are list in list");
        let listTypeObj = {typeName:"", ofType:null};
        belongsToList.ofType = listTypeObj;
        queue.push({objectTypeName:null, belongsToList: listTypeObj, value: value.get(0)});
      }
    }else{
      // scalar, check if we be
      if(belongsToList){
        belongsToList.ofType = type;
      }
    }
  }
  return typeMap;
}

console.log(pp(inferSchema(Immutable.Map({name:"foo", 
                                          age:Immutable.fromJS([[42]]), 
                                          friend:Immutable.Map({name:'bob',
                                                                accounts:Immutable.fromJS([{id:42}])})}))));
module.exports = inferSchema;