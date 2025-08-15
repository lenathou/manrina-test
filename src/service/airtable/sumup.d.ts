declare module 'Sumup' {
    type BaseCsvExport = {
        fileUrl: string;
        id: string;
        itemsCount: number;
    };
    export type StockCSVType = BaseCsvExport;

    export type CSVStockObject = {
        'Item name': string;
        'Variations': string;
        'Option set 1': string;
        'Option 1': string;
        'Option set 2': string;
        'Option 2': string;
        'Option set 3': string;
        'Option 3': string;
        'Option set 4': string;
        'Option 4': string;
        'Is variation visible? (Yes/No)': string;
        'Price': string;
        'On sale in Online Store?': string;
        'Regular price (before sale)': string;
        'Tax rate (%)': string;
        'Track inventory? (Yes/No)': string;
        'Quantity': string;
        'Low stock threshold': string;
        'SKU': string;
        'Barcode': string;
        'Description (Online Store and Invoices only)': string;
        'Category': string;
        'Display colour in POS checkout': string;
        'Image 1': string;
        'Image 2': string;
        'Image 3': string;
        'Image 4': string;
        'Image 5': string;
        'Image 6': string;
        'Image 7': string;
        'Display item in Online Store? (Yes/No)': string;
        'SEO title (Online Store only)': string;
        'SEO description (Online Store only)': string;
        'Shipping weight [kg] (Online Store only)': string;
        'Item id (Do not change)': string;
        'Variant id (Do not change)': string;
        'Valeur par défaut': number;
    };

    export type OrderCSVType = BaseCsvExport;
    export type CSVOrderObject = OrderFields & OrderItemsFields;
    export type OrderFields = {
        'Order': string;
        'Email': string;
        'Date': string;
        'Payment status': string;
        'Paid at': string;
        'Payment method': string;
        'Order status': string;
        'Subtotal': string;
        'Shipping': string;
        'Taxes': string;
        'Total': string;
        'Customer name': string;
        'Customer phone number': string;
        'Shipping address - street': string;
        'Shipping address - street number': string;
        'Shipping address - city': string;
        'Shipping address - zip code': string;
        'Shipping address - country code': string;
        'Shipping method name': string;
        'Shipping method type': string;
        'Message for customer': string;
        'Notes': string;
        'Tracking url': string;
        'Is Archived': string;
    };

    export type OrderItemsFields = {
        'Item name': string;
        'Item variation': string;
        'Item quantity': string;
        'Item price': string;
        'Item Tax rate (%)': string;
    };
}
