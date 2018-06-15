import React from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
// import FormUpdateIndicators from './FormUpdateIndicators'
import Charts from './charts'
import { getInitialTFChartDataThunk, selectTFChartAction } from '../store/tensorflow';

const mapStateToProps = (state) => ({
  selectedChart: state.tensorflow.selectedChart,
  chart1Min: state.tensorflow.chart1Min,
  chart1Hr: state.tensorflow.chart1Hr,
  chart1Day: state.tensorflow.chart1Day,
  chart1Wk: state.tensorflow.chart1Wk,
  chartData: state.tensorflow.chartData
})
const mapDispatchToProps = (dispatch) => ({
  getChartData: () => dispatch(getInitialTFChartDataThunk()),
  selectChart: (chartName) => dispatch(selectTFChartAction(chartName))
})


class TensorFlow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      period: 3600,
      granularity: 60,
      selectedChart: this.props.selectedChart
    }
    this.handlePullData = this.handlePullData.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  async handlePullData() {
    await axios.post('/api/tensorflow/', { 'period': this.state.period, 'granularity': this.state.granularity })
    this.setState(this.state)
    console.log('historical data pull complete')
  }
  async handleSubmit(event) {
    event.preventDefault()
    await this.setState({
      period: event.target.period.value * 3600
    })
    await this.props.getChart('tensorflow', { 'period': this.state.period, 'granularity': this.state.granularity })
  }
  handleOptionClick = (evt) => {
    console.log(evt.target)
    this.setState({ ...this.state, selectedChart: evt.target.value })
  }
  async componentDidMount() {
    await this.props.getChartData()
    // this.setState(this.state)
  }
  render() {
    const chart1Data = this.props[this.state.selectedChart].map(instance => {
      return instance.slice(0, 4)
    })
    const chart2Data = this.props[this.state.selectedChart].map(instance => {
      return [...instance.slice(0, 1), ...instance.slice(4, 6)]
    })
    const chart3Data = this.props[this.state.selectedChart].map(instance => {
      return [...instance.slice(0, 1), ...instance.slice(6)]
    })
    return (
      <div id='historical-data'>
        <div id='update-indicators'>
          <h2>Update Indicator Period</h2>
          <form method='POST' onSubmit={() => { }} onChange={() => { }} >
            <label htmlFor='period'>Period (in hours): <input type='text' name='period' /></label>
            <button type="submit" className="btn btn-primary" style={{ background: 'light blue' }}>Update</button>
          </form>
        </div>
        {/* <AlgorithmResults /> */}
        <div className='chart-block'>
          {!!chart2Data.length && !!(chart2Data[0].length - 1) && <Charts chartData={chart1Data} chartName={this.props.selectedChart} />}
          <form className='chart-navbar' onClick={this.handleOptionClick} >
            <button type="button" className='chartoptions' value='chart1Hr' >1week</button>
            <button type="button" className='chartoptions' value='chart1Min' >1day</button>
            <button type="button" className='chartoptions' value='chart1Hr' >1month</button>
            <button type="button" className='chartoptions' value='chart1Day' >1year</button>
          </form>
        </div>
        {!!chart2Data.length && !!(chart2Data[0].length - 1) && <Charts chartData={chart2Data} chartName='MACD and mSig' />}
        {!!chart3Data.length && !!(chart2Data[0].length - 1) && <Charts chartData={chart3Data} chartName='rSig' />}
        <button type='button' onClick={() => { this.handlePullData() }} className="btn btn-primary" style={{ display: 'block', margin: 'auto', background: 'red' }}>Pull Data</button>
      </div>)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TensorFlow)
