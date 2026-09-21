import { useState, useRef } from "react";
import { validateForm } from "@/lib/validation";

export function useForm(initialValues, schema) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const initialValuesRef = useRef(initialValues);

  const validate = (field) => {
    const result = validateForm(schema, values);
    if (field) {
      const fieldError = result.errors[field];
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
      return !fieldError;
    } else {
      setErrors(result.errors);
      return result.valid;
    }
  };

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (!isDirty) {
      setIsDirty(true);
    }
    if (errors[field]) {
      validate(field);
    }
  };

  const handleSubmit = async (onSubmit) => {
    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValuesRef.current);
    setErrors({});
    setIsDirty(false);
  };

  const setValuesAndValidate = (newValues) => {
    setValues(newValues);
    validate();
  };

  return {
    values,
    errors,
    isSubmitting,
    isDirty,
    handleChange,
    handleSubmit,
    validate,
    reset,
    setValues,
    setValuesAndValidate,
  };
}

export function useField(initialValue, validateFn) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [isTouched, setIsTouched] = useState(false);

  const handleChange = (newVal) => {
    setValue(newVal);
    if (isTouched && validateFn) {
      const err = validateFn(newVal);
      setError(err);
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
    if (validateFn) {
      const err = validateFn(value);
      setError(err);
    }
  };

  const reset = () => {
    setValue(initialValue);
    setError("");
    setIsTouched(false);
  };

  return { value, error, isTouched, handleChange, handleBlur, reset };
}
