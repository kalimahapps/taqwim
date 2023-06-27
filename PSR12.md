This file is for tracking the completion of implementing PSR-12.

## 2.1 General

### 2.1 Basic Coding Standard
- Code MUST follow all rules outlined in PSR-1.


### 2.2 Files
- ~~All PHP files MUST use the Unix LF (linefeed) line ending only.~~
- ~~All PHP files MUST end with a non-blank line, terminated with a single LF.~~
- ~~The closing ?> tag MUST be omitted from files containing only PHP.~~

### 2.3 Lines
- ~~There MUST NOT be a hard limit on line length.~~
- ~~The soft limit on line length MUST be 120 characters.~~
- ~~Lines SHOULD NOT be longer than 80 characters; lines longer than that SHOULD be split into multiple subsequent lines of no more than 80 characters each.~~
- ~~There MUST NOT be trailing whitespace at the end of lines.~~
- Blank lines MAY be added to improve readability and to indicate related blocks of code except where explicitly forbidden.
- There MUST NOT be more than one statement per line.

### 2.4 Indenting
- Code MUST use an indent of 4 spaces for each indent level, and MUST NOT use tabs for indenting.

### 2.5 Keywords and Types
- ~~All PHP reserved keywords and types [1][2] MUST be in lower case.~~
- ~~Any new types and keywords added to future PHP versions MUST be in lower case.~~
- Short form of type keywords MUST be used i.e. bool instead of boolean, int instead of integer etc.

## 3. Declare Statements, Namespace, and Import Statements
- The header of a PHP file may consist of a number of different blocks. If present, each of the blocks below MUST be separated by a single blank line, and MUST NOT contain a blank line. Each block MUST be in the order listed below, although blocks that are not relevant may be omitted.
  - Opening <?php tag.
  - File-level docblock.
  - One or more declare statements.
  - The namespace declaration of the file.
  - One or more class-based use import statements.
  - One or more function-based use import statements.
  - One or more constant-based use import statements.
  - The remainder of the code in the file.


- When a file contains a mix of HTML and PHP, any of the above sections may still be used. If so, they MUST be present at the top of the file, even if the remainder of the code consists of a closing PHP tag and then a mixture of HTML and PHP.
- When the opening <?php tag is on the first line of the file, it MUST be on its own line with no other statements unless it is a file containing markup outside of PHP opening and closing tags.
- Import statements MUST never begin with a leading backslash as they must always be fully qualified.
- Compound namespaces with a depth of more than two MUST NOT be used. Therefore the following is the maximum compounding depth allowed:
- When wishing to declare strict types in files containing markup outside PHP opening and closing tags, the declaration MUST be on the first line of the file and include an opening PHP tag, the strict types declaration and closing tag.
- Declare statements MUST contain no spaces and MUST be exactly declare(strict_types=1) (with an optional semi-colon terminator).

- Block declare statements are allowed and MUST be formatted as below. Note position of braces and spacing:

## 4. Classes, Properties, and Methods
The term "class" refers to all classes, interfaces, and traits.

- ~~Any closing brace MUST NOT be followed by any comment or statement on the same line.~~

- ~~When instantiating a new class, parentheses MUST always be present even when there are no arguments passed to the constructor.~~

### 4.1 Extends and Implements
- The extends and implements keywords MUST be declared on the same line as the class name.

- The opening brace for the class MUST go on its own line; the closing brace for the class MUST go on the next line after the body.

- Opening braces MUST be on their own line and MUST NOT be preceded or followed by a blank line.

- Closing braces MUST be on their own line and MUST NOT be preceded by a blank line.

- Lists of implements and, in the case of interfaces, extends MAY be split across multiple lines, where each subsequent line is indented once. When doing so, the first item in the list MUST be on the next line, and there MUST be only one interface per line.

## 4.2 Using traits
- The use keyword used inside the classes to implement traits MUST be declared on the next line after the opening brace.

- Each individual trait that is imported into a class MUST be included one-per-line and each inclusion MUST have its own use import statement.

- When the class has nothing after the use import statement, the class closing brace MUST be on the next line after the use import statement. Otherwise, it MUST have a blank line after the use import statement.

- When using the insteadof and as operators they must be used as follows taking note of indentation, spacing, and new lines.

## 4.3 Properties and Constants
- Visibility MUST be declared on all properties.

- Visibility MUST be declared on all constants if your project PHP minimum version supports constant visibilities (PHP 7.1 or later).

- ~~The var keyword MUST NOT be used to declare a property.~~

- ~~There MUST NOT be more than one property declared per statement.~~

- ~~Property names MUST NOT be prefixed with a single underscore to indicate protected or private visibility. That is, an underscore prefix explicitly has no meaning.~~

- There MUST be a space between type declaration and property name.

## 4.4 Methods and Functions
- ~~Visibility MUST be declared on all methods.~~

- ~~Method names MUST NOT be prefixed with a single underscore to indicate protected or private visibility. That is, an underscore prefix explicitly has no meaning.~~

- Method and function names MUST NOT be declared with space after the method name. The opening brace MUST go on its own line, and the closing brace MUST go on the next line following the body. There MUST NOT be a space after the opening parenthesis, and there MUST NOT be a space before the closing parenthesis.

- A method declaration looks like the following. Note the placement of parentheses, commas, spaces, and braces:

- A function declaration looks like the following. Note the placement of parentheses, commas, spaces, and braces:

## 4.5 Method and Function Arguments
- ~~In the argument list, there MUST NOT be a space before each comma, and there MUST be one space after each comma.~~

- ~~Method and function arguments with default values MUST go at the end of the argument list.~~

- Argument lists MAY be split across multiple lines, where each subsequent line is indented once. When doing so, the first item in the list MUST be on the next line, and there MUST be only one argument per line.

- When the argument list is split across multiple lines, the closing parenthesis and opening brace MUST be placed together on their own line with one space between them.

- ~~When you have a return type declaration present, there MUST be one space after the colon followed by the type declaration. The colon and declaration MUST be on the same line as the argument list closing parenthesis with no spaces between the two characters.~~

- ~~In nullable type declarations, there MUST NOT be a space between the question mark and the type.~~

- ~~When using the reference operator & before an argument, there MUST NOT be a space after it, like in the previous example.~~

- ~~There MUST NOT be a space between the variadic three dot operator and the argument name:~~

- ~~When combining both the reference operator and the variadic three dot operator, there MUST NOT be any space between the two of them:~~

## 4.6 abstract, final, and static
- When present, the abstract and final declarations MUST precede the visibility declaration.

- When present, the static declaration MUST come after the visibility declaration.

## 4.7 Method and Function Calls
- ~~When making a method or function call, there MUST NOT be a space between the method or function name and the opening parenthesis, there MUST NOT be a space after the opening parenthesis, and there MUST NOT be a space before the closing parenthesis. In the argument list, there MUST NOT be a space before each comma, and there MUST be one space after each comma.~~

- Argument lists MAY be split across multiple lines, where each subsequent line is indented once. When doing so, the first item in the list MUST be on the next line, and there MUST be only one argument per line. A single argument being split across multiple lines (as might be the case with an anonymous function or array) does not constitute splitting the argument list itself.

## 5. Control Structures
- The general style rules for control structures are as follows:
	- ~~There MUST be one space after the control structure keyword~~
	- ~~There MUST NOT be a space after the opening parenthesis~~
	- ~~There MUST NOT be a space before the closing parenthesis~~
	- ~~There MUST be one space between the closing parenthesis and the opening brace~~
	- ~~The structure body MUST be indented once~~
	- The body MUST be on the next line after the opening brace
	- ~~The closing brace MUST be on the next line after the body~~
- The body of each structure MUST be enclosed by braces. This standardizes how the structures look and reduces the likelihood of introducing errors as new lines get added to the body.

### 5.1 if, elseif, else
- ~~An if structure looks like the following. Note the placement of parentheses, spaces, and braces; and that else and elseif are on the same line as the closing brace from the earlier body.~~

- The keyword elseif SHOULD be used instead of else if so that all control keywords look like single words.

- Expressions in parentheses MAY be split across multiple lines, where each subsequent line is indented at least once. When doing so, the first condition MUST be on the next line. The closing parenthesis and opening brace MUST be placed together on their own line with one space between them. Boolean operators between conditions MUST always be at the beginning or at the end of the line, not a mix of both.

### 5.2 switch, case
- A switch structure looks like the following. Note the placement of parentheses, spaces, and braces. The case statement MUST be indented once from switch, and the break keyword (or other terminating keywords) MUST be indented at the same level as the case body. There MUST be a comment such as // no break when fall-through is intentional in a non-empty case body.

- Expressions in parentheses MAY be split across multiple lines, where each subsequent line is indented at least once. When doing so, the first condition MUST be on the next line. The closing parenthesis and opening brace MUST be placed together on their own line with one space between them. Boolean operators between conditions MUST always be at the beginning or at the end of the line, not a mix of both.

### 5.3 while, do while
- A while statement looks like the following. Note the placement of parentheses, spaces, and braces.

- Expressions in parentheses MAY be split across multiple lines, where each subsequent line is indented at least once. When doing so, the first condition MUST be on the next line. The closing parenthesis and opening brace MUST be placed together on their own line with one space between them. Boolean operators between conditions MUST always be at the beginning or at the end of the line, not a mix of both.

- Similarly, a do while statement looks like the following. Note the placement of parentheses, spaces, and braces.

- Expressions in parentheses MAY be split across multiple lines, where each subsequent line is indented at least once. When doing so, the first condition MUST be on the next line. Boolean operators between conditions MUST always be at the beginning or at the end of the line, not a mix of both.

### 5.4 for
- A for statement looks like the following. Note the placement of parentheses, spaces, and braces.

- Expressions in parentheses MAY be split across multiple lines, where each subsequent line is indented at least once. When doing so, the first expression MUST be on the next line. The closing parenthesis and opening brace MUST be placed together on their own line with one space between them.

### 5.5 foreach
A foreach statement looks like the following. Note the placement of parentheses, spaces, and braces.

### 5.6 try, catch, finally
A try-catch-finally block looks like the following. Note the placement of parentheses, spaces, and braces.

## 6. Operators
- Style rules for operators are grouped by arity (the number of operands they take).

- When space is permitted around an operator, multiple spaces MAY be used for readability purposes.

- All operators not described here are left undefined.

### 6.1. Unary operators
- The increment/decrement operators MUST NOT have any space between the operator and operand.

- Type casting operators MUST NOT have any space within the parentheses:

### 6.2. Binary operators
- All binary arithmetic, comparison, assignment, bitwise, logical, string, and type operators MUST be preceded and followed by at least one space:

### 6.3. Ternary operators
- The conditional operator, also known simply as the ternary operator, MUST be preceded and followed by at least one space around both the ? and : characters:

- When the middle operand of the conditional operator is omitted, the operator MUST follow the same style rules as other binary comparison operators:

## 7. Closures
- Closures MUST be declared with a space after the function keyword, and a space before and after the use keyword.

- The opening brace MUST go on the same line, and the closing brace MUST go on the next line following the body.

- There MUST NOT be a space after the opening parenthesis of the argument list or variable list, and there MUST NOT be a space before the closing parenthesis of the argument list or variable list.

- In the argument list and variable list, there MUST NOT be a space before each comma, and there MUST be one space after each comma.

- Closure arguments with default values MUST go at the end of the argument list.

- If a return type is present, it MUST follow the same rules as with normal functions and methods; if the use keyword is present, the colon MUST follow the use list closing parentheses with no spaces between the two characters.

- A closure declaration looks like the following. Note the placement of parentheses, commas, spaces, and braces:

- Argument lists and variable lists MAY be split across multiple lines, where each subsequent line is indented once. When doing so, the first item in the list MUST be on the next line, and there MUST be only one argument or variable per line.

- When the ending list (whether of arguments or variables) is split across multiple lines, the closing parenthesis and opening brace MUST be placed together on their own line with one space between them.

- The following are examples of closures with and without argument lists and variable lists split across multiple lines.

## 8. Anonymous Classes
- Anonymous Classes MUST follow the same guidelines and principles as closures in the above section.

- The opening brace MAY be on the same line as the class keyword so long as the list of implements interfaces does not wrap. If the list of interfaces wraps, the brace MUST be placed on the line immediately following the last interface.