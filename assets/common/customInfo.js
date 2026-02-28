let custom_src = "../../assets/custom/info.json";

function get_custom_info(name) {
    return fetch(custom_src)
        .then(response => response.json())
        .then(data => {
            return data[name] || null;
        })
        .catch(error => {
            console.error("Error fetching custom info:", error);
            return null;
        });
}

function get_game_info(game_name) {
    return get_custom_info("games").then(games => {
        if (games) {
            return games[game_name] || null;
        } else {
            return null;
        }    
    });
}
