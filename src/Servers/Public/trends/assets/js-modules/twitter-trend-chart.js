'use strict'

$(document).ready(function () {
    const datasets = twitterData['items']
    const labels = twitterData['labels']
    const ctx = document.getElementById('ch5').getContext('2d');
    var myBubbleChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets
        },
        options: {
            scales: {
                yAxes: [{
                    stacked: true
                }]
            }
        }
    })
})
