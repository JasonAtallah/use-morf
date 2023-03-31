import validator from 'validator';
import { Value } from './use-morf';

interface Rule {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testFn: (input: any) => boolean;
  message: string;
}

export type Rules = Rule[];

interface StrictRule extends Rule {
  testFn: (i: Value) => boolean;
}

export type StrictRules = StrictRule[];

export const Validators = {
  notLessThanZero: {
    testFn: (i: number) => i < 0,
    message: 'Cannot be less than 0',
  },
  requiredStr: {
    testFn: (i: string) => !i,
    message: 'Required',
  },
  isEmail: {
    testFn: (i: string) => (i ? !validator.isEmail(i) : false),
    message: 'Must be a valid email address',
  },
  isPhoneNumber: {
    testFn: (i: string) => (i ? !validator.isMobilePhone(i) : false),
    message: 'Must be a valid phone number',
  },
};
