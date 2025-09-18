import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin"
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import reactX from "eslint-plugin-react-x"
import reactDom from "eslint-plugin-react-dom"
// Note: Remove this line if you don't want to use Prettier integration (useful for printWidth enforcement)
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

const importRulesConfig = {
    rules: {
        "@typescript-eslint/consistent-type-imports": "error",
        "import/extensions": ["warn", "ignorePackages", { json: "always" }],
        "import/no-named-as-default": "off",
        "import/no-commonjs": "error",
        "import/no-default-export": "warn",
        "import/no-anonymous-default-export": "error",
        "import/no-cycle": "error",
        "import/no-self-import": "error",
        "import/no-unresolved": ["off", { ignore: [".js$"] }],
        "import/no-internal-modules": [
            "off",
            {
                allow: [".json$"],
            },
        ],
        "import/order": [
            "warn",
            {
                alphabetize: {
                    order: "asc",
                    caseInsensitive: true
                },
                named: true,
                "newlines-between": "always",
            },
        ]
    }
}
const tsConfigs = tseslint.config(
    eslint.configs.recommended,
    // https://typescript-eslint.io/users/configs/#recommended
    tseslint.configs.recommended,
    // https://typescript-eslint.io/users/configs/#stylistic
    tseslint.configs.stylistic,
    // https://typescript-eslint.io/users/what-about-formatting
    // https://eslint.style/guide/config-presets
    // Note: Most of these are disabled due to ESLint plugin
    stylistic.configs.customize({
        indent: 4,
        quotes: "double",
        semi: true,
        jsx: true,
    }),
    // https://github.com/prettier/eslint-plugin-prettier
    // Useful for printWidth enforcement
    eslintPluginPrettier
)

const tsTypecheckedConfigs = tseslint.config(
    eslint.configs.recommended,
    // https://typescript-eslint.io/users/configs/#recommended-type-checked
    tseslint.configs.recommendedTypeChecked,
    // https://typescript-eslint.io/users/configs/#stylistic-type-checked
    tseslint.configs.stylisticTypeChecked,
    // https://typescript-eslint.io/users/what-about-formatting
    // https://eslint.style/guide/config-presets
    // Note: Most of these are disabled due to ESLint plugin
    stylistic.configs.customize({
        indent: 4,
        quotes: "double",
        semi: true,
        jsx: true,
    }),
    // https://github.com/prettier/eslint-plugin-prettier
    // Useful for printWidth enforcement
    eslintPluginPrettier
)

export const configs = [
    ...tsConfigs,
    {
        languageOptions: {
            globals: globals.node,
        }
    },
    //https://github.com/import-js/eslint-plugin-import/tree/main?tab=readme-ov-file#config---flat-eslintconfigjs
    importPlugin.flatConfigs.recommended,
    importRulesConfig
];

export const typecheckedConfigs = [
    ...tsTypecheckedConfigs,
    {
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    //https://github.com/import-js/eslint-plugin-import/tree/main?tab=readme-ov-file#config---flat-eslintconfigjs
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    importRulesConfig,
];

export const typecheckedReactConfigs = [
    ...tsTypecheckedConfigs,
    // https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x
    reactX.configs.recommended,
    // https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom
    reactDom.configs.recommended,
    // https://github.com/ArnaudBarre/eslint-plugin-react-refresh
    reactRefresh.configs.recommended,
    // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
    { plugins: { "react-hooks": reactHooks.configs.recommended } },
    {
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    //https://github.com/import-js/eslint-plugin-import/tree/main?tab=readme-ov-file#config---flat-eslintconfigjs
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    importRulesConfig,
    {
        rules: {
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ]
        }
    },
];
