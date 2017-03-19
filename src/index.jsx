import React from 'react';
import ReactDOM from 'react-dom';

import Chart from './components/chart/chart';

require('./style.css');

render();

function render() {
  const data = generateData('2015-01-01', 365, 10, 100);

  ReactDOM.render(
    <div>
      <Chart data={data} />
      <button onClick={render}>Generate new data</button>
    </div>,
    document.getElementById('app'),
  );
}

function generateData(startDate, daysCount, minValue, maxValue) {
  const data = [];
  let currentDate = startDate;
  let currentValue = minValue + ((maxValue - minValue) * Math.random());

  for (let i = 0; i < daysCount; i += 1) {
    data.push({
      date: currentDate,
      value: currentValue,
    });

    currentValue += 0.2 * currentValue * ((2 * Math.random()) - 1); // +/- 20% from last value;

    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);

    currentDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
  }

  return data;
}
