import React from 'react'
import { Chart } from 'react-google-charts'

const Charts = (props) => {
  const options = ((chartName) => {
    switch (chartName) {
      case 'HistoricalData':
        return {
          title: chartName,
          hAxis: {
            title: 'Time (1hr intervals for past year)',
            // format: 'MMM d, y'
          },
          vAxis: { title: 'Price ($)' },
          // legend: 'none',
          // pointSize: 1,
          explorer: {
            actions: ['dragToZoom', 'rightClickToReset', 'dragToPan'],
            keepInBounds: true,
            zoomDelta: .25
          }
        }
      // case 'User':
      //   return {
      //     title: chartName,
      //     hAxis: {
      //       title: 'Time (1hr intervals for past year)',
      //     },
      //     vAxis: { title: 'Price ($)' },
      //     pointSize: 1,
      //     explorer: {
      //       actions: ['dragToZoom', 'rightClickToReset', 'dragToPan'],
      //       keepInBounds: true,
      //       zoomDelta: .25
      //     }
      //   }
      case 'OrderBook':
        return {
          title: chartName,
          hAxis: {
            title: 'Price ($)',
          },
          vAxis: { title: 'Volume (open orders)' },
          // pointSize: 1,
          explorer: {
            actions: ['dragToZoom', 'rightClickToReset', 'dragToPan'],
            keepInBounds: true,
            zoomDelta: .25
          }
        }
      // case 'Algorithm':
      //   return {
      //     title: chartName,
      //     hAxis: {
      //       title: 'Time (1hr intervals for past year)',
      //     },
      //     vAxis: { title: 'Price ($)' },
      //     pointSize: 1,
      //     explorer: {
      //       actions: ['dragToZoom', 'rightClickToReset', 'dragToPan'],
      //       keepInBounds: true,
      //       zoomDelta: .25
      //     }
      //   }
      default:
        return {
          title: chartName,
          hAxis: {
            title: 'Time (1hr intervals for past year)',
            // format: 'MMM d, y'
          },
          vAxis: { title: 'Price ($)' },
          // legend: 'none',
          // pointSize: 1,
          explorer: {
            actions: ['dragToZoom', 'rightClickToReset', 'dragToPan'],
            keepInBounds: true,
            zoomDelta: .25
          }
        }
    }
  })(props.chartName)

  const rws = props.chartData.map((elem, i) => {
    if (i === 0) return elem
    let convertedTime = new Date(0)
    convertedTime.setUTCSeconds(elem[0])
    return [convertedTime, ...elem.slice(1)]
  })
  return (
    <div className="google-chart">
      <Chart
        chartType="LineChart"
        // rows={rws}
        // columns={[{ type: 'date', label: 'Time (1 hr intervals)' }, { type: 'number', label: 'Price($)' }]}
        data={props.chartData}
        options={options}
        graph_id={props.chartName}
        width="100%"
        height="600px"
      />
    </div>
  )
}

export default Charts
