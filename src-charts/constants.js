// Dialogs
export const TABLE_CHART_CONFIG_DIALOG = ["Enter chart type to create:", {
    inputs: [
        {
            label: "Chart type",
            type: "select",
            options: [
                { label: "Bar", value: "bar"},
                { label: "Line", value: "line"},
                { label: "Area", value: "area"},
                { label: "Pie", value: "pie"},
                { label: "Doughnut", value: "doughnut"},
                { label: "Polar Area", value: "polarArea"},
            ],
            value: "bar"
        },
        {
          label: "Data Source",
          type: "note",
          value: ""
        },
        {
            label: "Chart Title (optional)",
            type: "text",
            value: ""
        },
        {
            label: "Table Index in Note",
            type: "text",
            value: "0"
        },
        {
            label: "Horizontal (category) axis labels direction",
            type: "select",
            options: [
                { label: "Column", value: "column"},
                { label: "Row", value: "row"}
            ],
            value: "row"
        },
        {
            label: "Start from zero?",
            type: "checkbox",
            value: false
        },
        {
            label: "Chart aspect ratio size",
            type: "select",
            options: [
                { label: "1 (not recommended)", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" }
            ],
            value: "2"
        }
    ]
}];

// Other constants
export const CHARTS_PLUGIN_VERSION = "1.0.1";

