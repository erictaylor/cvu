import clsx, { type ClassValue } from 'clsx';

type ConfigWrapperProps = {
	cx: (...inputs: Parameters<typeof clsx>) => ReturnType<typeof clsx>;
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

export type VariantProps<T extends VariantClassNameFn<ConfigSchema>> = Exclude<
	Parameters<T>[0],
	undefined
>;

export type VariantPropsWithRequired<
	T extends VariantClassNameFn<ConfigSchema>,
	K extends keyof VariantProps<T>,
> = VariantProps<T> & Required<Pick<VariantProps<T>, K>>;

export type ClassVariantUtility = <T>(
	base?: ClassValue,
	variantsConfig?: VariantsConfig<T>,
) => VariantClassNameFn<T>;

const valueToString = <T>(value: T): string => {
	return value?.toString() || '';
};

export const config =
	({ cx }: ConfigWrapperProps): ClassVariantUtility =>
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
						} else {
							return acc;
						}
					},
					[],
				);

			return cx(base, variantClassNames, compoundVariantClassNames, className);
		};
	};

export const cx = clsx;

export const cvu = config({ cx });

export default cvu;
