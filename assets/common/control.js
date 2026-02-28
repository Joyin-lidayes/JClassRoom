async function backHomeBtn() {
    let homeSrc = await get_custom_info("index");
    if (homeSrc) {
        window.location.href = homeSrc;
    } else {
        alert("主页地址未设置");
    }
}