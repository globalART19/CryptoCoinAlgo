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
  chart1Min: {
    name: '',
    data: []
  },
  chart1Day: {
    name: '',
    data: []
  },
  chart1Wk: {
    name: '',
    data: []
  },
  selectedChart: 'chart1Day'
}

/**
 * ACTION CREATORS
 */
const getChartData = (data) => ({ type: GET_HIST_DATA, data })
const selectChart = (period) => ({ type: SELECT_CHART, period })

/**
 * THUNK CREATORS
 */
export const getInitialChartDataThunk = () =>
  dispatch =>
    axios.get('/api/historicaldata')
      .then(res =>
        dispatch(getChartData(res.data || defaultHistory)))
      .catch(err => console.log(err))

/**
 * REDUCER
 */
export default function (state = defaultHistory, action) {
  switch (action.type) {
    case GET_HIST_DATA:
      return {
        ...state,
        chart1Min: {
          ...state.chart1Min,
          data: action.chart1Min
        },
        chart1Day: {
          ...state.chart1Day,
          data: action.chart1Day
        },
        chart1Wk: {
          ...state.chart1Wk,
          data: action.chart1Wk
        },
      }
    case SELECT_CHART:
      return defaultHistory
    default:
      return state
  }
}
