'use strict'

const paintChartTwitter = function () {
    const datasets = twitterData['items']
    const labels = twitterData['labels']
    const ctx = document.getElementById('ch5-twitter').getContext('2d');
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
}

const paintChartYoutube = function () {
    const datasets = youtubeData['items']
    const labels = youtubeData['labels']
    const ctx = document.getElementById('ch5-youtube').getContext('2d');
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
}

$(document).ready(function () {
    paintChartTwitter()
    paintChartYoutube()
})
