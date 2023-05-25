import { cvu } from './index';
import { describe, expect, it } from 'vitest';

describe('cvu', () => {
	it('should return a blank string when no arguments are passed', () => {
		const result = cvu();

		expect(result()).toBe('');
	});

	it('should return expected base string class', () => {
		const result = cvu('base');

		expect(result()).toBe('base');
	});

	it('should return expected base array', () => {
		const result = cvu(['hello', 'world', 'foo bar']);

		expect(result()).toBe('hello world foo bar');
	});

	it('should append className argument to end of returned string', () => {
		expect(cvu()(undefined, 'foo')).toBe('foo');

		expect(cvu('base')(undefined, 'foo')).toBe('base foo');

		expect(cvu(['hello', 'world', 'foo bar'])(undefined, 'baz')).toBe(
			'hello world foo bar baz',
		);
	});

	it('should return expected variant string class', () => {
		const result = cvu('base', {
			variants: {
				foo: {
					bar: 'baz',
				},
			},
		});

		expect(result()).toBe('base');
		expect(result({ foo: 'bar' })).toBe('base baz');
		expect(result({ foo: 'bar' }, 'qux')).toBe('base baz qux');
	});

	it('should return expected variant string class with provided variant array', () => {
		const result = cvu('base', {
			variants: {
				foo: {
					bar: ['baz', 'qux'],
				},
			},
		});

		expect(result()).toBe('base');
		expect(result({ foo: 'bar' })).toBe('base baz qux');
		expect(result({ foo: 'bar' }, 'quux')).toBe('base baz qux quux');
	});

	it('should return expected variant string class with default variant', () => {
		const result = cvu('base', {
			defaultVariants: {
				foo: 'bar',
			},
			variants: {
				foo: {
					bar: 'bar',
					baz: ['baz', 'qux'],
				},
			},
		});

		expect(result()).toBe('base bar');
		expect(result(undefined, 'quux')).toBe('base bar quux');

		expect(result({ foo: 'baz' })).toBe('base baz qux');
		expect(result({ foo: 'baz' }, 'quux')).toBe('base baz qux quux');

		expect(result({ foo: null })).toBe('base');
		expect(result({ foo: null }, 'quux')).toBe('base quux');
	});

	it('should return expected string with variants and compound variants', () => {
		const result = cvu('base', {
			defaultVariants: {
				foo: 'bar',
				baz: 'qux',
			},
			variants: {
				foo: {
					bar: 'bar',
					baz: ['baz', 'baz2'],
				},
				baz: {
					qux: 'qux',
					quux: 'quux',
				},
			},
			compoundVariants: [
				{
					foo: 'bar',
					baz: 'qux',
					className: 'foo-bar-baz-qux',
				},
				{
					foo: 'baz',
					baz: 'quux',
					className: 'foo-baz-baz-quux',
				},
			],
		});

		expect(result()).toBe('base bar qux foo-bar-baz-qux');
		expect(result(undefined, 'quux')).toBe('base bar qux foo-bar-baz-qux quux');

		expect(result({ foo: 'baz' })).toBe('base baz baz2 qux');
		expect(result({ baz: 'quux' })).toBe('base bar quux');

		expect(result({ foo: 'baz', baz: 'quux' })).toBe(
			'base baz baz2 quux foo-baz-baz-quux',
		);

		expect(result({ foo: null }, 'quux')).toBe('base qux quux');
	});

	it('should return expected strings with variants and compound components targeting multiple variant conditions', () => {
		const result = cvu('base', {
			variants: {
				intent: {
					primary: 'primary',
					secondary: 'secondary',
				},
				size: {
					small: 'small',
					medium: 'medium',
				},
			},
			compoundVariants: [
				{
					intent: ['primary', 'secondary'],
					size: 'medium',
					className: 'compound-variant',
				},
			],
		});

		expect(result({ intent: 'primary', size: 'small' })).toBe(
			'base primary small',
		);
		expect(result({ intent: 'secondary', size: 'small' })).toBe(
			'base secondary small',
		);

		expect(result({ intent: 'primary', size: 'medium' })).toBe(
			'base primary medium compound-variant',
		);
		expect(result({ intent: 'secondary', size: 'medium' })).toBe(
			'base secondary medium compound-variant',
		);
	});
});
