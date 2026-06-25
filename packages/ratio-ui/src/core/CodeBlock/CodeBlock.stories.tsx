import { Meta, StoryFn } from '@storybook/react-vite';
import { CodeBlock } from './CodeBlock';

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
  "instructor": { "ref": "Practitioner/ada-l" }
}`;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<event id="evt_019ea2ce">
  <title>Intro to Recursion</title>
  <capacity>30</capacity>
  <tags>
    <tag>course</tag>
    <tag>beginner</tag>
  </tags>
</event>`;

export const TypeScript = Template.bind({});
TypeScript.args = { code: ts, language: 'TypeScript', filename: 'create-event.ts' };

export const Json = Template.bind({});
Json.args = { code: json, language: 'JSON', filename: 'event.json' };

export const Xml = Template.bind({});
Xml.args = { code: xml, language: 'XML', filename: 'event.xml' };

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
