---
'@eventuras/ratio-ui': patch
---

Bureau theme: also sets `--radius-xs`, `--radius-md`, `--radius-2xl`, `--radius-3xl` and `--radius-overlay`. Before this, components that use `rounded-md` or `rounded-2xl` kept the standard theme's soft corners in bureau, and so did Dialog and Drawer panels. That includes Accordion, NavTree, Select, Toast and Announcement. They now get bureau's hard edge.
