# Design draft and exploration for the **data-pipes** schema language

This repo contains a design draft and some exploratory code to discuss the schema language in use in the [data-pipes](https://github.com/olange/data-pipes) project.

## Objective
We want to offer consumer's of *data-nuggets* the capacity to introspect their data.
To achieve this goal, we propose to associate a type schema to each *data-nugget* construct.

## A new format?

Although schemas provide powerful introspection capabilities for code manipulation, they are often pretty gruesome to handle for the user. We want to avoid this as much as possible. Our schema system should therefore offer its users an expressive and easy to manipulate representation.

To achieve this, we propose to develop a custom literal schema representation highly inspired by the GraphQL schema definition language.

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

In this first exploration, we provide a very basic Type system.  
It is incomplete and only supports concrete types.

In other words, we support the following primitive *scalar* types: integer, float, string (TODO: precise numeric constraints and complete primitive type support).  
We support two *composite* types: Object (Immutable.Map) and List<T> (Immutable).   

Note that we assume the composite types to be immutable.js data structures.  
Not also that we do not, yet, support nullable types.  

## literal representation

The literal representation is mainly for human consumption: it is also available as a serialization format. 
As noted previously, this representation should be as expressive and human-friendly as possible. 
We are in this regard heavily inspired by the GraphQL schema definition language.

Before producing a formal definition, we propose a heuristic approach via some simple code exploration.

Here is a simple example:
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

## structural representation (syntax tree)

The structural representation is a javascript object tree (based on Immutable.js Records).
The following snippet illustrates how we could hand-build the syntax tree for the previously defined schema:

```javascript
let PersonType = Type.ObjectType("Person", {name:Type.StringType,
                                            age:Type.IntegerType,
                                            counts:Type.ListType(Type.IntegerType)});
let RootType = Type.ObjectType("Root", {people:Type.ListType(PersonType)});

```

If we inspect the root of this schema, *RootType*, we obtain the following structure.

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

## code exploration

this repo contains a first exploration of this proposal in the form of a set of node.js files.
- *type.js* contains a set of Records to represent a type syntax tree
- *schemaInferal.js* contains a function to generate a best guess syntax tree from a value
- *typeInferal.js* is a dependency of schemaInferal
- *generator.js* contains a function which given a syntax tree generate a literal representation
- *example.js* contains some code illustrating schema inferal, handmade syntax tree building, literal generation