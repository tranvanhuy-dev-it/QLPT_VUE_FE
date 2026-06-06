export default {
  name: "FormButton",
  inheritAttrs: false,
  props: {
    type: {
      type: String,
      default: "button",
    },
    variant: {
      type: String,
      default: "primary", // primary, secondary, danger, outline, custom
    },
    size: {
      type: String,
      default: "md", // sm, md
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const variantStyles = {
      primary: "bg-primary text-white hover:bg-primary-hover",
      secondary: "border border-border-main text-text-main hover:bg-slate-100 dark:hover:bg-slate-800",
      outline: "border border-border-main text-text-main hover:bg-slate-100 dark:hover:bg-slate-800",
      danger: "bg-danger text-white hover:bg-red-600",
      custom: "",
    };

    return {
      variantStyles,
    };
  },
};
