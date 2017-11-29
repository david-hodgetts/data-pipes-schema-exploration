# Design draft and code exploration for the *data-pipes* schema language

This repo contains a design draft and some exploratory code to discuss the schema language in use in the [data-pipes](https://github.com/olange/data-pipes) project.

## Objective
We want to offer consumer's of *data-nuggets* the capacity to introspect their data.
To achieve this goal, we propose to associate a type schema to each *data-nugget* construct.

## A new format?

Although schemas provide powerful introspection capabilities for code manipulation, they are often pretty gruesome to handle for the user. We want to avoid this as much as possible. Our schema system should therefore be expressive and easy to manipulate by its users.

To achieve this, we propose to develop a custom literal schema representation highly inspired by the GraphQL schema definition language.

## Immutability

We propose to extend the immutability principle of data-nuggets, to the schema. In this first iteration, this means that the syntax tree associated to the schema property will be an Immutable.js *Record* tree.

## Basic functionalities

Our schema system should provide, at the very least, the following functionalities:

- both a literal and a structural representation.
- a parsing mechanism which translates literal representations to structural representations.
- a generation mechanism to produce literal representations from structural representations.
- a simple schema inference mechanism. (Given a value return a best guess schema).

We should also keep in mind other potential uses (validation, etc.)

## Type system

In this first code exploration, we provide a very basic Type system.  
It is incomplete and only supports concrete types.

In other words, we support the following primitive *scalar* types: integer, float, string (TODO: define numeric type constraints and complete primitive type support).  
We support two *composite* types: Object and List<T>.   

Note that we assume the composite types to be immutable.js data structures (Map and List respectively).  
Note also that we do not, yet, support nullable types.  

## Literal representation

As noted previously, this representation should be as expressive and human-friendly as possible. 
We are in this regard heavily inspired by the GraphQL schema definition language.

Before producing a formal definition, we propose a heuristic approach via some simple code exploration.

Here is a what a simple example would look like:
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

Finally, we should keep in mind that this representation could also serve as a serialization format.

## Structural representation (syntax tree)

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

## Code exploration

this repo contains a first exploration of this proposal in the form of a set of node.js files.
- *type.js* contains a set of Records to represent a type syntax tree
- *schemaInferal.js* contains a function to generate a best guess syntax tree from a value
- *typeInferal.js* is a dependency of schemaInferal
- *generator.js* contains a function which given a syntax tree generates a literal representation
- *example.js* contains some code illustrating schema inferal, handmade syntax tree building and literal generation