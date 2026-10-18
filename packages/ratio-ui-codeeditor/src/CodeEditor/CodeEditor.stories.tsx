// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useState } from 'react';
import { keymap } from '@codemirror/view';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CodeEditor, type EditorDiagnostic } from './CodeEditor';

/**
 * A CodeMirror 6 editor wearing ratio-ui — spike for the FHIR-resource editor:
 * write a JSON/XML resource, upload it, and see the server's `OperationOutcome`
 * as **inline diagnostics** (squiggles + gutter marks). Colors follow the app's
 * light/dark mode; toggle it to compare.
 */
const meta = {
  title: 'Code/CodeEditor',
  component: CodeEditor,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { value: '' },
} satisfies Meta<typeof CodeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const FHIR_PATIENT_JSON = `{
  "resourceType": "Patient",
  "id": "example",
  "active": true,
  "name": [
    {
      "use": "official",
      "family": "Chalmers",
      "given": ["Peter", "James"]
    }
  ],
  "gender": "unknown-value",
  "birthDate": "1974-12-25"
}`;

// As if mapped from a FHIR OperationOutcome (line numbers → editor positions).
const FHIR_JSON_ISSUES: EditorDiagnostic[] = [
  {
    line: 12,
    severity: 'error',
    message:
      'Patient.gender: "unknown-value" is not valid — required binding administrative-gender (male | female | other | unknown).',
  },
  {
    line: 5,
    severity: 'warning',
    message: 'Patient.name: consider adding a text representation (name.text) for display.',
  },
];

const FHIR_PATIENT_XML = `<Patient xmlns="http://hl7.org/fhir">
  <id value="example"/>
  <active value="true"/>
  <name>
    <use value="official"/>
    <family value="Chalmers"/>
    <given value="Peter"/>
  </name>
  <gender value="unknown-value"/>
  <birthDate value="1974-12-25"/>
</Patient>`;

const FHIR_XML_ISSUES: EditorDiagnostic[] = [
  {
    line: 9,
    severity: 'error',
    message: 'Patient.gender: "unknown-value" is not in the required value set (administrative-gender).',
  },
];

const TS_SAMPLE = `import type { EditorDiagnostic } from '@eventuras/ratio-ui-codeeditor';

// Map a FHIR OperationOutcome issue to an inline editor diagnostic.
export function toDiagnostic(issue: {
  severity: 'error' | 'warning' | 'information';
  diagnostics?: string;
  line: number;
}): EditorDiagnostic {
  return {
    line: issue.line,
    severity: issue.severity === 'information' ? 'info' : issue.severity,
    message: issue.diagnostics ?? 'Validation issue',
  };
}`;

/** FHIR Patient (JSON) with a validation error + a warning shown inline. */
export const FhirJson: Story = {
  render: function FhirJsonStory() {
    const [value, setValue] = useState(FHIR_PATIENT_JSON);
    return (
      <div style={{ maxWidth: 760 }}>
        <CodeEditor
          value={value}
          onChange={setValue}
          language="json"
          diagnostics={FHIR_JSON_ISSUES}
          aria-label="FHIR Patient resource (JSON)"
        />
      </div>
    );
  },
};

/** The same resource as FHIR XML, with an inline validation error. */
export const FhirXml: Story = {
  render: function FhirXmlStory() {
    const [value, setValue] = useState(FHIR_PATIENT_XML);
    return (
      <div style={{ maxWidth: 760 }}>
        <CodeEditor
          value={value}
          onChange={setValue}
          language="xml"
          diagnostics={FHIR_XML_ISSUES}
          aria-label="FHIR Patient resource (XML)"
        />
      </div>
    );
  },
};

/** TypeScript — showing js/ts highlighting in the same ratio-ui theme. */
export const TypeScript: Story = {
  render: function TypeScriptStory() {
    const [value, setValue] = useState(TS_SAMPLE);
    return (
      <div style={{ maxWidth: 760 }}>
        <CodeEditor value={value} onChange={setValue} language="ts" aria-label="TypeScript example" />
      </div>
    );
  },
};

/**
 * Controlled: the count follows each edit through `onChange`, and Reset puts
 * a new `value` in from outside, which the editor takes without reporting it
 * back as an edit.
 */
export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState('{ "a": 1 }');
    const [edits, setEdits] = useState(0);
    return (
      <div className="flex flex-col gap-3">
        <CodeEditor
          value={value}
          onChange={(v) => {
            setValue(v);
            setEdits((n) => n + 1);
          }}
          aria-label="JSON"
        />
        <div className="flex items-center gap-3 text-sm">
          <button type="button" className="rounded border px-2 py-1" onClick={() => setValue('{ "reset": true }')}>
            Reset
          </button>
          <span data-testid="state">
            {value.length} characters, {edits} edits
          </span>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole('textbox', { name: 'JSON' });
    await userEvent.click(editor);
    await userEvent.keyboard('{End} ');
    await waitFor(() => expect(canvas.getByTestId('state')).toHaveTextContent('11 characters, 1 edits'));
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(editor).toHaveTextContent('{ "reset": true }'));
    // Taken from outside: not counted as an edit.
    expect(canvas.getByTestId('state')).toHaveTextContent('17 characters, 1 edits');
  },
};

const PYTHON_SAMPLE = `def fizzbuzz(n):
    for i in range(1, n + 1):
        if i % 15 == 0:
            print("FizzBuzz")
        elif i % 3 == 0:
            print("Fizz")
        elif i % 5 == 0:
            print("Buzz")
        else:
            print(i)


fizzbuzz(15)`;

/**
 * Python, four spaces a level. Tab indents (Escape, then Tab, moves on), and
 * `extensions` adds a keymap: Ctrl+Enter (Cmd+Enter on a Mac) "runs" the code,
 * here by counting the lines. A traceback's line goes in as a diagnostic.
 */
export const Python: Story = {
  render: function PythonStory() {
    const [value, setValue] = useState(PYTHON_SAMPLE);
    const [ran, setRan] = useState<string | null>(null);
    const [run] = useState(() => keymap.of([{ key: 'Mod-Enter', run: (view) => (setRan(`${view.state.doc.lines} lines`), true) }]));
    return (
      <div className="flex flex-col gap-2">
        <CodeEditor
          value={value}
          onChange={setValue}
          language="python"
          aria-label="Program"
          extensions={[run]}
          diagnostics={[{ line: 13, severity: 'info', message: 'Ran to the end: 15 lines printed.' }]}
        />
        <p className="m-0 text-sm text-(--text-muted)" data-testid="ran">
          {ran ? `Ran: ${ran}` : 'Ctrl+Enter to run.'}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole('textbox', { name: 'Program' });
    await userEvent.click(editor);
    // Tab indents: the line gains four spaces, and the focus stays.
    await userEvent.keyboard('{Control>}{Home}{/Control}{Tab}');
    await waitFor(() => expect(editor.querySelector('.cm-line')?.textContent).toBe('    def fizzbuzz(n):'));
    expect(editor).toHaveFocus();
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    await waitFor(() => expect(canvas.getByTestId('ran')).toHaveTextContent('Ran: 13 lines'));
  },
};

/**
 * The syntax colours follow the nearest scope: the same JSON on a light band
 * and a dark band, whatever the page's mode.
 */
export const SurfaceContexts: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="surface-light rounded-xl bg-(--surface) p-4" data-testid="light">
        <CodeEditor value={'{ "mode": "light" }'} aria-label="On a light band" readOnly />
      </div>
      <div className="surface-dark rounded-xl bg-(--surface) p-4" data-testid="dark">
        <CodeEditor value={'{ "mode": "dark" }'} aria-label="On a dark band" readOnly />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const colorOf = (band: string, text: string) => {
      const span = [...canvas.getByTestId(band).querySelectorAll<HTMLElement>('.cm-line span')].find(
        (el) => el.textContent === text,
      );
      return span ? getComputedStyle(span).color : null;
    };
    await waitFor(() => expect(colorOf('light', '"light"')).toBe('rgb(10, 124, 66)'));
    expect(colorOf('dark', '"dark"')).toBe('rgb(126, 231, 135)');
  },
};
