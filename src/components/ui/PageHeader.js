export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    showAdd: {
      type: Boolean,
      default: false
    },
    addText: {
      type: String,
      default: 'Thêm mới'
    },
    disableAdd: {
      type: Boolean,
      default: false
    },
    showExport: {
      type: Boolean,
      default: false
    },
    showImport: {
      type: Boolean,
      default: false
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    searchPlaceholder: {
      type: String,
      default: 'Tìm kiếm...'
    },
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: [
    'update:modelValue',
    'add-click',
    'export-click',
    'import-click'
  ]
};
