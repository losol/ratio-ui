import React, { useEffect, useState } from 'react';

/* Theme axes (see docs/bureau-theme-spec.md):
   - standard theme carries palette + mode in one attr: data-theme="light|dark"
   - named themes (bureau) split them: data-theme="bureau" + data-color-scheme
   The cycle below walks the variants we want to eyeball in Storybook. */
type Variant = {
  label: string;
  theme: string;
  colorScheme?: 'light' | 'dark';
};

const VARIANTS: Variant[] = [
  { label: '🌙 Dark', theme: 'dark' },
  { label: '☀️ Light', theme: 'light' },
  { label: '🗂️ Bureau', theme: 'bureau', colorScheme: 'light' },
  { label: '🗂️ Bureau dark', theme: 'bureau', colorScheme: 'dark' },
];

const apply = (v: Variant) => {
  const root = document.documentElement;
  root.setAttribute('data-theme', v.theme);
  if (v.colorScheme) {
    root.setAttribute('data-color-scheme', v.colorScheme);
  } else {
    root.removeAttribute('data-color-scheme');
  }
};

export const ModeDecorator = (Story: any, context: any) => {
  const noPadding = context?.parameters?.noPadding === true;
  const [index, setIndex] = useState(0);
  const variant = VARIANTS[index];

  const next = () => setIndex((i) => (i + 1) % VARIANTS.length);

  useEffect(() => {
    apply(variant);
  }, [variant]);

  return (
    <>
      <button
        onClick={next}
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          zIndex: 9999,
          padding: '2px 8px',
          backgroundColor: '#333',
          color: '#fff',
          border: '1px solid #ccc',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {variant.label}
      </button>
      <div
        data-theme={variant.theme}
        data-color-scheme={variant.colorScheme}
        style={{
          minWidth: '100%',
          backgroundColor: 'var(--surface)',
          color: 'var(--text)',
          padding: noPadding ? '0' : '2rem',
        }}
      >
        <Story />
      </div>
    </>
  );
};
