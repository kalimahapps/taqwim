# Parser
PHPTaqwim uses [php-parser](https://www.npmjs.com/package/php-parser) to generate an AST from the source code. The AST is then used to perform the analysis. The original AST is kept as is, but few additional properties are added to the nodes to make the analysis easier.

## Version
PHPTaqwin uses a version of php-parse that has been compiled using vite node API and it ships with the extension. The reason being is that php-parse is transpiled using webpack, which is not compatible with vite. There was an `undefined self` error.

## Additions
### Traversal
Four methods are added to the nodes to traverse the AST:
- `closest` - returns the closest parent node of the given type
- `parent` - returns direct parent of node
- `siblings` - returns the siblings of the node
- `find`  returns the first child node of the given type

Also, `path` property is added to the nodes. It is an array of node types from the root to the current node. Each key in the array is separated by a single pipe character |. The left side of the pipe is the node type, and the right side is the kind of the node. 

For example:
```js
[
  'children-0|if',
  'alternate|if',
  'alternate|block',
  'children-0|echo'
]
```

### ifType
`if` nodes have an additional property `ifType` which is a string that represents the type of the `if` node. It can be one of the following:
- `onlyif` - if statement with **no** `else` or `elseif`
- `if` - if statement with either `else` or `elseif`
- `elseif` - elseif`statement
- `else` - else statement

### AttrGroup and Attribute
AttrGroup and Attribute have few issues:
- loc is not accurate.
- source is not accurate or undefined.
Using regex and string manipulation, the loc and source are fixed. Hopefully, once php-parser [fixes the issue](https://github.com/glayzzle/php-parser/issues/1125), the regex and string manipulation can be removed.

### Loc position
- Loc position are transformed to zero-based instead of one-based
- There is a bug with noop loc position where they are the wrong match (start loc is for the end position and vice versa). This is fixed by swapping the start and end loc positions.
For the bug see: https://github.com/glayzzle/php-parser/issues/1063
  
## Types
PHPTaqwim is wrtten in TypeScript, but php-parser is not. While php-parser provides type definitions, they are not complete, or even [consistent](https://github.com/glayzzle/php-parser/issues/1008). PHPTaqwim adds additional types to the nodes to make the analysis easier. However, these types are temporary until hopefully php-parser adds them to their type definitions.

## Online AST Explorer
To explore the AST you can do it online at [AST Explorer](https://astexplorer.net/), choose `PHP` as the language and `php-parser` as the parser.