import { computed } from "vue";

export default {
  name: "Modal",
  props: {
    title: {
      type: String,
      default: "",
    },
    maxWidth: {
      type: String,
      default: "md", // sm, md, lg, xl
    },
  },
  emits: ["close"],
  setup(props) {
    const maxWidthClass = computed(() => {
      switch (props.maxWidth) {
        case "sm":
          return "max-w-[400px]";
        case "md":
          return "max-w-[500px]";
        case "lg":
          return "max-w-[650px]";
        case "xl":
          return "max-w-[800px]";
        default:
          return "max-w-[500px]";
      }
    });

    return {
      maxWidthClass,
    };
  },
};
