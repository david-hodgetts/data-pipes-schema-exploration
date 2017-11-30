schema = t:type+ _ { return t }

type = tn:typeHeader _ f:field+ _ "}" _ { return {name:tn, fields:f};}

field = fn:word _ ":" _ ft:(tn:typeName / ln:typeList {return typeof tn === "undefined" ? ln : tn}) __ { return {fieldName:fn, fieldType:ft}; }

typeList = "[" _ tn:typeName _ "]" { return { name : "", ofType:tn}; } 

typeHeader = "Type" _ tn:typeName _ "{" { return tn; }

// typeName must start with a capital
typeName = first:[A-Z]rest:word { return first.concat(rest); }

word = w:letter+ {return w.join(""); }

letter = [a-zA-Z]

// optional whitespace
_  = [ \t\r\n]*

// mandatory whitespace
__ = [ \t\r\n]+