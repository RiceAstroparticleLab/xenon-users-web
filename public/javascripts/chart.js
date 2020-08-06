function Chart(div, dict, PI) {
    var members = eval(dict)
    var pi_obj = JSON.parse(PI)
    console.log(members)
    console.log(pi_obj)

    Highcharts.chart(div, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        title: {text: null},
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
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
            data: []
        }]
    });
}