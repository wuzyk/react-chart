import React, { PropTypes } from 'react';

import './chart.css';

const GRID_LINE_COUNT = 5;
const MILLISECONDS_IN_DAY = 1000 * 3600 * 24;
const PADDING_TOP = 20;
const PADDING_RIGHT = 20;
const MONTH_TITLE = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTH_SHORT_TITLE = ['Янв', 'Фев', 'Маh', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export default class Chart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      yLabels: [],
      xLabels: [],
      points: [],
      gridLines: [],
      viewport: {},
      showLongAxisTitles: true
    };

    this.setViewport = this.setViewport.bind(this);
  }

  componentDidMount() {
    this.setScale();
    window.addEventListener('resize', this.setViewport);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props) {
      this.setScale();
    }

    if (prevState.xLabels !== this.state.xLabels) {
      this.setViewport();
    }

    if (prevState.viewport !== this.state.viewport) {
      this.setChart();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setViewport);
  }

  setScale() {
    const data = this.props.data;

    // get max grid value
    let maxValue = 0;
    data.forEach((item) => {
      maxValue = Math.max(maxValue, item.value);
    });
    const maxValueOrder = Math.pow(10, getNumberOrder(maxValue));
    const maxGridValue = Math.ceil(Math.ceil(maxValue) / maxValueOrder) * maxValueOrder;

    // create y labels
    const yLabels = [];
    for (let i = 0; i < GRID_LINE_COUNT; i += 1) {
      yLabels.push(maxGridValue - ((i * maxGridValue) / (GRID_LINE_COUNT - 1)));
    }

    // create x labels
    const minDate = new Date(data[0].date);
    const maxDate = new Date(data[data.length - 1].date);

    const xLabels = [];
    for (let date = new Date(minDate); date < maxDate; date.setMonth(date.getMonth() + 1)) {
      const month = date.getMonth();

      xLabels.push({
        key: date.getMonth() + date.getYear(),
        month: MONTH_TITLE[date.getMonth()],
        monthShort: MONTH_SHORT_TITLE[date.getMonth()],
        year: month === 0 || xLabels.length === 0 ? date.getFullYear() : null,
      });
    }

    this.setState({
      xLabels,
      yLabels,
      maxGridValue,
    });
  }

  setViewport() {
    const width = this.mainRef.offsetWidth;
    const height = this.mainRef.offsetHeight;
    const yAxisWidth = this.yAxisRef.offsetWidth;
    const xAxisHeight = this.xAxisRef.offsetHeight;

    const viewport = {
      top: PADDING_TOP,
      left: yAxisWidth,
      width: width - yAxisWidth - PADDING_RIGHT,
      height: height - PADDING_TOP - xAxisHeight,
    };

    this.setState({
      viewport,
    });
  }

  setChart() {
    // set grid
    const { viewport, maxGridValue } = this.state;
    const gridGap = viewport.height / (GRID_LINE_COUNT - 1);
    const gridLines = [];
    for (let i = 0; i < GRID_LINE_COUNT; i += 1) {
      gridLines.push(viewport.top + (i * gridGap));
    }

    // calc points count
    const data = this.props.data;
    const minDate = new Date(data[0].date);
    const maxDate = new Date(data[data.length - 1].date);
    const skipPointsCount = minDate.getDate() - 1;

    minDate.setDate(1);
    maxDate.setMonth(maxDate.getMonth() + 1);
    maxDate.setDate(0);

    const pointsCount = Math.ceil((maxDate - minDate) / MILLISECONDS_IN_DAY);
    const scaleSize = viewport.width / pointsCount;

    const points = [];
    data.forEach((item, index) => {
      points.push([
        viewport.left + ((skipPointsCount + index) * scaleSize),
        (viewport.top + viewport.height) - ((item.value * viewport.height) / maxGridValue),
      ]);
    });

    // adjust x axis
    const showLongAxisTitles = this.xAxisRef.scrollWidth <= viewport.width;
    const showShortAxisTitles = !showLongAxisTitles
      && this.xAxisShortRef.scrollWidth <= viewport.width;

    this.setState({
      gridLines,
      points,
      showLongAxisTitles,
      showShortAxisTitles,
    });
  }

  render() {
    const {
      viewport,
      points,
      gridLines,
      xLabels,
      yLabels,
      showLongAxisTitles,
      showShortAxisTitles,
    } = this.state;

    return (
      <div className="chart" ref={ref => (this.mainRef = ref)}>
        <div className="chart-y-axis" ref={ref => (this.yAxisRef = ref)}>
          {yLabels.map((label, index) => (
            <div className="chart-y-label" style={{ top: gridLines[index] }} key={label}>
              {label}
            </div>
          ))}
        </div>
        <div className="chart-x-axis" ref={ref => (this.xAxisRef = ref)} style={{ left: viewport.left, width: viewport.width, visibility: showLongAxisTitles ? 'visible' : 'hidden' }}>
          {xLabels.map(label => (
            <div className="chart-x-label" key={label.key}>
              <div className="chart-x-label__month">{label.month}</div>
              {label.year ? <div className="chart-x-label__year">{label.year}</div> : ''}
            </div>
          ))}
        </div>
        <div className="chart-x-axis" ref={ref => (this.xAxisShortRef = ref)} style={{ left: viewport.left, width: viewport.width, visibility: showShortAxisTitles ? 'visible' : 'hidden' }}>
          {this.state.xLabels.map(label => (
            <div className="chart-x-label" key={`${label.key}short`}>
              <div className="chart-x-label__month">{label.monthShort}</div>
              {label.year ? <div className="chart-x-label__year">{label.year}</div> : ''}
            </div>
          ))}
        </div>
        <svg className="chart-svg">
          <path className="chart-grid" d={gridLines.map(y => `M ${viewport.left} ${y} H ${viewport.left + viewport.width}`).join(' ')} />
          <polyline className="chart-seria" points={points.join(' ')} fill="none" />
        </svg>
      </div>
    );
  }
}

Chart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
};

function getNumberOrder(number) {
  return number && Math.floor(Math.log(Math.abs(number)) / Math.LN10);
}
