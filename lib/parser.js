const Immutable = require('immutable');
const pp = require("pretty-immutable");
const pegjs = require("pegjs");
const Type = require('./type');
const util = require('util');

const grammar = require('fs').readFileSync(__dirname + '/grammar.pegjs', 'utf-8');
const parser = pegjs.generate(grammar);


//// quick and dirty parser for literal representations
//   does not support cycles
//   ie. will choke on 
//   type Person{
//     name:String
//       friend:Person
//    }

function parse(literal){
  let types = parser.parse(literal);

  // to map of types

  mapOfTypes = types.reduce((result, aType) => {
    let fields = aType.fields.reduce((res, field) => {
      let fieldInfo = {};
      // handle List case
      if(field.fieldType.ofType != null){
        fieldInfo = {name:"", ofType:field.fieldType.ofType}
      }else{
        fieldInfo = {name: field.fieldType}
      }
      res[field.fieldName] = fieldInfo;
      return res;
    },{});
    // console.log("building type", aType.name, "with fields", fields);
    result[aType.name] = {name:aType.name, fields:fields};
    return result;
  }, {});

  return buildTree(mapOfTypes).get('Root');
}

function isValidScalar(typeName){
  return ['String', 'Integer', 'Float'].indexOf(typeName) != -1;
}

function typeFromFieldInfo(typeInfo){
  const typeName = typeInfo.name; 
  if(isValidScalar(typeName)){
    return {name:typeName, kind:"SCALAR"};
  }

  if('ofType' in typeInfo){
    return {name:"", kind:"LIST", ofType:typeInfo.ofType};
  }

  return {name:typeName, kind:"OBJECT"};
}

function scalarFromName(name){
  switch(name){
    case 'String':
      return Type.StringType;
    case 'Integer':
      return Type.IntegerType;
    case 'Float':
      return Type.FloatType;
  }
  throw new SyntaxError('invalid SCALAR type', name);
}


function buildTree(mapOfTypeInfos){
  // check presence of Root
  if(!'Root' in mapOfTypeInfos){
    throw new SyntaxError("schema has no root type");
  }

  let mapOfTypes = {};
  
  for(const typeName in mapOfTypeInfos){
    const typeInfo = mapOfTypeInfos[typeName];
    let fields = {};
    for(const fieldName in typeInfo.fields){
      const fieldInfo = typeInfo.fields[fieldName];
      fields[fieldName] = typeFromFieldInfo(fieldInfo);
    } 
    mapOfTypes[typeName] = {name:typeName, kind:"OBJECT", fields: fields }; 
  }
  
  // to immutable
  let fullyDefinedTypes = Immutable.Map();

  while(fullyDefinedTypes.size != Object.keys(mapOfTypes).length){
    for (const typeName in mapOfTypes) {
      const fieldInfos = mapOfTypes[typeName].fields;
      let fields = Immutable.Map();

      for (const fieldName in fieldInfos) {
        const fieldTypeInfo = fieldInfos[fieldName];
        let fieldType = null;
        if (fieldTypeInfo.kind === "SCALAR") {
          fieldType = scalarFromName(fieldTypeInfo.name);
        }
        if (fieldTypeInfo.kind === "LIST" && isValidScalar(fieldTypeInfo.ofType)) {
          fieldType = Type.ListType(scalarFromName(fieldTypeInfo.ofType));
        }
        if (fieldTypeInfo.kind === "LIST" && fullyDefinedTypes.has(fieldTypeInfo.ofType)) {
          fieldType = Type.ListType(fullyDefinedTypes.get(fieldTypeInfo.ofType));
        }
        if (fieldTypeInfo.kind === "OBJECT" && fullyDefinedTypes.has(fieldTypeInfo.name)) {
          fieldType = fullyDefinedTypes.get(fieldTypeInfo.name);
        }
        fields = fields.set(fieldName, fieldType);
      }
      const type = Type.ObjectType(typeName, fields);
      if (type.fields.every(f => f !== null)) {
        // we have complete type
        if (!fullyDefinedTypes.has(typeName)) {
          fullyDefinedTypes = fullyDefinedTypes.set(typeName, type);
        }
      }
    }
  }

  return fullyDefinedTypes;
}

module.exports = parse;