let custom_src;
let extgams_src;
let baseInfo_src;

if (window.location.href.includes('/games/')) {
    custom_src = "../../assets/custom/info.json";
    extgams_src = "../../assets/custom/extGames.json";
    baseInfo_src = "../../assets/custom/baseInfo.json";
} else if(window.location.href.includes('/pages/')) {
    custom_src = "../../custom/info.json";
    extgams_src = "../../custom/extGames.json";
    baseInfo_src = "../../custom/baseInfo.json";
} else {
    custom_src = "assets/custom/info.json";
    extgams_src = "assets/custom/extGames.json";
    baseInfo_src = "assets/custom/baseInfo.json";
}

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

function get_all_base_info() {
    return fetch(baseInfo_src)
        .then(response => response.json())
        .then(data => {
            return data || {};
        })
        .catch(error => {
            console.error("Error fetching base info:", error);
            return {};
        });
}

function get_base_info(name) {
    return get_all_base_info().then(info => {
        return info[name] || null;
    });
}

function get_all_games() {
    // 获取 info.json 和 extGames.json 的 games 字段，并合并
    return Promise.all([
        fetch(custom_src).then(res => res.json()).catch(() => ({})),
        fetch(extgams_src).then(res => res.json()).catch(() => ({}))
    ]).then(([customData, extGamesData]) => {
        const customGames = customData.games || [];
        const extGames = extGamesData.games || [];
        return [...customGames, ...extGames];
    }).catch(error => {
        console.error("Error fetching all games info:", error);
        return [];
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
