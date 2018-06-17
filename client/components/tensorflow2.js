import React from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
// import FormUpdateIndicators from './FormUpdateIndicators'
import Charts from './charts'
import { getInitialChartDataThunk, selectChartAction } from '../store/historicaldata';
import { runTfModel } from '../../public/fpnn'
import P5Wrapper from 'react-p5-wrapper'

const mapStateToProps = (state) => ({
  selectedChart: state.historicaldata.selectedChart,
  chart1Min: state.historicaldata.chart1Min,
  chart1Hr: state.historicaldata.chart1Hr,
  chart1Day: state.historicaldata.chart1Day,
  chart1Wk: state.historicaldata.chart1Wk,
  tfData: state.historicaldata.tfData,
  min: state.historicaldata.min,
  max: state.historicaldata.max
})
const mapDispatchToProps = (dispatch) => ({
  getChartData: () => dispatch(getInitialChartDataThunk()),
  selectChart: (chartName) => dispatch(selectChartAction(chartName))
})


class HistoricalData extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      period: 3600,
      granularity: 3600,
      results: []
    }
    this.handlePullData = this.handlePullData.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  async handlePullData() {
    await axios.post('/api/historicaldata/', { 'period': this.state.period, 'granularity': this.state.granularity })
    this.setState(this.state)
    console.log('historical data pull complete')
  }
  async handleSubmit(event) {
    event.preventDefault()
    await this.setState({
      period: event.target.period.value * 3600
    })
    await this.props.getChart('HistoricalData', { 'period': this.state.period, 'granularity': this.state.granularity })
  }
  componentDidMount() {
    this.props.getChartData()
    // this.setState(this.state)
  }
  handleTfModel = async () => {
    const yData = await runTfModel(this.props.tfData, this.props.min, this.props.max)
    let i = 0
    yData.map((elem, i) => {
      return [i, ...elem]
    })
    yData.shift(['time', 'actual', 'predicted'])
    // console.log(results)
    this.setState({ ...this.state, results: yData })
  }
  render() {
    const chart1Data = this.props[this.props.selectedChart].map(instance => {
      return instance.slice(0, 4)
    })
    const chart2Data = this.props[this.props.selectedChart].map(instance => {
      return [...instance.slice(0, 1), ...instance.slice(4, 6)]
    })
    const chart3Data = this.props[this.props.selectedChart].map(instance => {
      return [...instance.slice(0, 1), ...instance.slice(6)]
    })
    console.log(this.props.tfData)
    return (
      <div id='historical-data'>
        <button type='button' onClick={this.handleTfModel} >Run TF Model</button>
        <div id='update-indicators'>
          <h2>Update Indicator Period</h2>
          <form method='POST' onSubmit={() => { }} onChange={() => { }} >
            <label htmlFor='period'>Period (in hours): <input type='text' name='period' /></label>
            <button type="submit" className="btn btn-primary" style={{ background: 'light blue' }}>Update</button>
          </form>
        </div>
        {!!this.state.results.length && <Charts chartData={this.state.results} chartName="TF Output" />}
        {/* {this.props.tfData.length && <P5Wrapper sketch={sketch} rawData={this.props.tfData} min={this.props.min} max={this.props.max} />} */}
        {/* <AlgorithmResults /> */}
        {/* <div className='chart-block'>
          <Charts chartData={chart1Data} chartName={this.props.selectedChart} />
          <div className='chart-navbar' onClick={() => { }}>
            <div className='chartoptions'>1day</div>
            <div className='chartoptions'>1week</div>
            <div className='chartoptions'>1month</div>
            <div className='chartoptions'>1year</div>
          </div>
        </div> */}
        {/* {!!chart2Data.length && !!(chart2Data[0].length - 1) && <Charts chartData={chart2Data} chartName='MACD and mSig' />}
        {!!chart3Data[0] && !!(chart2Data[0].length - 1) && <Charts chartData={chart3Data} chartName='rSig' />}
        <button type='button' onClick={() => { this.handlePullData() }} className="btn btn-primary" style={{ display: 'block', margin: 'auto', background: 'red' }}>Pull Data</button> */}
      </div>)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoricalData)
