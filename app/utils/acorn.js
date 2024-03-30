const acorn = require('acorn');

function parseCode(code) {
    // Parse JavaScript code into an abstract syntax tree (AST)
    const ast = acorn.parse(code, { ecmaVersion: 'latest' });

    // Array to store variable and function information objects
    const parsedItems = [];

    // Custom traversal function to track variable values
    function traverse(node, ancestors) {
        if (node && typeof node === 'object') {
            if (node.type === 'VariableDeclaration') {
                // Determine if the variable is declared inside a function
                const isLocalVariable = ancestors.some(ancestor =>
                    ancestor.type === 'FunctionDeclaration' || ancestor.type === 'FunctionExpression'
                );

                // Extract information about variable declarations
                for (const declaration of node.declarations) {
                    const variableName = declaration.id.name;
                    let variableValue = null;

                    // Extract variable value if it has an initialization value
                    if (declaration.init !== null) {
                        variableValue = evaluateExpression(declaration.init);
                    }

                    // Store variable information in the parsedItems array
                    parsedItems.push({
                        type: 'variable',
                        name: variableName,
                        value: variableValue.value,
                        dataType: variableValue.dataType,
                        scope: isLocalVariable ? 'local' : 'global'
                    });
                }
            } else if (node.type === 'FunctionDeclaration' || (node.type === 'VariableDeclaration' && ancestors[ancestors.length - 2]?.type === 'FunctionDeclaration')) {
                const functionName = node.id?.name || 'anonymous';
                const functionBody = getNodeCode(node.body);
                const functionParams = (node.params || []).map(param => param.name);
                // Store function information in the parsedItems array
                parsedItems.push({
                    type: 'function',
                    name: functionName,
                    body: functionBody,
                    variables: [],
                    params: functionParams
                });
            } else if (node.type === 'ArrowFunctionExpression') {
                const functionName = 'anonymous';
                const functionBody = getNodeCode(node.body);
                const functionParams = (node.params || []).map(param => param.name);
                // Store arrow function information in the parsedItems array
                parsedItems.push({
                    type: 'function',
                    name: functionName,
                    body: functionBody,
                    variables: [],
                    params: functionParams
                });
            }
        }

        // Continue traversing child nodes
        for (const key in node) {
            if (node.hasOwnProperty(key) && typeof node[key] === 'object' && node[key] !== null) {
                if (Array.isArray(node[key])) {
                    for (const item of node[key]) {
                        traverse(item, ancestors.concat([node]));
                    }
                } else {
                    traverse(node[key], ancestors.concat([node]));
                }
            }
        }
    }

    // Function to evaluate expressions and return their value
    function evaluateExpression(expr) {
        let value;
        let dataType;

        switch (expr.type) {
            case 'Literal':
                value = expr.value;
                dataType = typeof value;
                break;
            case 'ArrayExpression':
                value = expr.elements.map(evaluateExpression);
                dataType = 'array';
                break;
            case 'ObjectExpression':
                value = {};
                expr.properties.forEach(property => {
                    value[property.key.name] = evaluateExpression(property.value);
                });
                dataType = 'object';
                break;
            default:
                value = undefined;
                dataType = 'undefined';
        }

        return { value, dataType };
    }

    // Function to get source code of a node
    function getNodeCode(node) {
        if (node && typeof node === 'object' && node.start !== undefined && node.end !== undefined) {
            return code.slice(node.start, node.end);
        }
        return '';
    }

    // Start traversal from the root node of the AST
    traverse(ast, []);

    return parsedItems;
}

// Example usage
const code = `
    var x = 10;
    let y = 'hello';
    const z = true;
    let xq1 = {x : "true"}

    function sum(a, b) {
        let result = a + b;
        let temp = 5;
        return result;
    }

    const multiply = (a, b) => {
        let product = a * b;
        return product;
    };
`;

const parsedItems = parseCode(code);
console.log(parsedItems);

module.exports = parseCode
