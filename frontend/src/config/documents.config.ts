export const DOCUMENT_LIST_COLUMNS = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'indicators', label: 'Indicators', sortable: false },
    { key: 'size', label: 'Size', sortable: false },
    { key: 'lastModified', label: 'Modified', sortable: true },
] as const;
