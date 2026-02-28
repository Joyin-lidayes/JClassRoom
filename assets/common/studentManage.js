function add_stu_group(group_name) {
    let groups = get_all_groups();
    if (!groups.includes(group_name)) {
        groups.push(group_name);
        set_local_data("stu_groups", JSON.stringify(groups));
    }
}

function delete_stu_group(group_name) {
    let groups = get_all_groups();
    const index = groups.indexOf(group_name);
    if (index > -1) {
        groups.splice(index, 1);
        set_local_data("stu_groups", JSON.stringify(groups));
        // 删除该组的学生数据
        localStorage.removeItem(group_name);
    }
}

function get_stu_group(group_name) {
    let group = get_local_data(group_name);
    if (group) {
        return JSON.parse(group);
    } else {
        return [];
    }
}

function add_stu_to_group(stu_name, group_name) {
    let group = get_stu_group(group_name);
    if (!group.includes(stu_name)) {
        group.push(stu_name);
        set_local_data(group_name, JSON.stringify(group));
    }
}

function delete_stu_from_group(stu_name, group_name) {
    let group = get_stu_group(group_name);
    const index = group.indexOf(stu_name);
    if (index > -1) {
        group.splice(index, 1);
        set_local_data(group_name, JSON.stringify(group));
    }
}

function get_all_groups() {
    let groups = get_local_data("stu_groups");
    if (groups) {
        return JSON.parse(groups);
    } else {
        return [];
    }
}

function set_goal_group(group_name) {
    set_local_data("goal_group", group_name);
}

function get_goal_group() {
    return get_local_data("goal_group");
}

