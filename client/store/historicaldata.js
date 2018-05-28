import axios from 'axios'
import history from '../history'

/**
 * ACTION TYPES
 */
const GET_HIST_DATA = 'GET_HIST_DATA'
const SELECT_CHART = 'SELECT_CHART'

/**
 * INITIAL STATE
 */
const defaultHistory = {
  chart1Min: [],
  chart1Hr: [],
  chart1Day: [],
  chart1Wk: [],
  selectedChart: 'chart1Hr'
}

/**
 * ACTION CREATORS
 */
const getChartData = (data) => ({ type: GET_HIST_DATA, data })
export const selectChartAction = (chartName) => ({ type: SELECT_CHART, selectedChart })

/**
 * THUNK CREATORS
 */
// export const getInitialChartDataThunk = () =>
//   dispatch =>
//     axios.get('/api/historicaldata')
//       .then(res =>
//         dispatch(getChartData(res.data || defaultHistory)))
//       .catch(err => console.log(err))
export const getInitialChartDataThunk = () => {
  return async (dispatch) => {
    try {
      const res = await axios.get('/api/historicaldata', { start: 0, end: 0 })
      dispatch(getChartData(res.data || defaultHistory))
    } catch (err) {
      console.log(err)
    }
  }
}

/**
 * REDUCER
 */
export default function (state = defaultHistory, action) {
  switch (action.type) {
    case GET_HIST_DATA:
      return {
        ...state,
        chart1Min: action.data.chart1MinData,
        chart1Hr: action.data.chart1HrData,
        chart1Day: action.data.chart1DayData,
        chart1Wk: action.data.chart1WkData,
      }
    case SELECT_CHART:
      return {
        ...state,
        selectedChart: action.selectedChart
      }
    default:
      return { ...state }
  }
}
