


coordinate_size = 20

map_one_parent = document.getElementById("unknown")
map_two_parent = document.getElementById("known")

let isDragging = false

let not_in_goal = true
let replay_path = false

let new_bee;

let map_one = new map(map_one_parent, coordinate_size, "u")
let map_two = new map(map_two_parent, coordinate_size, "k")

let radios = document.getElementsByName("paint_type");
let paint_type = "wall"

let bee_start = []
let goal_start = []

radios.forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.checked) {
            paint_type = radio.value;
        }
    });
});

function map(parent, coordinate_size, coordinate_class){
    this.parent = parent
    this.coordinate_size = coordinate_size
    this.coordinate_class = coordinate_class
    this.cords = {}
    this.goal = ""
    this.bee = ""

    this.create_grid_elements = function(){
        num_columns = Math.floor(this.parent.clientWidth / this.coordinate_size) - 2
        num_rows = Math.floor(this.parent.clientHeight / this.coordinate_size) - 2

        this.parent.style.gridTemplateColumns = Array(num_columns).fill("auto").join(" ");
        this.parent.style.gridTemplateRows = Array(num_rows).fill("auto").join(" ");
        
        for(let y = 0; y < num_rows; y++){
            for(let x = 0; x < num_columns; x++){
                let coordinate = document.createElement("div")
                // coordinate.innerText = `(${x}, ${y})`
                // coordinate.style.backgroundColor = this.coordinate_color
                coordinate.classList.toggle(this.coordinate_class)
                coordinate.style.height = `${this.coordinate_size}px`
                coordinate.style.width = `${this.coordinate_size}px`
                this.parent.id == "known" ? coordinate_prefix = "k": coordinate_prefix = "u"
                coordinate.id = `${coordinate_prefix}-${x}-${y}`
                
                this.cords[coordinate.id] = this.coordinate_class
                
                const activateCoordinate = () => {

                    if (paint_type != "eraser"){
                        if (this.cords[coordinate.id] != this.coordinate_class) return

                        if (paint_type != "wall"){
                            existing_of_type = Object.keys(this.cords).find(key  => 
                                this.cords[key] === paint_type)

                            if (existing_of_type != undefined) {
                                this.cords[existing_of_type] = this.coordinate_class;
                                document.getElementById(existing_of_type).classList.toggle(paint_type)

                            }
                        }
                        this.cords[coordinate.id] = paint_type;
                        document.getElementById(coordinate.id).classList.toggle(paint_type)
                        

                        
                    }
                    else{
                        if (this.cords[coordinate.id] !== this.coordinate_class){
                            document.getElementById(coordinate.id).classList.toggle(this.cords[coordinate.id])
                            this.cords[coordinate.id] = this.coordinate_class
                        }
                    }


                };
        
                // Event listeners for "drag and highlight" behavior
                if (coordinate.id[0] == "k"){
                    coordinate.addEventListener("mousedown", (e) => {
                        e.preventDefault(); // Prevent default selection behavior
                        isDragging = true;  // Start dragging
                        activateCoordinate(); // Activate the cell immediately on mousedown
                    });
                
                    coordinate.addEventListener("mouseover", () => {
                        if (isDragging) { // Only activate if mouse is held down
                            activateCoordinate();
                        }
                    });
                
                    coordinate.addEventListener("mouseup", () => {
                        isDragging = false; // Stop dragging when mouse is released
                    });
                }
                this.parent.appendChild(coordinate)

            }
        }
    }
    
     
}

function update_bee_surroundings(bee, complete_cords){
    document.querySelectorAll(".visible").forEach((element) => element.classList.remove("visible"))
    let blocked_cords = []
    let visible_cords = {}
    let vision_radius = 2
    // let vision_dirs = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]
    let ray_dirs = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]
    // An object with keys being the coordinate, also refered to as rays since they are vectors. The value are parents or dependents, this is a list of lists of coords,
    // If all coords in one of the sublist are blocked (walls) then the cord of the key value cannot be seen. Cords are in this function seperated with ":", 
    let rays = {}
    for(let ray of ray_dirs){
        // for(let i = 1; i <= vision_radius; i++){
        let new_ray = [ray[0]*vision_radius, ray[1]*vision_radius]
        
        

        // Diagonal rays
        if (Math.abs(ray[0]) + Math.abs(ray[1]) == vision_radius){
            // for (let diagonal_add = 0; )
            

            let half_ray1 = [ray[0] + Math.sign(ray[0]), ray[1]]
            let half_ray2 = [ray[0], ray[1] + Math.sign(ray[1])]
            if (Number(bee.x) + half_ray1[0] >= 0 && Number(bee.x) + half_ray1[0] < num_columns && Number(bee.y) + half_ray1[1] >= 0 && Number(bee.y) + half_ray1[1] < num_rows) {
                // 
                rays[half_ray1.join(":")] = [[ray.join(":")], [[Number(bee.x) + Math.sign(half_ray1[0]), bee.y].join(":"), [Number(bee.x), Number(bee.y) + Math.sign(half_ray1[1])].join(":")]]
            }
            
            // rays[half_ray1.join(":")] = new_ray.join(":")
            if (Number(bee.x) + half_ray2[0] >= 0 && Number(bee.x) + half_ray2[0] < num_columns && Number(bee.y) + half_ray2[1] >= 0 && Number(bee.y) + half_ray2[1] < num_rows) {
                rays[half_ray2.join(":")] = [[ray.join(":")], [[Number(bee.x) + Math.sign(half_ray2[0]), bee.y].join(":"), [Number(bee.x), Number(bee.y) + Math.sign(half_ray2[1])].join(":")]]

            }

            if (Number(bee.x) + ray[0] < 0 || Number(bee.x) + ray[0] >= num_columns || Number(bee.y) + ray[1] < 0 || Number(bee.y) + ray[1] >= num_rows) continue
            rays[[ray[0], ray[1]].join(":")] = undefined

            
        }
        // Cardinal dir rays
        else if(Math.abs(new_ray[0]) + Math.abs(new_ray[1]) == vision_radius){
            if(Number(bee.x) + new_ray[0]/vision_radius < 0 || Number(bee.x) + new_ray[0]/vision_radius >= num_columns  || Number(bee.y) + new_ray[1]/vision_radius < 0 || Number(bee.y) + new_ray[1]/vision_radius >= num_rows) continue
            rays[[new_ray[0]/vision_radius, new_ray[1]/vision_radius].join(":")] = undefined

            if (Number(bee.x) + new_ray[0] < 0 || Number(bee.x) + new_ray[0] >= num_columns || Number(bee.y) + new_ray[1] < 0 || Number(bee.y) + new_ray[1] >= num_rows) continue

            rays[new_ray.join(":")] = [[new_ray[0]/vision_radius, new_ray[1]/vision_radius].join(":")]

        }

    }

    for (let [ray, parent_lists] of Object.entries(rays)){
        let ray_cords = ray.split(":")
        let cord_content;
        complete_cords[`k-${[Number(bee.x) + Number(ray_cords[0]), Number(bee.y) + Number(ray_cords[1])].join("-")}`] != "k" ? cord_content = complete_cords[`k-${[Number(bee.x) + Number(ray_cords[0]), Number(bee.y) + Number(ray_cords[1])].join("-")}`] : cord_content = "u"
        if (parent_lists == undefined){
            
            // ray_cords = ray.split(":")
            // parent_cords = parent.split("-")
            cord_id = `u-${[Number(bee.x) + Number(ray_cords[0]), Number(bee.y) + Number(ray_cords[1])].join("-")}`
            if (bee.cords[cord_id] != cord_content || bee.curr_cords[cord_id] != cord_content){
                bee.cords[cord_id] = cord_content
                bee.curr_cords[cord_id] = cord_content
                document.getElementById(cord_id).classList = `u ${bee.cords[cord_id]}`
                bee.redo_a_star = true
            }
            // bee.cords[cord_id] = cord_content
            // document.getElementById(cord_id).classList = `u ${bee.cords[cord_id]}`

        }
        else{
            let cannot_show = false
            for (let parent_list in parent_lists){
                let parent_list_not_blocked = true
                for(let parent in parent_list){
                    if(complete_cords[`k-${[Number(bee.x) + Number(parent.split(":")[0]), Number(bee.y) + Number(parent.split(":")[1])].join("-")}`] != "wall"){
                        continue
                    }
                    parent_list_not_blocked = false
    
                }
                if(!parent_list_not_blocked){
                    cannot_show = true
                }
            }
            if(!cannot_show){
                cord_id = `u-${[Number(bee.x) + Number(ray_cords[0]), Number(bee.y) + Number(ray_cords[1])].join("-")}`
                if (bee.cords[cord_id] != cord_content){
                    bee.cords[cord_id] = cord_content
                    bee.curr_cords[cord_id] = cord_content
                    document.getElementById(cord_id).classList = `u ${bee.cords[cord_id]}`
                    bee.redo_a_star = true
                }
                
            }
        }
        
        

    }
}

document.addEventListener("mouseup", () => {
    isDragging = false;
});

function move_ghosts(traveled_elements, traveled_element_ind){
    if (replay_path){
        traveled_elements[traveled_element_ind].classList.add("ghost_bee")

        document.getElementsByClassName("ghost_bee").forEach((element) => {
            element.classList.remove("ghost_bee")
        })

        traveled_element_ind = (traveled_element_ind + 1) % traveled_elements.length
        setTimeout(() => move_ghosts(traveled_elements, traveled_element_ind), 1)
        
    }
}

function update_bee_position(preliminary_path, path_traveled){
    if (not_in_goal){
        
        update_bee_surroundings(new_bee, map_two.cords)

        if (preliminary_path == undefined || new_bee.cords[`u-${preliminary_path[1]}`] == "wall" || new_bee.redo_a_star){
            preliminary_path = new_bee.a_star(`${new_bee.x}-${new_bee.y}`, `${new_bee.goal_x}-${new_bee.goal_y}`, num_columns - 1, num_rows - 1, new_bee.cords)
            new_bee.redo_a_star = false
        }

        if(preliminary_path == null){
            preliminary_path = new_bee.a_star(`${new_bee.x}-${new_bee.y}`, `${new_bee.goal_x}-${new_bee.goal_y}`, num_columns - 1, num_rows - 1, new_bee.curr_cords)
            if (preliminary_path == null){
                console.log("No available path")
                return
            }
            
        }

        if (preliminary_path.length > 1){
            next_pos = preliminary_path[1]
        }

        document.querySelectorAll(".path").forEach((element) => {
            element.classList.remove("path")
        })

        for(cord of preliminary_path.slice(1)){
            document.getElementById(`u-${cord}`).classList.add("path")
        }

        new_bee_old_pos = `${new_bee.x}-${new_bee.y}`
        document.getElementById(`k-${new_bee_old_pos}`).classList.remove("bee")
        document.getElementById(`u-${new_bee_old_pos}`).classList.remove("bee")
        new_bee.x = next_pos.split("-")[0]
        new_bee.y = next_pos.split("-")[1]
        map_two.cords[`k-${new_bee_old_pos}`] = "k"
        map_one.cords[`u-${new_bee_old_pos}`] = "u"

        new_bee_new_pos = `${new_bee.x}-${new_bee.y}`
        path_traveled.push(new_bee_new_pos)
        document.getElementById(`k-${new_bee_new_pos}`).classList.add("bee")
        document.getElementById(`u-${new_bee_new_pos}`).classList.add("bee")

        preliminary_path = preliminary_path.slice(1)
        
        setTimeout(() => update_bee_position(preliminary_path, path_traveled), 50);

        if (preliminary_path.length <= 2){
            not_in_goal = false
            
        }
    }
    else{
        let traveled_elements = []
        for (let cord of path_traveled){
            
            traveled_elements.push(document.getElementById(`u-${cord}`))
            
            document.getElementById(`u-${cord}`).classList.add("traveled")
            document.getElementById(`k-${cord}`).classList.add("traveled")
        }
        move_ghosts(traveled_elements, 0)
    }
    
}

function get_unmarked_cords(reset_ui){

    let unmarked_coordinates = Object.fromEntries(
        Object.entries(map_two.cords).map(([key, value]) => {
            // Replace 'k' with 'u' in the key
            const newKey = key.replace(/^k/, 'u');
            // Replace 'wall' with '' in the value
            const newValue = value === "wall" ? "u" : value;
            if(reset_ui){
                document.getElementById(newKey).classList = "u"
            }
            return [newKey, newValue];
        })
    );
    return unmarked_coordinates
}



map_one.create_grid_elements()
map_two.create_grid_elements()

const play_pause_btn = document.getElementById("play-pause-btn")
play_pause_btn.addEventListener("click", () => {
    string_container = document.createElement("p")
    marked_cords = Object.fromEntries(Object.entries(map_two.cords).filter(([key, value]) => value !== "k"))
    string_container.innerText = JSON.stringify(marked_cords)
    string_container.classList = "string_container"
    document.getElementById("maps").appendChild(string_container)
    
    bee_start = Object.keys(map_two.cords).find(cord_key => map_two.cords[cord_key] === "bee").slice(2).split("-")
    goal_start = Object.keys(map_two.cords).find(cord_key => map_two.cords[cord_key] === "goal").slice(2).split("-")
    let bee_info = bee_start
    let goal_info = goal_start

    let unmarked_coordinates = get_unmarked_cords(true)

    new_bee = new bee(Number(bee_info[0]), Number(bee_info[1]), 3, Number(goal_info[0]), Number(goal_info[1]), unmarked_coordinates)
    let path_traveled = [`${new_bee.x}-${new_bee.y}`]
    new_bee.on_start()
    

    update_bee_position(undefined, path_traveled)
    
})

const rerun_btn = document.getElementById("rerun-btn")
rerun_btn.addEventListener("click", () => {
    let bee_info = bee_start
    let goal_info = goal_start

    

    not_in_goal = true
    

    document.querySelectorAll(".path").forEach((element) => element.classList.remove("path"))
    document.querySelectorAll(".traveled").forEach((element) => element.classList.remove("traveled"))

    document.getElementById(`u-${new_bee.x}-${new_bee.y}`).classList.remove("bee")
    document.getElementById(`k-${new_bee.x}-${new_bee.y}`).classList.remove("bee")
    map_one.cords[`u-${new_bee.x}-${new_bee.y}`] = "u"
    map_two.cords[`k-${new_bee.x}-${new_bee.y}`] = "k"

    new_bee = new bee(Number(bee_info[0]), Number(bee_info[1]), 3, Number(goal_info[0]), Number(goal_info[1]), new_bee.cords)

    new_bee.unchecked_walls = new_bee.get_walls()

    map_one.cords[`k-${bee_info.join("-")}`] = "bee"
    map_two.cords[`u-${bee_info.join("-")}`] = "bee"
    map_one.cords[`k-${goal_info.join("-")}`] = "goal"
    map_two.cords[`u-${goal_info.join("-")}`] = "goal"

    // document.getElementById(`u-${new_bee.x}-${new_bee.y}`).classList.add("bee")
    
    document.getElementById(`k-${new_bee.x}-${new_bee.y}`).classList.add("bee")
    let path_traveled = [`${new_bee.x}-${new_bee.y}`]

    new_bee.on_start()

    update_bee_position(undefined, path_traveled)
})

const load_maze_btn = document.getElementById("load-maze-btn")
load_maze_btn.addEventListener("click", () => {
    maze_string = document.getElementById("maze-input").value
    loaded_cords = JSON.parse(maze_string)
    map_two.cords = loaded_cords
    for ([cord, content] of Object.entries(loaded_cords)){
        document.getElementById(cord).classList.add(content)
    }


})

const clear_btn = document.getElementById("clear-btn")
clear_btn.addEventListener("click", () => {
    console.log(document.getElementById("known").children)
    Array.from(document.getElementById("known").children).forEach((element) => {
        element.classList = "k"
        map_two.cords[element.id] = "k"
        
    })
    console.log(map_two.cords)
})
