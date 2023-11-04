export let pollTypes = [
  {
    title: 'Calories',
    name: 'calories',
    context: 'food',
    category: 'personal_metric',
    fields: [
      {
        label: 'Count',
        name: 'count',
        type: 'number',
        showValue: false,
      },
      {
        label: 'From',
        name: 'from',
        type: 'text',
        showValue: false,
      },
    ],
  },
  {
    title: 'Weight',
    name: 'weight',
    context: 'body',
    category: 'personal_metric',
    fields: [
      {
        label: 'Lb',
        name: 'value',
        type: 'number',
        showValue: false,
      },
    ],
  },
  {
    title: 'Current Stress',
    name: 'stress',
    context: 'current_time',
    category: 'personal_metric',
    fields: [
      {
        label: '',
        name: 'stress',
        type: 'slider',
        min: 0,
        max: 10,
        showValue: true,
      },
    ],
  },
  {
    title: 'Brain Clearing',
    name: 'clearing',
    message: 'Write at least 100 words. Any words.',
    affinity: 'morning',
    category: 'session_prompt',
    fields: [
      {
        label: '',
        name: 'entry',
        type: 'entry',
        showValue: false,
      },
    ],
  },
  {
    title: 'Day Start',
    name: 'start',
    message: 'What is your main focus today?',
    affinity: 'morning',
    category: 'session_prompt',
    fields: [
      {
        label: '',
        name: 'entry',
        type: 'entry',
        showValue: false,
      },
    ],
  },
  {
    title: 'Day Evening',
    name: 'interlude',
    message: 'What are you most proud of today?',
    affinity: 'evening',
    category: 'session_prompt',
    fields: [
      {
        label: '',
        name: 'entry',
        type: 'entry',
        showValue: false,
      },
    ],
  },
  {
    title: 'Day Check-in',
    name: 'check_in',
    message: "What's on your mind?",
    affinity: 'checkin',
    category: 'session_prompt',
    fields: [
      {
        label: '',
        name: 'entry',
        type: 'entry',
        showValue: false,
      },
    ],
  },
];

export let fieldTypes = {
  entry_type: {
    label: 'Choose an Entry Type',
    type: 'select',
    options: pollTypes,
  },
  slider: {
    label: 'Feeling 0-10',
    type: 'slider',
    min: 0,
    max: 10,
  },
  entry: {
    type: 'textarea',
    rows: 4,
    cols: 50,
  },
  // svelte doesnt allow 2way binding and dynamic <input type>
  text: {
    type: 'input',
    format: 'text',
  },
  number: {
    type: 'input',
    format: 'number',
  },
};
