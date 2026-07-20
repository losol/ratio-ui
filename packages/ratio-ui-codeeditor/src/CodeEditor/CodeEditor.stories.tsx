// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
