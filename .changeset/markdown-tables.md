---
'@eventuras/markdown-react': minor
'@eventuras/markdown': minor
---

GFM tables get renderer slots. `MarkdownRenderers` gains optional `table`, `tableHead`, `tableBody`, `tableRow`, `tableHeadCell` and `tableCell` slots. Each falls back to the plain element, so existing renderer sets keep working. Column alignment (`:--`, `:-:`, `--:`) reaches the cells as `style.textAlign`.

`ratioRenderers` maps them to the ratio-ui `Table`, `Table.Header`, `Table.Body`, `Table.Row`, `Table.HeadCell` and `Table.Cell`, so markdown tables in `MarkdownContent` are styled, scroll horizontally when wide, and keep their alignment. Before this they fell through as unstyled `<table>` elements.
