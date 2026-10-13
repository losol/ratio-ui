import { type FontSizeStep, type SpaceStep } from './scale';
import { type Components, type Font, type Radius, type ScaleStep, type Theme, type ThemeMode } from './theme';
/** One layer of a shadow, its colour an sRGB string and its spread filled in. */
export interface ResolvedShadow {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
}
/** A mode with every colour an sRGB string. */
export type ResolvedMode = Record<keyof ThemeMode, string>;
type ResolvedLayers = readonly ResolvedShadow[] | null;
/** The component tokens of one mode, every shadow resolved in that mode. */
export interface ResolvedComponents {
    button: Omit<Components['button'], 'shadow' | 'pressedShadow'> & {
        shadow: ResolvedLayers;
        pressedShadow: ResolvedLayers;
    };
    card: {
        shadow: Record<'xs' | 'sm' | 'md', ResolvedLayers>;
        hoverShadow: ResolvedLayers;
        featured: Omit<Components['card']['featured'], 'shadow'> & {
            shadow: ResolvedLayers;
        };
    };
    chat: {
        barShadow: ResolvedLayers;
        popoverShadow: ResolvedLayers;
    };
}
export interface ResolvedTheme {
    name: string;
    light: ResolvedMode;
    dark: ResolvedMode;
    radius: Radius;
    font: Font;
    scale: {
        primary: Record<ScaleStep, string>;
        accent: Record<ScaleStep, string>;
    };
    /** Font sizes in points, at the small end of the web's fluid range — a phone's. */
    fontSize: Record<FontSizeStep, number>;
    /** Spacing in points, at the small end of the web's fluid range. */
    space: Record<SpaceStep, number>;
    /** Per mode: a shadow's colour follows the mode it is drawn in. */
    components: {
        light: ResolvedComponents;
        dark: ResolvedComponents;
    };
}
/**
 * The theme as a renderer without a CSS engine reads it: colours as sRGB
 * hex or rgba, references followed inside their own mode, radius, font
 * sizes and spacing in points, fonts by family. Component tokens come per
 * mode, their shadows' colours resolved in it, so a renderer reads the mode
 * it draws in. The authored theme is untouched.
 */
export declare function resolveTheme(theme: Theme): ResolvedTheme;
export {};
//# sourceMappingURL=resolveTheme.d.ts.map