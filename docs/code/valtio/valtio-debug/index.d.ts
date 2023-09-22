/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */
declare module 'rc-form' {
  export const createForm: Function;
  export interface FormType {
    getFieldsValue: Function;
    getFieldValue: Function;
    getFieldInstance: Function;
    setFieldsValue: Function;
    setFields: Function;
    setFieldsInitialValue: Function;
    getFieldDecorator: Function;
    getFieldProps: Function;
    getFieldsError: Function;
    getFieldError: Function;
    isFieldValidating: Function;
    isFieldsValidating: Function;
    isFieldsTouched: Function;
    isFieldTouched: Function;
    isSubmitting: Function;
    submit: Function;
    validateFields: Function;
    resetFields: Function;
  }
}
