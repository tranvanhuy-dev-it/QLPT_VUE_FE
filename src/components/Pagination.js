export default {
  name: "Pagination",
  props: {
    page: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    totalElements: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "mục",
    },
  },
  emits: ["change-page"],
  setup(props, { emit }) {
    const onPageChange = (newPage) => {
      if (newPage >= 0 && newPage < props.totalPages) {
        emit("change-page", newPage);
      }
    };

    return {
      onPageChange,
    };
  },
};
