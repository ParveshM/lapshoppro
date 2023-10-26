
(function ($) {
    "use strict";

    function generateChartData(dataset) {
        var months = [];
        var counts = [];
        var currentDate = new Date();
        var currentYear = currentDate.getFullYear();
        var currentMonth = currentDate.getMonth() + 1;

        for (var i = 1; i <= 12; i++) {
            var dataPoint = dataset.find(function (item) {
                return item.year === currentYear && item.month === i;
            });
            if (dataPoint) {
                months.push(i);
                counts.push(dataPoint.count);
            } else {
                months.push(i);
                counts.push(0);
            }
        }
        return { months, counts };
    }

    const salesData = JSON.parse(document.getElementById("salesData").value);
    const usersData = JSON.parse(document.getElementById("usersData").value);
    const productSold = JSON.parse(document.getElementById("productSold").value);

    /*Sale statistics Chart*/
    if ($('#myChart').length) {
        var ctx = document.getElementById('myChart').getContext('2d');
        const chartDataSales = generateChartData(salesData);
        const chartDataUsers = generateChartData(usersData);
        const chartDataProductsold = generateChartData(productSold);
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Sales',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(44, 120, 220, 0.2)',
                    borderColor: 'rgba(44, 120, 220)',
                    data: chartDataSales.counts
                },
                {
                    label: 'Visitors',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(4, 209, 130, 0.2)',
                    borderColor: 'rgb(4, 209, 130)',
                    data: chartDataUsers.counts
                },
                {
                    label: 'Products',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(380, 200, 230, 0.2)',
                    borderColor: 'rgb(380, 200, 230)',
                    data: chartDataProductsold.counts
                }

                ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    }
                }
            }
        });
    } //End if

})(jQuery);