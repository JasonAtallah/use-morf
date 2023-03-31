import { useMorf, Validators } from '@morf/use-morf';

export default function App() {
  const { props, values, reset, valid, controls } = useMorf({
    name: {
      type: 'text',
      label: 'Name',
      defaultValue: 'John Doe',
      rules: [Validators.requiredStr, Validators.isEmail],
    },
    age: {
      type: 'number',
      defaultValue: 0,
      rules: [Validators.notLessThanZero],
    },
  });

  const submit = () => {
    if (valid()) {
      console.log(values);
    }
  };

  return (
    <div>
      <div>
        name: <input {...props.name} type="text" />
        {controls.name.errors}
      </div>
      <div>
        age: <input {...props.age} type="number" />
        {controls.age.errors}
      </div>
      <button onClick={reset}>Reset</button>
      <button onClick={submit}>Submit</button>

      <div>controls: {JSON.stringify(controls)}</div>
      <div>values: {JSON.stringify(values)}</div>
    </div>
  );
}
