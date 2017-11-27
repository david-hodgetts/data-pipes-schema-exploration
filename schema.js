Immutable  = require('immutable');
pp = require("pretty-immutable");


// TypeRefs 
TypeRef = Immutable.Record({kind:null, name:null, ofType:null});

stringTypeRef = () => new TypeRef({kind:"SCALAR", name:"String"});
recordTypeRef = () => new TypeRef({kind:"OBJECT", name:"Record"});
listOfRef = (listType) => new TypeRef({kind:"LIST", ofType: listType});


// field descriptors

Field = Immutable.Record({name:"", description:"", type:null});

stringField = (name) => new Field({name:name, type:stringTypeRef()});
listField = (name, listTypeRef) => new Field({name:name, type:listOfRef(listTypeRef)});


// types

Type = Immutable.Record( {kind:null, name:"", description:"", fields:null} )

recordType = () => new Type({ kind:'OBJECT', name:'Record', fields:Immutable.List() });
rootType = (fields) => new Type({ kind:'OBJECT', name: 'Root', fields:fields });
stringType = () => new Type({ kind:"SCALAR", name:"String" });


fields = new Immutable.List([listField('recordSet', stringTypeRef())]);
myRoot = rootType(fields);
