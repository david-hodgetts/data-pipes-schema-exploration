# data-pipes/schema proposal

A type schema accompanies each data-nugget, it helps the library user to develop a rich set of transformation components.

## Objective

Our schema system offers the following functionalities.

- literal and structural representations.
- parsing from literal representation to structural representation.
- generation of literal representation from structural representation.
- simple schema inference. Given a value return a best guess schema.

## literal representation

The literal representation is mainly for human consumption, and secondarily for serialization. 
This representation should therefore be as expressive and human-friendly as possible. 
We have been heavily inspired by the GraphQL type schema.

For this first iteration we support the following scalar type, integer, float, string (TODO: precise numeric constraints).
We also support two composite types: Object (Immutable.Map) and List<T> (Immutable). 
We only support immutable js data-structures (Map and List).
We do not yet support nullable types.

By convention each schema defines a Root objectType. This is the entry point for the schema.

```
type Root{
  people:[Person]
}

type Person{
  name:String,
  age:Integer,
  counts:[Integer]
}
```

## structural representation

The structural representation is a javascript object tree. It represents the schema's syntax tree. 

```javascript
let PersonType = Type.ObjectType("Person", {name:Type.StringType,
                                            age:Type.IntegerType,
                                            counts:Type.ListType(Type.IntegerType)});
let RootType = Type.ObjectType("Root", {people:Type.ListType(PersonType)});

```