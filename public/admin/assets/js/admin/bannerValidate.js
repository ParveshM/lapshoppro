function bannerValidateCreate() {
    const bannerImage = document.getElementsByName("file_photo")[0];
    if (bannerImage.value.trim() === "") {
        const bannerImageLabel = document.getElementById("bannerImageLabel")
        bannerImageLabel.innerHTML = "Image Required"
        bannerImageLabel.style.color = "red"
        bannerImage.focus();
        return false;
    }
    return bannerValidate()
}

function bannerValidate() {
    const productUrl = document.getElementsByName("productUrl")[0];
    const bannerName = document.getElementsByName("bannerName")[0];
    const bannerDescription = document.getElementsByName("bannerDescription")[0];

    if (productUrl.value.trim() === "") {
        const bannerUrlLabel = document.getElementById("bannerUrlLabel")
        bannerUrlLabel.innerHTML = "Category Required"
        bannerUrlLabel.style.color = "red"
        productUrl.focus();
        return false;
    }
    if (bannerName.value.trim() === "") {
        const bannerNameLabel = document.getElementById("bannerNameLabel")
        bannerNameLabel.innerHTML = "Banner Name Required"
        bannerNameLabel.style.color = "red"
        bannerName.focus();
        return false;
    }
    if (bannerDescription.value.trim() === "") {
        const bannerDescriptionLabel = document.getElementById("bannerDescriptionLabel")
        bannerDescriptionLabel.innerHTML = "Banner Description Required"
        bannerDescriptionLabel.style.color = "red"
        bannerDescription.focus();
        return false;
    }
    return true
}





function bannerUpdateValidate() {

    const bannerId = document.getElementById("bannerId")
    const prevImage = document.getElementById("prevImage")

    if (bannerId.value.trim() === "") {
        Toastify({
            text: "Banner id is Required",
            className: "info",
            style: {
                background: "linear-gradient(to right, #ff0000, #dd2a7f)",
            }
        }).showToast();
        return false;
    }
    if (prevImage.value.trim() === "") {
        Toastify({
            text: "Banner image is Required",
            className: "info",
            style: {
                background: "linear-gradient(to right, #ff0000, #dd2a7f)",
            }
        }).showToast();
        return false;
    }
    return bannerValidate()

}