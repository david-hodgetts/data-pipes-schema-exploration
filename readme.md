# data-pipes/schema proposal

## Objective
We want to offer consumer's of *data-nuggets* the capacity to introspect their data.
To achieve this goal, we propose to associate a type schema to each *data-nugget* construct.

## A new format?

Although schemas provide powerful introspection capabilities for code manipulation, they are often pretty gruesome to handle for the user. We don't want this to be the case. Therefore our schema system should offer its users the most expressive possible literal representation.

We propose to develop a custom literal schema representation highly inspired by the GraphQL schema definition language.

## Immutability

We propose to extend the immutability principle of data-nuggets, to the schema. In this first iteration, this means that the syntax tree associated to the schema property will be a *Record* based tree.

## Basic functionalities

Our schema system should offer the following functionalities:

- it offers both a literal and a structural representation.
- it offers a parsing mechanism which translates literal representations to structural representations.
- it offers a generation mechanism to produce literal representations from structural representations.
- it offers simple schema inference. (Given a value return a best guess schema).

We should also keep in mind other potential uses (validation, etc.)

## Type system

For this first iteration, we provide a very basic Type system.
We support the following primitive *scalar* types: integer, float, string (TODO: precise numeric constraints).
We also support two *composite* types: Object (Immutable.Map) and List<T> (Immutable). 
Note that we assume the composite types to be immutable.js data structures.
We do not, yet, support nullable types.
The type system remains very basic in the sense that it only represents concrete types.

## literal representation

The literal representation is mainly for human consumption: it is also available as a serialization format. 
As noted previously, this representation should be as expressive and human-friendly as possible. 
We are in this regard heavily inspired by the GraphQL schema definition language.


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

Note that by convention each schema defines a Root objectType. This is the entry point for the schema.

## structural representation

The structural representation is a javascript object tree. It represents the schema's syntax tree. 
The following snippet illustrates how we could hand-build the syntax tree for the previously defined schema:

```javascript
let PersonType = Type.ObjectType("Person", {name:Type.StringType,
                                            age:Type.IntegerType,
                                            counts:Type.ListType(Type.IntegerType)});
let RootType = Type.ObjectType("Root", {people:Type.ListType(PersonType)});

```

If we examine the root of the schema *RootType*, we obtain the following structure.

```json
// pretty printed RootType 
{
  "name": "Root",
  "kind": "OBJECT",
  "fields": {
    "people": {
      "kind": "LIST",
      "ofType": {
        "name": "Person",
        "kind": "OBJECT",
        "fields": {
          "name": {"name": "String", "kind": "SCALAR"},
          "age": {"name": "Integer", "kind": "SCALAR"},
          "counts": {
            "kind": "LIST",
            "ofType": {"name": "Integer", "kind": "SCALAR"}
          }
        }
      }
    }
  }
}
```