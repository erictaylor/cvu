<h1 align="center">cvu</h1>

<p align="center">
  A tiny, performant, utility for constructing variant based CSS class strings.
</p>

<br />

## Installation

NPM:

```sh
npm i cvu
```

Yarn:

```sh
yarn add cvu
```

PNPM:

```sh
pnpm i cvu
```

### Tailwind CSS

If you're a Tailwind user, here are some additional (optional) steps to get the most out of `cvu`.

#### IntelliSense

You can enable autocompletion inside `cvu` using the steps below:

**VSCode**

1. [Install the "Tailwind CSS IntelliSense" Visual Studio Code extension.](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
2. Add the following to your [`settings.json`](https://code.visualstudio.com/docs/getstarted/settings):

```json
{
  "tailwindCSS.experimental.classRegex": [
    ["cvu\\s*(?:<[\\s\\S]*?>)?\\s*\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### Handling Style Conflicts

Although `cvu`'s API is designed to help you avoid style conflicts, there is still a small margin of error.

If you're keen to lift that burden altogether, check out [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) package.

For bulletproof components, wrap your `cvu` calls with `twMerge`.

<details>
<summary>Example with tailwind-merge</summary>

```tsx
import { cvu, type VariantProps } from "cvu";
import { twMerge } from "tailwind-merge";

const buttonVariants = cvu(["your", "base", "classes"], {
  variants: {
    intent: {
      primary: ["your", "primary", "classes"],
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});

export const buttonClassNames = (
  props: VariantProps<typeof buttonVariants>
) => {
  return twMerge(buttonVariants(props));
};
```

</details>

If you find yourself using `twMerge` a lot, you can create a custom `cvu` function that wraps `twMerge` for you.

<details>
<summary>Example with custom cvu</summary>

```tsx
import { config, cx } from "cvu";
import { twMerge } from "tailwind-merge";

export const cvu = config({
  cx: (...inputs) => twMerge(cx(inputs)),
});
```

</details>

## Getting Started

### Your First Utility

Here is a simple example of a `cvu` generated utility function for generating class names for a button component.

> **Note**
>
> The use of Tailwind CSS here is purely for demonstration purposes. `cvu` is not tied to any specific CSS framework.

```ts
import { cvu } from "cvu";

const buttonClassnames = cvu(
  ["font-semibold", "border", "rounded"],
  // --or--
  // 'font-semibold border rounded'
  {
    variants: {
      intent: {
        primary: [
          "bg-blue-500",
          "text-white",
          "border-transparent",
          "hover:bg-blue-600",
        ],
        secondary: "bg-white text-gray-800 border-gray-400 hover:bg-gray-100",
      },
      size: {
        sm: "text-sm py-1 px-2",
        md: ["text-base", "py-2", "px-4"],
      },
    },
    compoundVariants: [
      {
        intent: "primary",
        size: "md",
        className: "uppercase",
      },
    ],
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

buttonClassnames();
// => 'font-semibold border rounded bg-blue-500 text-white border-transparent hover:bg-blue-600 text-base py-2 px-4 uppercase'

buttonClassnames({ intent: "secondary", size: "sm" });
// => 'font-semibold border rounded bg-white text-gray-800 border-gray-400 hover:bg-gray-100 text-sm py-1 px-2'
```

### Compound Variants

Variants that apply when multiple other variant conditions are met.

```ts
import { cvu } from "cvu";

const buttonClassnames = cva("…", {
  variants: {
    intent: {
      primary: "…",
      secondary: "…",
    },
    size: {
      sm: "…",
      md: "…",
    },
  },
  compoundVariants: [
    // Applied via
    //  `buttonClassnames({ intent: 'primary', size: 'md' });`
    {
      intent: "primary",
      size: "md",
      // This is the className that will be applied.
      className: "…",
    },
  ],
});
```

#### Targeting Multiple Variant Conditions

```ts
import { cvu } from "cvu";

const buttonClassnames = cva("…", {
  variants: {
    intent: {
      primary: "…",
      secondary: "…",
    },
    size: {
      sm: "…",
      md: "…",
    },
  },
  compoundVariants: [
    // Applied via
    //  `buttonClassnames({ intent: 'primary', size: 'md' });`
    //     or
    //  `buttonClassnames({ intent: 'secondary', size: 'md' });`
    {
      intent: ["primary", "secondary"],
      size: "md",
      // This is the className that will be applied.
      className: "…",
    },
  ],
});
```

### Additional Classes

All `cvu` utilities provide an optional string argument, which will be appended to the end of the generated class name.

This is useful in cases where want to pass a React `className` prop to be merged with the generated class name.

```ts
import { cvu } from "cvu";

const buttonClassnames = cvu("rounded", {
  variants: {
    intent: {
      primary: "bg-blue-500",
    },
  },
});

buttonClassnames(undefined, "m-4");
// => 'rounded m-4'

buttonClassnames({ intent: "primary" }, "m-4");
// => 'rounded bg-blue-500 m-4'
```

### TypeScript

#### `VariantProps`

`cvu` offers the `VariantProps` helper to extract variant types from a `cvu` utility.

```ts
import { cvu, type VariantProps } from "cvu";

type ButtonClassnamesProps = VariantProps<typeof buttonClassnames>;
const buttonClassnames = cvu(/* … */);
```

#### `VariantPropsWithRequired`

Additionally, `cvu` offers the `VariantPropsWithRequired` helper to extract variant types from a `cvu` utility, with the specified keys marked as required.

```ts
import { cvu, type VariantPropsWithRequired } from "cvu";

type ButtonClassnamesProps = VariantPropsWithRequired<
  typeof buttonClassnames,
  "intent"
>;
const buttonClassnames = cvu("…", {
  variants: {
    intent: {
      primary: "…",
      secondary: "…",
    },
    size: {
      sm: "…",
      md: "…",
    },
  },
});

const wrapper = (props: ButtonClassnamesProps) => {
  return buttonClassnames(props);
};

// ❌ TypeScript Error:
// Argument of type "{}": is not assignable to parameter of type "ButtonClassnamesProps".
//   Property "intent" is missing in type "{}" but required in type
//   "ButtonClassnamesProps".
wrapper({});

// ✅
wrapper({ intent: "primary" });
```

### Composing Utilities

```ts
import { cvu, cx, type VariantProps } from "cvu";

/**
 * Box
 */
export type BoxClassnamesProps = VariantProps<typeof boxClassnames>;
export const boxClassnames = cvu(/* … */);

/**
 * Card
 */
type CardBaseClassNamesProps = VariantProps<typeof cardBaseClassnames>;
const cardBaseClassnames = cvu(/* … */);

export interface CardClassnamesProps
  extends BoxClassnamesProps,
    CardBaseClassnamesProps {}
export const cardClassnames =
  ({}: /* destructured props */ CardClassnamesProps = {}) =>
    cx(
      boxClassnames({
        /* … */
      }),
      cardBaseClassnames({
        /* … */
      })
    );
```

## API

### `cvu`

Builds a typed utility function for constructing className strings with given variants.

```ts
import { cvu } from "cvu";

const classVariants = cvu("base", variantsConfig);
```

#### Parameters

1. `base` - the base class name (`string`, `string[]`, or other `clsx` compatible value).
2. `variantsConfig` - (optional)

   - `variants` - your variants schema
   - `componentVariants` - variants based on a combination of previously defined variants
   - `defaultVariants` - set default values for previously defined variants.

     _Note: these default values can be removed completely by setting the variant as `null`._

### `config`

Allows you to provide your own underlying `cx` implementation or wrapping logic.

```ts
import { config, cx } from "cvu";

export const customCvu = config({
  cx: (...inputs) => twMerge(cx(inputs)),
});
```

## Acknowledgements

- [Stitches](https://stitches.dev)

  For pioneering the `variants` API movement.

- [cva](https://cva.style)

  For the inspiration behind `cvu`. I personally didn't find the library to quite meet my needs or API preferences, but it's a great library nonetheless.

- [clsx]()

  An amazing library for lightweight utility for constructing className strings conditionally.

## License

[MIT](/LICENSE.md) © [Eric Taylor](https://github.com/erictaylor)
