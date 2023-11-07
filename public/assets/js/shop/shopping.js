
// Script for filtering product
const query = window.location.search;
const queryParams = new URLSearchParams(query);
const lowtoHigh = document.getElementById('lowToHigh')
const highToLow = document.getElementById('highToLow')
const pages = queryParams.get('p')
const selectedCategory = queryParams.get('category')
const search = queryParams.get('search')
const baseURL = '/shop';

const queryParameters = [];

if (selectedCategory) {
    queryParameters.push(`category=${selectedCategory}`);
}

lowtoHigh.addEventListener('click', (e) => {
    e.preventDefault()
    queryParameters.push(`sort=lowtoHigh`);

    const finalURL = baseURL + (queryParameters.length > 0 ? `?${queryParameters.join('&')}` : '');
    window.location.href = finalURL
})

highToLow.addEventListener('click', (e) => {
    e.preventDefault()
    queryParameters.push(`sort=highToLow`);
    const finalURL = baseURL + (queryParameters.length > 0 ? `?${queryParameters.join('&')}` : '');
    window.location.href = finalURL

})
// Number of page
function navigatePage(page) {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('p', page);
    const newURL = `${window.location.pathname}?${queryParams.toString()}`;
    window.location.href = newURL; // Navigate to the new URL
}

// Search input section
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

searchButton.addEventListener('click', (e) => {
    e.preventDefault()
    const searchTerm = searchInput.value
    queryParameters.push(`search=${searchTerm}`);
    const finalURL = baseURL + (queryParameters.length > 0 ? `?${queryParameters.join('&')}` : '');
    window.location.href = finalURL

})


// addTowishlist ajax function
function toggleWishlist(productId) {

    const wishlistMessage = document.getElementById('wishlist-message');
    const fixedDiv = document.getElementById('fixed-div');
    const wishlist = document.getElementById('wishlist-' + productId);
    const wishlistAnimate = document.querySelector('.icon-wishlist')
    function hide() {
        fixedDiv.style.display = 'none';
    }

    $.ajax({
        type: 'GET',
        url: `/addTo-wishlist/${productId}`,
        success: function (response) {
            if (response.success) {
                fixedDiv.style.display = 'block';
                fixedDiv.style.color = 'red';
                fixedDiv.style.backgroundColor = 'green';
                wishlistMessage.innerText = response.message;
                wishlist.nextElementSibling.style.color = 'red';
                wishlistAnimate.classList.toggle('added');
                setTimeout(function () {
                    hide();
                    wishlistAnimate.classList.remove('added');
                }, 3000);

            } else {
                fixedDiv.style.color = '';
                fixedDiv.style.display = 'block';
                fixedDiv.style.backgroundColor = 'red';
                wishlistMessage.innerText = response.message;
                wishlist.nextElementSibling.style.color = 'black';
                setTimeout(hide, 3000);
            }
        },
        error: function (textStatus, errorThrown) {
            console.log('Error in sending addtowishlist request', textStatus, errorThrown);
        }
    });

}

