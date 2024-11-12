function bee(x, y, vision, goal_x, goal_y, cords){
    this.x = x
    this.y = y
    this.vision = vision
    this.cords = cords
    this.curr_cords = {};

    this.has_retried_a_star = false


    this.use_temp = false
    this.goal_x = goal_x
    this.goal_y = goal_y

    this.movable_dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]

    this.redo_a_star = true
    this.get_walls = function() {
        return Object.entries(this.cords)
            .filter(([key, value]) => value === "wall")
            .map(([key]) => key);
    };

    this.reset_temp_cords = function(){
        for ([cord, content] of Object.entries(this.cords)){

            this.cords[cord] == "wall" ? this.curr_cords[cord] = "u" : this.curr_cords[cord] = content
        }
    }

    this.on_start = function (){

        bee_id = `u-${this.x}-${this.y}`
        goal_id = `u-${this.goal_x}-${this.goal_y}`
        this.reset_temp_cords()
        document.getElementById(bee_id).classList.add("bee")
        document.getElementById(goal_id).classList.add("goal")
    }

    

    this.taxicab_dist = function(point){
        point_x = Number(point.split("-")[0])
        point_y = Number(point.split("-")[1])

        return Math.abs(point_x - this.goal_x) + Math.abs(point_y - this.goal_y)
    }

    this.reconstruct_path = function(came_from, current){
        let total_path = [current]

        while (current in came_from){
            current = came_from[current]
            total_path.unshift(current)
        }
        return total_path
    }


    this.a_star = function(start, goal, max_x, max_y, cords){
        let open_set = [start]

        let came_from = {}

        let g_score = {}
        const get_g_score = (node) => g_score[node] !== undefined ? g_score[node] : Infinity
        g_score[start] = 0


        let f_score = {}
        const get_f_score = (node) => f_score[node] !== undefined ? g_score[node] : Infinity
        f_score[start] = this.taxicab_dist(start)

        while (open_set.length > 0){
            let lowest = Infinity
            let current = ""


            
            for(node of open_set){

                if (get_f_score(node) < lowest){
                    lowest = get_f_score(node)
                    current = node
                }
            }
            if (current === goal){

                return this.reconstruct_path(came_from, current)
            }
            // delete open_set[current]
            open_set = open_set.filter(item => item !== current)
            for (dir of this.movable_dirs){
                curr_cord = current.split("-")
                neighbour = [Number(curr_cord[0]) + dir[0], Number(curr_cord[1]) + dir[1]]
                neighbour_str = neighbour.join("-")
                


                if(cords[`u-${neighbour_str}`] === "wall" || Number(neighbour[0]) > max_x || Number(neighbour[0] < 0 || Number(neighbour[1]) > max_y || Number(neighbour[1] < 0))){
                    tentative_g_score = Infinity

                } 
                else{
                    tentative_g_score = get_g_score(current) + 1
                }

                if (tentative_g_score < get_g_score(neighbour_str)){
                    came_from[neighbour_str] = current
                    g_score[neighbour_str] = tentative_g_score
                    f_score[neighbour_str] = tentative_g_score + this.taxicab_dist(neighbour_str)
                    if (!open_set.includes(neighbour_str)){
                        open_set.push(neighbour_str)
                    }
                }
            }

        }

        
        this.has_retried_a_star = true
        this.redo_a_star = true
        return null
        // return this.a_star(start, goal, max_x, max_y, this.curr_cords)
    }

}

