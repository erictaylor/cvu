/**
 * @module
 * This module contains functions for configuring and
 * creating class variant utility functions.
 *
 * It also includes types for extracting variant props
 * from a class variant utility function.
 *
 * For more information see the {@link https://github.com/erictaylor/cvu/blob/main/README.md|GitHub README}
 */
import { type ClassValue, clsx } from 'clsx';

type ConfigWrapperProps = {
	clsx: (...inputs: ClassValue[]) => string;
};

type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T;

type ClassNameProp = {
	/**
	 * The string to be set when the compound variant is active.
	 */
	className: string;
};

type ConfigSchema = Record<string, Record<string, ClassValue>>;

type ConfigVariants<T extends ConfigSchema> = {
	[Variant in keyof T]?: StringToBoolean<keyof T[Variant]> | null | undefined;
};
type ConfigVariantsMulti<T extends ConfigSchema> = {
	[Variant in keyof T]?:
		| StringToBoolean<keyof T[Variant]>
		| StringToBoolean<keyof T[Variant]>[]
		| undefined;
};

type VariantsConfig<T> = T extends ConfigSchema
	? {
			variants?: T;
			defaultVariants?: ConfigVariants<T>;
			compoundVariants?: T extends ConfigSchema
				? ((ConfigVariants<T> | ConfigVariantsMulti<T>) & ClassNameProp)[]
				: never;
		}
	: never;

type ConfigVariantProps<T> = T extends ConfigSchema
	? ConfigVariants<T>
	: undefined;

type VariantClassNameFn<T> = (
	variantProps?: ConfigVariantProps<T>,
	/**
	 * Optional additional class string to be appended to the end of the generated class string.
	 */
	className?: string,
) => string;

type NonNullVariantPropsValues<T extends Record<string, unknown>> = {
	[K in keyof T]: Exclude<T[K], null>;
};

/**
 * A helper type to extract the variant props from
 * a class variant utility function.
 *
 * @example
 * ```ts
 * import { cvu, type VariantProps } from 'cvu';
 *
 * const buttonClassnames = cvu('font-semibold', {
 *   variants: {
 *     size: {
 *       sm: 'text-sm',
 *     },
 *   },
 * });
 * type ButtonClassnameProps = VariantProps<typeof buttonClassnames>;
 * ```
 */
export type VariantProps<T extends VariantClassNameFn<ConfigSchema>> =
	NonNullVariantPropsValues<Exclude<Parameters<T>[0], undefined>>;

/**
 * A helper type to extract the variant props from
 * a class variant utility function and marking
 * the specified keys as required.
 *
 * @example
 * ```ts
 * import { cvu, type VariantPropsWithRequired } from "cvu";
 *
 * type ButtonClassnamesProps = VariantPropsWithRequired<
 *   typeof buttonClassnames,
 *   "intent"
 * >;
 * const buttonClassnames = cvu("…", {
 *   variants: {
 *     intent: {
 *       primary: "…",
 *       secondary: "…",
 *     },
 *     size: {
 *       sm: "…",
 *       md: "…",
 *     },
 *   },
 * });
 *
 * const wrapper = (props: ButtonClassnamesProps) => {
 *   return buttonClassnames(props);
 * };
 *
 * // ❌ TypeScript Error:
 * // Argument of type "{}": is not assignable to parameter of type "ButtonClassnamesProps".
 * //   Property "intent" is missing in type "{}" but required in type
 * //   "ButtonClassnamesProps".
 * wrapper({});
 *
 * // ✅
 * wrapper({ intent: "primary" });
 * ```
 */
export type VariantPropsWithRequired<
	T extends VariantClassNameFn<ConfigSchema>,
	K extends keyof VariantProps<T>,
> = VariantProps<T> & Required<Pick<VariantProps<T>, K>>;

/**
 * The class variant utility function.
 */
export type ClassVariantUtility = <T>(
	base?: ClassValue,
	variantsConfig?: VariantsConfig<T>,
) => VariantClassNameFn<T>;

const valueToString = <T>(value: T): string => {
	return value?.toString() || '';
};

/**
 * A function to create a custom class variant utility.
 *
 * Allows you to provide your own underlying `clsx`
 * implementation or wrapping logic.
 *
 * @param config Object of configuration options. Pass a custom `clsx` function to be used for generating class strings.
 * @returns A class variant utility function.
 *
 * @example
 * ```ts
 * import { config, clsx } from 'cvu';
 * import { twMerge } from 'tailwind-merge';
 *
 * export const customCvu = config({
 *   clsx: (...inputs) => twMerge(clsx(inputs)),
 * });
 * ```
 */
export const config =
	({ clsx: cx }: ConfigWrapperProps): ClassVariantUtility =>
	(base, variantsConfig) => {
		const { variants, defaultVariants, compoundVariants } =
			variantsConfig || {};

		return (variantProps, className) => {
			if (!variants) {
				return cx(base, className);
			}

			const variantClassNames: ClassValue[] = Object.entries(variants).map(
				([variant, variantOptions]) => {
					const variantProp = variantProps?.[variant];
					const defaultVariantProp = defaultVariants?.[variant];

					if (variantProp === null) {
						return null;
					}

					const variantKey: string =
						valueToString(variantProp) || valueToString(defaultVariantProp);

					return variantOptions?.[variantKey];
				},
			);

			const variantPropsWithoutUndefined: ConfigSchema | undefined =
				variantProps &&
				Object.fromEntries(
					Object.entries(variantProps).filter(
						([, value]) => value !== undefined,
					),
				);

			const compoundVariantClassNames: ClassValue[] | undefined =
				compoundVariants?.reduce<ClassValue[]>(
					(
						acc,
						{ className: compoundClassName, ...compoundVariantOptions },
					) => {
						if (
							Object.entries(compoundVariantOptions).every(([key, value]) => {
								const o = {
									...defaultVariants,
									...variantPropsWithoutUndefined,
								};
								const v = o[key];

								return Array.isArray(value) && v != null
									? value.includes(v)
									: v === value;
							})
						) {
							acc.push(compoundClassName);

							return acc;
						}

						return acc;
					},
					[],
				);

			return cx(base, variantClassNames, compoundVariantClassNames, className);
		};
	};

/**
 * The default `clsx` function used for generating class strings.
 *
 * Provided by the `clsx` NPM package.
 */
export { clsx };

/**
 * Class variant utility function.
 *
 * Creates a function that generates a class string based on the provided variant props.
 *
 * @param base The base class name (`string`, `string[]`, or other `clsx` compatible values).
 * @param variantsConfig Object of configuration options for the class variants.
 * @param variantsConfig.variants Object variants schema.
 * @param variantsConfig.componentVariants Array of Objects describing class names to be applied when variant combinations are active.
 * @param variantsConfig.defaultVariants Object of default values for the variants.
 * @returns A function that generates a class string based on the provided variant props.
 *
 * @example
 * ```ts
 * import { cvu } from "cvu";
 *
 * const buttonClassnames = cvu(
 *   ["font-semibold", "border", "rounded"],
 *   // --or--
 *   // 'font-semibold border rounded'
 *   {
 *     variants: {
 *       intent: {
 *         primary: [
 *           "bg-blue-500",
 *           "text-white",
 *           "border-transparent",
 *           "hover:bg-blue-600",
 *         ],
 *         secondary: "bg-white text-gray-800 border-gray-400 hover:bg-gray-100",
 *       },
 *       size: {
 *         sm: "text-sm py-1 px-2",
 *         md: ["text-base", "py-2", "px-4"],
 *       },
 *     },
 *     compoundVariants: [
 *       {
 *         intent: "primary",
 *         size: "md",
 *         className: "uppercase",
 *       },
 *     ],
 *     defaultVariants: {
 *       intent: "primary",
 *       size: "md",
 *     },
 *   }
 * );
 *
 * buttonClassnames();
 * // => 'font-semibold border rounded bg-blue-500 text-white border-transparent hover:bg-blue-600 text-base py-2 px-4 uppercase'
 *
 * buttonClassnames({ intent: "secondary", size: "sm" });
 * // => 'font-semibold border rounded bg-white text-gray-800 border-gray-400 hover:bg-gray-100 text-sm py-1 px-2'
 * ```
 */
export const cvu: ClassVariantUtility = config({ clsx });

export default cvu;
