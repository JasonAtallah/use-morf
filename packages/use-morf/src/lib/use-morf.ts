import { ChangeEvent, useMemo, useState } from 'react';
import { Rules, StrictRules } from './validators';

export type Value = number | string | boolean | Date | null | undefined;

type FormControlType = 'text' | 'number';

interface FormControlSetup {
  label?: string;
  type?: FormControlType;
  defaultValue?: Value;
  rules?: Rules;
}

type FormSetup = { [key: string]: FormControlSetup };

interface FormControl {
  label: string;
  value: Value;
  dirty: boolean;
  rules: StrictRules;
  errors: string[];
  valid: boolean;
}

interface FormControlProps {
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  defaultValue?: string | number | undefined;
}

type FormControls = { [key: string]: FormControl };

interface FormInstance {
  props: {
    [key: string]: FormControlProps;
  };
  controls: FormControls;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any;
  valid: () => boolean;
  markAsDirty: (controlName: string) => void;
  markAsClean: (controlName: string) => void;
  markAllAsDirty: () => void[];
  markAllAsClean: () => void[];
  setValue: (controlName: string, value: Value) => void;
  reset: () => void;
}

const getErrors = (rules: StrictRules, value: Value) => {
  const errors: string[] = [];

  for (const rule of rules) {
    if (rule.testFn(value)) {
      errors.push(rule.message);
    }
  }

  return errors;
};

const convertValueToType = (value: Value, type: FormControlType = 'text') => {
  let castedValue = value;

  switch (type) {
    case 'number':
      castedValue = Number(value);
      break;
    case 'text':
      castedValue = String(value);
      break;
    default:
      castedValue = String(value);
  }

  return castedValue;
};

export function useMorf(setup: FormSetup): FormInstance {
  const createInitialControls = () => {
    const initialControls: FormControls = {};

    for (const controlName in setup) {
      const control = setup[controlName];
      const rules = control.rules || [];
      const value = control.defaultValue;

      initialControls[controlName] = {
        label: control.label ?? controlName,
        value,
        dirty: false,
        rules,
        errors: [],
        valid: !getErrors(rules, value).length,
      };
    }

    return initialControls;
  };

  const [controls, setControls] = useState<FormControls>(
    createInitialControls()
  );

  const values: unknown = useMemo(
    () =>
      Object.keys(controls).reduce((acc: { [key: string]: Value }, cur) => {
        acc[cur] = controls[cur].value;
        return acc;
      }, {}),
    [controls]
  );

  const props = useMemo(
    () =>
      Object.keys(setup).reduce(
        (acc: { [key: string]: FormControlProps }, controlName) => {
          const onChange = (e: ChangeEvent<HTMLInputElement>) => {
            setValue(controlName, e.target.value);
          };

          const { defaultValue } = setup[controlName];

          acc[controlName] = {
            onChange,
            onFocus: () => markAsDirty(controlName),
          };

          if (defaultValue) {
            acc[controlName].defaultValue = convertValueToType(
              defaultValue,
              setup[controlName].type
            );
          }

          return acc;
        },
        {}
      ),
    [setup]
  );

  const markAsDirty = (controlName: string) => {
    const newControls = { ...controls };
    newControls[controlName].dirty = true;
    const rules = controls[controlName].rules;
    const errors = getErrors(rules, newControls[controlName].value);

    newControls[controlName].errors = errors;
    newControls[controlName].valid = !errors.length;
    setControls(newControls);
  };

  const markAsClean = (controlName: string) => {
    const newControls = { ...controls };
    newControls[controlName].dirty = false;
    setControls(newControls);
  };

  const markAllAsDirty = () =>
    Object.keys(controls).map(controlName => markAsDirty(controlName));

  const markAllAsClean = () =>
    Object.keys(controls).map(controlName => markAsClean(controlName));

  const setValue = (controlName: string, value: Value) => {
    const newControls = { ...controls };
    newControls[controlName].value = convertValueToType(
      value,
      setup[controlName].type
    );
    markAsDirty(controlName);
    setControls(newControls);
  };

  const reset = () => setControls(createInitialControls());

  const valid = () => {
    for (const controlName in controls) {
      if (!controls[controlName].dirty) markAsDirty(controlName);
      if (!controls[controlName].valid) return false;
    }

    return true;
  };

  return {
    props,
    controls,
    values,
    valid,

    markAsDirty,
    markAsClean,
    markAllAsDirty,
    markAllAsClean,

    setValue,
    reset,
  };
}
