// Script for filtering product
const query = window.location.search;
const queryParams = new URLSearchParams(query);
const lowtoHigh = document.getElementById('lowToHigh')
const highToLow = document.getElementById('highToLow')
const pages = queryParams.get('p')
const selectedCategory = queryParams.get('category')
const baseURL = '/shop';

const queryParameters = [];

if (selectedCategory) {
    queryParameters.push(`category=${selectedCategory}`);
}

// Use the finalURL for your API request or redirection
lowtoHigh.addEventListener('click', (e) => {
    e.preventDefault()
    queryParameters.push(`sort=lowtoHigh`);

    const finalURL = baseURL + (queryParameters.length > 0 ? `?${queryParameters.join('&')}` : '');
    console.log(finalURL);
    window.location.href = finalURL
})

highToLow.addEventListener('click', (e) => {
    e.preventDefault()
    console.log('butt clicked');
    queryParameters.push(`sort=highToLow`);
    const finalURL = baseURL + (queryParameters.length > 0 ? `?${queryParameters.join('&')}` : '');
    console.log(finalURL);
    window.location.href = finalURL

})

function navigatePage(page) {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('p', page); // Update the 'p' query parameter with the new page value
    const newURL = `${window.location.pathname}?${queryParams.toString()}`;
    window.location.href = newURL; // Navigate to the new URL
}



// addTowishlist ajax function
function addTowishlist(productId) {
    const wishlistMessage = document.getElementById('wishlist-message')
    const fixedDiv = document.getElementById('fixed-div')

    function hide() {
        fixedDiv.style.display = 'none';
    }
    $.ajax({
        type: 'GET',
        url: `/addTo-wishlist/${productId}`,
        success: function (response) {
            if (response.success) {
                fixedDiv.style = 'block'
                fixedDiv.style.color = 'red'
                fixedDiv.style.backgroundColor = 'green';
                wishlistMessage.innerText = response.message
                setTimeout(hide, 3000);
            } else {
                console.log('response', response.message);
                fixedDiv.style.color = ''
                fixedDiv.style = 'block'
                fixedDiv.style.backgroundColor = 'red';
                wishlistMessage.innerText = response.message
                setTimeout(hide, 3000);

            }
        },
        error: function (textStatus, errorThrown) {

            console.log('Errro in sending addtowishlist request', textStatus, errorThrown);
        }
    })
}
