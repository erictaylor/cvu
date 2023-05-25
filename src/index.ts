import clsx, { type ClassValue } from 'clsx';

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

export type VariantProps<T extends VariantClassNameFn<ConfigSchema>> = Exclude<
	Parameters<T>[0],
	undefined
>;

export type VariantPropsWithRequired<
	T extends VariantClassNameFn<ConfigSchema>,
	K extends keyof VariantProps<T>,
> = VariantProps<T> & Required<Pick<VariantProps<T>, K>>;

const valueToString = <T extends unknown>(value: T): string => {
	return value?.toString() || '';
};

export const cvu = <T>(
	base?: ClassValue,
	variantsConfig?: VariantsConfig<T>,
): VariantClassNameFn<T> => {
	const { variants, defaultVariants, compoundVariants } = variantsConfig || {};

	return (variantProps, className) => {
		if (!variants) {
			return clsx(base, className);
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
				Object.entries(variantProps).filter(([, value]) => value !== undefined),
			);

		const compoundVariantClassNames: ClassValue[] | undefined =
			compoundVariants?.reduce<ClassValue[]>(
				(acc, { className: compoundClassName, ...compoundVariantOptions }) => {
					return Object.entries(compoundVariantOptions).every(
						([key, value]) => {
							const o = {
								...defaultVariants,
								...variantPropsWithoutUndefined,
							};
							const v = o[key];

							return Array.isArray(value) && v != null
								? value.includes(v)
								: v === value;
						},
					)
						? [...acc, compoundClassName]
						: acc;
				},
				[],
			);

		return clsx(base, variantClassNames, compoundVariantClassNames, className);
	};
};

export { clsx as cx };

export default cvu;
