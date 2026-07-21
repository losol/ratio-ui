import { Meta, StoryFn } from '@storybook/react-vite';
import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { CodeBlock, type CodeAnnotation } from './CodeBlock';
import { ToggleButtonGroup } from '../ToggleButtonGroup';
// Cross-layer import is fine here: this is a story (a composition demo), not
// part of CodeBlock's shipped graph — CodeBlock itself never imports `forms`.
import { Select } from '../../forms/Select';

const meta: Meta<typeof CodeBlock> = {
  title: 'Core/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

const Template: StoryFn<typeof CodeBlock> = (args) => (
  <div style={{ maxWidth: 720 }}>
    <CodeBlock {...args} />
  </div>
);

const ts = `import { defineConfig } from "./core";

export interface EventOptions {
  title: string;
  startsAt: Date;
  capacity?: number;
}

export function createEvent(opts: EventOptions) {
  return defineConfig({ ...opts, id: crypto.randomUUID() });
}`;

const json = `{
  "resourceType": "Event",
  "id": "evt_019ea2ce",
  "title": "Intro to Recursion",
  "capacity": 30,
  "tags": ["course", "beginner"],
  "instructor": { "ref": "Practitioner/ada-l" },
  "prerequisite": { "ref": "Event/evt_019ea2ce" }
}`;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<event id="evt_019ea2ce">
  <title>Intro to Recursion</title>
  <capacity>30</capacity>
  <tags>
    <tag>course</tag>
    <tag>beginner</tag>
  </tags>
  <!-- To attend Intro to Recursion, first attend Intro to Recursion. -->
  <prerequisite ref="Event/evt_019ea2ce" />
</event>`;

export const TypeScript = Template.bind({});
TypeScript.args = { code: ts, language: 'TypeScript', filename: 'create-event.ts' };

export const Json = Template.bind({});
Json.args = { code: json, language: 'JSON', filename: 'event.json' };

export const Xml = Template.bind({});
Xml.args = { code: xml, language: 'XML', filename: 'event.xml' };

const reviewNotes: CodeAnnotation[] = [
  {
    line: 5,
    severity: 'warning',
    code: 'soft-limit',
    path: 'Event.capacity',
    message:
      'Capacity is above the default room size of 24. Anyone past that is waitlisted rather than enrolled.',
  },
  {
    line: 7,
    severity: 'info',
    code: 'resolved',
    path: 'Event.instructor.ref',
    message: 'Resolved to Ada Lovelace — the reference points at an existing Practitioner.',
  },
  {
    line: 8,
    severity: 'error',
    code: 'circular-ref',
    path: 'Event.prerequisite.ref',
    message:
      'An event cannot be its own prerequisite: this reference points back at evt_019ea2ce, the resource being defined. Point it at the event learners should take first.',
  },
];

/**
 * Notes rendered inline, each beneath the line it refers to — validator output,
 * review comments, explanations. They stay visible instead of hiding behind a
 * hover target, so long messages get room to wrap and the whole set is scannable
 * (and screenshot-able) at a glance.
 */
export const Annotations = Template.bind({});
Annotations.args = {
  code: json,
  language: 'JSON',
  filename: 'event.json',
  annotations: reviewNotes,
};

export const Collapsed = Template.bind({});
Collapsed.args = { code: ts, language: 'TypeScript', filename: 'create-event.ts', startCollapsed: true };

export const Wrapped = Template.bind({});
Wrapped.args = {
  code: `const message = "This is a deliberately very long single line of code that would otherwise scroll horizontally forever and ever until you turn on word wrap to make it readable.";`,
  language: 'TypeScript',
  wrap: true,
};

export const ShowMore = Template.bind({});
ShowMore.args = {
  code: Array.from({ length: 24 }, (_, i) => `line ${i + 1}: const value${i} = ${i} * 2;`).join('\n'),
  language: 'TypeScript',
  filename: 'long.ts',
  showMore: true,
  maxLines: 8,
};

export const Minimal = Template.bind({});
Minimal.args = {
  code: json,
  language: 'JSON',
  showHeader: false,
  showLineNumbers: false,
};

// —— Language selector plugged into the header via `languageSelector` ——
// The same greeting in four languages, so the switch reads as "one idea,
// different syntaxes" rather than filler.

const greetJs = `export function greet(name) {
  return \`Hello, \${name}!\`;
}`;

const greetTs = `export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}`;

const greetCs = `public static string Greet(string name) =>
    $"Hello, {name}!";`;

const greetPy = `def greet(name: str) -> str:
    return f"Hello, {name}!"`;

/**
 * A few languages → a `ToggleButtonGroup` in the header slot. The story owns
 * the selection and swaps `code`; `CodeBlock` just renders whatever selector
 * you hand it.
 */
export const WithLanguageToggle: StoryFn<typeof CodeBlock> = () => {
  const samples = {
    json: { code: json, label: 'JSON' },
    xml: { code: xml, label: 'XML' },
  } as const;
  type Lang = keyof typeof samples;
  const [selected, setSelected] = useState<Set<Key>>(() => new Set<Key>(['json']));
  const current = (([...selected][0] ?? 'json') as Lang);
  const active = samples[current];

  return (
    <div style={{ maxWidth: 720 }}>
      <CodeBlock
        code={active.code}
        language={active.label}
        filename={`event.${current}`}
        languageSelector={
          <ToggleButtonGroup
            size="sm"
            aria-label="Language"
            disallowEmptySelection
            selectedKeys={selected}
            onSelectionChange={setSelected}
            options={[
              { value: 'json', label: 'JSON' },
              { value: 'xml', label: 'XML' },
            ]}
          />
        }
      />
    </div>
  );
};

/**
 * Many languages → a `Select` in the header slot. Same wiring; the consumer
 * picks whichever control fits the option count.
 */
export const WithLanguageSelect: StoryFn<typeof CodeBlock> = () => {
  const samples = {
    javascript: { code: greetJs, label: 'JavaScript' },
    typescript: { code: greetTs, label: 'TypeScript' },
    csharp: { code: greetCs, label: 'C#' },
    python: { code: greetPy, label: 'Python' },
  } as const;
  type Lang = keyof typeof samples;
  const [lang, setLang] = useState<Lang>('typescript');
  const active = samples[lang];

  return (
    <div style={{ maxWidth: 720 }}>
      <CodeBlock
        code={active.code}
        language={active.label}
        languageSelector={
          <div style={{ width: 170 }}>
            <Select
              aria-label="Language"
              value={lang}
              onSelectionChange={(v) => setLang(v as Lang)}
              options={[
                { value: 'javascript', label: 'JavaScript' },
                { value: 'typescript', label: 'TypeScript' },
                { value: 'csharp', label: 'C#' },
                { value: 'python', label: 'Python' },
              ]}
            />
          </div>
        }
      />
    </div>
  );
};
