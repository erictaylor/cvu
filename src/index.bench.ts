import { cvu } from './index';
import { bench } from 'vitest';

bench('cvu', () => {
	const buttonVariants = cvu('p-2', {
		variants: {
			intent: {
				primary: 'bg-blue-500',
				secondary: 'bg-gray-500',
			},
			size: {
				sm: 'text-sm',
				md: 'text-md',
				lg: 'text-lg',
			},
			rounded: {
				true: 'rounded',
			},
		},
		defaultVariants: {
			intent: 'secondary',
			size: 'md',
		},
		compoundVariants: [
			{
				intent: 'primary',
				size: 'lg',
				className: 'font-bold',
			},
		],
	});

	buttonVariants({}, 'special-class');
});
