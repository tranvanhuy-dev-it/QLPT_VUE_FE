import Pagination from "./Pagination.vue";
import { computed } from "vue";

export default {
  name: "DataTable",
  components: {
    Pagination,
  },
  props: {
    headers: {
      type: Array,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loadingText: {
      type: String,
      default: "Đang tải dữ liệu...",
    },
    emptyText: {
      type: String,
      default: "Không tìm thấy dữ liệu nào.",
    },
    showPagination: {
      type: Boolean,
      default: false,
    },
    page: {
      type: Number,
      default: 0,
    },
    totalPages: {
      type: Number,
      default: 0,
    },
    totalElements: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: "dòng",
    },
    clickable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["change-page", "row-click"],
  setup(props, { emit, attrs }) {

    const resolveKeyPath = (object, path) => {
      if (!object || !path) return "";
      return path.split(".").reduce((acc, part) => acc && acc[part], object);
    };

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return "0";
      return Math.round(amount).toLocaleString("vi-VN");
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    };

    const formatValue = (value, type) => {
      if (value === undefined || value === null) return "";
      if (type === "money") return formatMoney(value) + " đ";
      if (type === "date") return formatDate(value);
      return value;
    };

    const getBadgeClass = (header, value) => {
      if (header.badgeColors && header.badgeColors[value]) {
        return header.badgeColors[value];
      }
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    };

    const getBadgeLabel = (header, value) => {
      if (header.badgeLabels && header.badgeLabels[value]) {
        return header.badgeLabels[value];
      }
      return value;
    };

    const getFormattedValue = (item, header) => {
      if (header.formatter) {
        return header.formatter(item);
      }
      const rawVal = resolveKeyPath(item, header.key);
      let val = formatValue(rawVal, header.type);
      if (header.prefix) val = header.prefix + val;
      if (header.suffix) val = val + header.suffix;
      return val;
    };

    const onChangePage = (newPage) => {
      emit("change-page", newPage);
    };

    const onRowClick = (item) => {
      emit("row-click", item);
    };

    return {
      resolveKeyPath,
      getBadgeClass,
      getBadgeLabel,
      getFormattedValue,
      onChangePage,
      onRowClick,
    };
  },
};
