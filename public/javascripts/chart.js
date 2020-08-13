/* 
 * Contains scripts for individual institute pages.
 */

// Builds chart displayed on individual institute pages in (div) and 
// uses institute stats (dict) and number of PI's (PI)
function Chart(div, dict, PI) {
  var members = JSON.parse(dict)
  var pi_obj = JSON.parse(PI)
  var stats = []

  stats.push(['PI', pi_obj.length])
  for (let key in members) {
    let inner_html = []
    inner_html.push(key)
    inner_html.push(members[key])
    stats.push(inner_html)
  }

  Highcharts.chart(div, {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: 0,
      plotShadow: false,
      width: 400,
      height: 300
    },
    credits: {enabled: false},
    title: {text: null},
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<b>{point.name}</b>: <b>{point.y}</b><br/>'
    },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          distance: -50,
          style: {
            fontWeight: 'bold',
            color: 'white'
          }
        },
        startAngle: -90,
        endAngle: 90,
        center: ['50%', '75%'],
        size: '110%'
      }
    },
    series: [{
      type: 'pie',
      name: 'Institute Stats',
      innerSize: '50%',
      data: stats
    }]
  });
}