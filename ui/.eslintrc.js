/* tslint:disable */
module.exports = {
    parser:        '@typescript-eslint/parser',
    extends:       [
        'plugin:@typescript-eslint/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
    ],
    parserOptions: {
        ecmaVersion:  2018,
        project:      'tsconfig.json',
        sourceType:   'module'
    },
    plugins:       [
        '@typescript-eslint',
        'import',
    ],
    env:           {
        browser: true,
        node:    true,
    },
    rules:         {
        'indent': 'off',

        '@typescript-eslint/no-parameter-properties':          'off',
        '@typescript-eslint/explicit-function-return-type':    'off',
        '@typescript-eslint/no-object-literal-type-assertion': 'off',
        '@typescript-eslint/indent':                           [
            'error',
            4,
            {'flatTernaryExpressions': true, 'SwitchCase': 1},
        ],

        'import/export':      'off',
        'key-spacing':        [
            2,
            {
                afterColon:  true,
                align:       'value',
                beforeColon: false,
                mode:        'minimum',
            },
        ],
        'comma-dangle':       [2, 'always-multiline'],
        'import/named':       'off',
        'import/order':       [2, {'newlines-between': 'always'}],
    },
};
