/**
 * A fluid size as the web writes it: the two ends of its `clamp()`, in rem.
 * The web grows from `min` on a phone to `max` on a wide screen.
 */
export type FluidSize = readonly [min: number, max: number];
/**
 * The type scale, shared by every theme — `--font-size-*` in
 * `ratio-ui/src/tokens/typography.css`.
 * @beta May change before release.
 */
export declare const fontSize: {
    readonly xs: readonly [0.75, 0.81];
    readonly sm: readonly [0.88, 0.96];
    readonly base: readonly [1, 1.13];
    readonly lg: readonly [1.13, 1.27];
    readonly xl: readonly [1.27, 1.42];
    readonly '2xl': readonly [1.42, 1.6];
    readonly '3xl': readonly [1.6, 1.8];
    readonly '4xl': readonly [1.8, 2.03];
    readonly '5xl': readonly [2.03, 2.28];
    readonly '6xl': readonly [2.28, 2.57];
};
/**
 * The space scale, shared by every theme — `--space-*` in
 * `ratio-ui/src/tokens/spacing.css`. Single steps only; the web's
 * `--space-s-m` pairs are fluid ranges a fixed layout has no use for.
 * @beta May change before release.
 */
export declare const space: {
    readonly '3xs': readonly [0.25, 0.25];
    readonly '2xs': readonly [0.4375, 0.5];
    readonly xs: readonly [0.6875, 0.75];
    readonly s: readonly [0.875, 1];
    readonly m: readonly [1.3125, 1.5];
    readonly l: readonly [1.75, 2];
    readonly xl: readonly [2.625, 3];
    readonly '2xl': readonly [3.5, 4];
    readonly '3xl': readonly [5.25, 6];
};
export type FontSizeStep = keyof typeof fontSize;
export type SpaceStep = keyof typeof space;
//# sourceMappingURL=scale.d.ts.map