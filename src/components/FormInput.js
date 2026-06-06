export default {
  name: "FormInput",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number],
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
    label: {
      type: String,
      default: "",
    },
    placeholder: {
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
    readonly: {
      type: Boolean,
      default: false,
    },
    min: {
      type: [Number, String],
      default: undefined,
    },
    max: {
      type: [Number, String],
      default: undefined,
    },
    step: {
      type: [Number, String],
      default: undefined,
    },
    size: {
      type: String,
      default: "md", // "sm" or "md"
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const onInput = (event) => {
      let val = event.target.value;
      if (props.type === "number") {
        val = val === "" ? null : Number(val);
      }
      emit("update:modelValue", val);
    };

    return {
      onInput,
    };
  },
};
