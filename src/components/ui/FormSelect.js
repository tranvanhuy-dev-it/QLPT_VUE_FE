export default {
  name: "FormSelect",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number, Boolean],
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: "md", // "sm" or "md"
    },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    const onChange = (event) => {
      let val = event.target.value;
      // Handle standard boolean or number values if they look like it, but generally keep as is.
      // E.g. if the option value is explicitly "true" or "false" in model, or numbers.
      // But standard Vue v-model on select handles this automatically by looking at the option's value binding.
      // Since we bound :value="modelValue" on select, event.target.value will be a string.
      // To correctly match type:
      if (val === "null" || val === "undefined") {
        val = null;
      } else if (typeof props.modelValue === "boolean") {
        val = val === "true";
      } else if (typeof props.modelValue === "number") {
        val = val === "" ? null : Number(val);
      }
      emit("update:modelValue", val);
      emit("change", val);
    };

    return {
      onChange,
    };
  },
};
