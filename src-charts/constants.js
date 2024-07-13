// Dialogs
export const TABLE_CHART_CONFIG_DIALOG = ["Enter chart type to create:", {
    inputs: [
        {
            label: "Chart type",
            type: "select",
            options: [
                { label: "Bar", value: "bar"},
                { label: "Line", value: "line"},
                { label: "Pie", value: "pie"},
                { label: "Doughnut", value: "doughnut"}
            ],
            value: "bar"
        },
        {
          label: "Data Source",
          type: "note",
          value: ""
        },
        {
            label: "Header (optional)",
            type: "text",
            value: ""
        },
        {
            label: "TableIndex",
            type: "text",
            value: "0"
        },
        {
            label: "Horizontal (category) axis labels",
            type: "select",
            options: [
                { label: "First column", value: "first column"},
                { label: "First row", value: "first row"}
            ],
            value: "first column"
        },
        {
            label: "Start from zero?",
            type: "checkbox",
            value: false
        }
    ]
}];

// Other constants
export const CHARTS_PLUGIN_VERSION = "1.0.1";
