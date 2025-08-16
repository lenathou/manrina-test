import { ProductTableBody } from './Body';
import { ProductTableCell } from './Cell';
import { ProductTableHeader } from './Header';
import { ProductTableHeaderCell } from './HeaderCell';
import { ProductTableHeaderRow } from './HeaderRow';
import { ProductTableRow } from './Row';
import { ProductTable as InternalProductTable } from './Table';

type InternalProductTableType = typeof InternalProductTable;
interface IProductTable extends InternalProductTableType {
    Row: typeof ProductTableRow;
    Cell: typeof ProductTableCell;
    Body: typeof ProductTableBody;
    Header: typeof ProductTableHeader;
    HeaderRow: typeof ProductTableHeaderRow;
    HeaderCell: typeof ProductTableHeaderCell;
}

export const ProductTable = InternalProductTable as IProductTable;
ProductTable.Row = ProductTableRow;
ProductTable.Cell = ProductTableCell;
ProductTable.Body = ProductTableBody;
ProductTable.Header = ProductTableHeader;
ProductTable.HeaderRow = ProductTableHeaderRow;
ProductTable.HeaderCell = ProductTableHeaderCell;
