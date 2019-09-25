module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        browser: true,
        node: true,
        mocha: true
    },
    extends: 'standard',
    // extends: 'airbnb-base',
    plugins: [
        'html'
    ],
    // add your custom rules here
    rules: {
        indent: ['error', 4],
        semi: [0],
        strict: [0, 'always'],
        'no-plusplus': ['error', { "allowForLoopAfterthoughts": true }],
        'func-names': ['error', 'never'],
        'class-methods-use-this': [0, 'always'],
        'no-underscore-dangle': [0, 'always'],
        'no-param-reassign': [0, 'always'],
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-useless-escape': [0, 'always'],
        // 'require-yield': 0,
        // Disallows the use of var
        'no-var': 'error',
        // Disable rule to disallow tabs
        'no-tabs': 0,
        // Requires tabs
        // indent: ['error', 'tab'],
        // Requires generator functions to be called using yield
        'require-yield': 'error',
        // Spacing before and after star in generator functions
        'generator-star-spacing': ['error', {
            before: true,
            after: true
        }],
        'space-before-function-paren': ['error', 'always'],
        // Forces space after function params/paren
        'space-before-blocks': 'error',
        // Disallows spaces around parameters, inside parenthesis (only after commas)
        'space-in-parens': ['error', 'never'],
        // Comments must have spaces after the initializer
        'spaced-comment': ['error', 'always'],
        // For arrow functions, you do not need a body, but can have it
        'arrow-body-style': ['error', 'as-needed'],
        // Forces spacing around arrow in arrow functions
        'arrow-spacing': 'error',
        // Requires constructors to have a super() call if it extends something
        'constructor-super': 'error',
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
    },
    globals: {
        make: true,
        use: true
    }
};
