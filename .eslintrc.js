module.exports = {
    "extends": [
        "eslint:recommended",
        "prettier"
    ],
    files: ["*.js","*.html"],
    "plugins": [
        "prettier",
        "html"
    ],
    "env": {
        "browser": true,
        "es6": true
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "sourceType": "module",
        "ecmaVersion": 8
    },
    "rules": {
        "no-const-assign": "warn",
        "no-this-before-super": "warn",
        "no-undef": "warn",
        "no-var": "error",
        "no-console": "off",
        "no-unreachable": "warn",
        "no-unused-vars": "warn",
        "constructor-super": "warn",
        "valid-typeof": "warn",
        "prettier/prettier": [
            "error",
            {
                "singleQuote": true,
                "trailingComma": "all"
            }
        ]
    }
}