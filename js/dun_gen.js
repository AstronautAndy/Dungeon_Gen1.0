var grid = [];
var edgeSpaces = [];
var nodes = [];
var monster_spwn = []; //set of ordered pairs signifying where monsters are placed
////////////////////////////////
var Room_minHeight = 5;
var Room_maxHeight = 9;
var Room_minWidth = 3;
var Room_maxWidth = 8;
var Min_entrances = 2;
var Max_entrances = 5;
var Min_rooms = 7; //The minimum number of rooms that will appear on a floor
var Max_rooms = 12;//Maximum number of rooms that will appear on a floor
var min_exits = 1; //minimum number of spaces within a room that can "spawn" a hallway to another room
var max_exits = 4; //maximum number of spaces within a room that can "spawn" a hallway to another room
var taken_spaces = [];
var room_spaces = []; //set of spaces used in a dungeon "room" 
var node_set = [];
////////////////////////////////
let max_attempts = 5; //Maximum number of attempts allowed to place a new room down
var gridLength = 40;
var gridHeight = 40;
var tunnelLength = 15;  
var sparseness = 1.5; //How spare or dense the edges will be in this particular graph
let north_probability = 0.25;
let east_probability = 0.5;
let south_probability = 0.75;
let west_probability = 1.0;
let monster_chance = 0.60; //probability of the dungeon generator spawning a monster in the current room
//let skip = 2;
var direction; //used in the generation algorithm
var playerStart; //coordinate pair representing the starting position of the PC

//Going to implement a feature where the program allows x interlapping tiles. Could be interesting...
let allowed_overlap = 50;

//Create a "blank" map of wall tiles 
function initialize(){
	for(let i=0; i<gridHeight; i++){
		grid[i] = [];
		for(let j=0; j<gridLength; j++){
			grid[i][j] = new Wall(i,j); //Start by filling the entire map with walls
		}
	}
	setRoom(); //set down a "first" room where the player will start
	playerStart = setPlayerStart(); //set the starting location for the player
}

/*Function used to initialize the current floor of the dungeon. 
**Creates rooms and hallways to connect each of the rooms.
* Sets enemy placement and items
*/
function create_floor(){
	let number_floors = Math.floor(Math.random() * (Max_rooms-Min_rooms) ) + Min_rooms;
	
	initialize(); //Fills an n x n floor full of wall tiles
	for(let i=0; i<number_floors-1; i++){ //Place the remaining rooms on this floor after the first room has been placed
		setRoom();
	}
	//Create hallway connections between each of the rooms to form a connected graph
	var connected_set = []; //initialize the set of connected nodes
	let hallways = number_floors + Math.floor(number_floors*sparseness); //Number of "extra" hallways deteermined by the sparseness factor
	connected_set.push(node_set[0]); //add the first node from the node set to connected to initialize the process
	for(let i=1; i<node_set.length;i++){
		hallways--; //decrease the number of "extra" hallways we'll have to create after creating a "necessary" hallway
		let random_index = Math.floor(Math.random() * connected_set.length); //generate a randomly selected index number from the connected set
		tunnel(node_set[i],connected_set[random_index]);//draw tunnel from randomly selected node in connected_set to the current [i] node
		connected_set.push(node_set[i]); //Add current node to the set of connected nodes
	} 
	//Now create the "extra" hallways
	for(let i=0; i<hallways; i++){
		let random_index0 = Math.floor(Math.random() * connected_set.length);
		let random_index1 = Math.floor(Math.random() * connected_set.length);
		tunnel(connected_set[random_index0],connected_set[random_index1]);
	}
	
	let ladderLocation = setExit(playerStart); //set the exit ladder
	delete grid[ladderLocation[0]][ladderLocation[1]];
	grid[ladderLocation[0]][ladderLocation[1]] = new Ladder(ladderLocation[0],ladderLocation[1]); //replace the location with a ladder
}

/* Function used for finding a random space that a room can occupy*/
function setRoom(){
	var startXY; 
	let width = Math.floor(Math.random() * (Room_maxWidth-Room_minWidth) ) + Room_minWidth;
	let height = Math.floor(Math.random() * (Room_maxHeight-Room_minHeight) ) + Room_minHeight;
	let num_exits = Math.floor(Math.random() * (max_exits-min_exits) ) + min_exits; //number of exits from this room must be between min_exits and max_exits
	var spaces_set = []; //array of spaces to be taken up by this room.
	updateSpaceList();
	var valid = false; //boolean to determine if the room is to be placed in a valid location
	var attempts = max_attempts;

	while(valid == false || attempts > 0){ //While either the placement is still invalid or you still have attempts remaining, keep attempting to place the room in a valid location
		if(startXY[0]+width > gridLength-2 || startXY[1]+height > gridHeight-2){ //check for out of bounds case
			attempts--; //decrement attempts remaining by one
			updateSpaceList();
		} 

		else{
			attempts = 0; //stop the program from entering an infinite loop
			valid = true;
			for(let i=0; i<width; i++){ //Initialize the set of spaces
				
				for(let j=0; j<height; j++){
					taken_spaces.push([spaces_set[i][j][0],spaces_set[i][j][1]]);//add the coordinate pair of the current space to taken spaces
					delete grid[spaces_set[i][j][0] ][spaces_set[i][j][1] ]; //Delete the wall at the starting location...
					grid[spaces_set[i][j][0] ][spaces_set[i][j][1] ] = new Floor(spaces_set[i][j][0] , spaces_set[i][j][1]); //... and replace it with a floor.
				}
			}
			for(let i=0; i<num_exits;i++){ //set i exits in this particular room
				let random_i = Math.floor((Math.random() * (spaces_set.length)));
				let random_j = Math.floor((Math.random() * (spaces_set[0].length)));
				let randomPair = [spaces_set[random_i][random_j][0],spaces_set[random_i][random_j][1]];
				node_set.push(randomPair); //use the pair we generated to represent the room as a "node"
			}
			
		}
	}

	//After a valid location has been set and "hollowed out," determine whether to place a monster in this room
	let monster_roll = Math.random();
	if(monster_roll < monster_chance){ //spawn a monster in this location should you roll under the chance variable
		
		let random_i = Math.floor((Math.random() * (spaces_set.length))); //choose x coordinate randomly
		let random_j = Math.floor((Math.random() * (spaces_set[0].length))); //choose y coordinate randomly
		let randomPair = [spaces_set[random_i][random_j][0],spaces_set[random_i][random_j][1]];
		console.log("Spawned a monster at", randomPair);
		monster_spwn.push(randomPair);
	}

	function updateSpaceList(){
		startXY = randomCoor(); //reset the starting position
		for(let i=0; i<width; i++){ //Initialize the set of spaces
			spaces_set[i] = [];
			for(let j=0; j<height; j++){
				spaces_set[i][j]=[startXY[0]+i,startXY[1]+j];
			}
		}
	}


}

/*Input - two arrays, each containing the x,y coordinates of the start node and the end node respectively	
* Designed for drawing edges between two nodes
*/
function tunnel(start, end){
	let startXY = start; //Sleect the start x and y coordinates at random
	//console.log("Start point: ", startXY);
	
	var visited_stack = []; //Initialize a stack of spaces that we've already visited

	var currXY = startXY; //Initialize the currentXY variable
	//console.log("Starting grid: ", grid[currXY[0],currXY[1]]);
	
	delete grid[ startXY[0]][startXY[1]]; //Delete the wall at the starting location...
	grid[startXY[0]][startXY[1]] = new Floor(startXY[0] , startXY[1]); //... and replace it with a floor.
	var complete = false;

	while(complete == false){

		updateCurrSpace();
		//console.log(currXY);
		delete grid[ currXY[0]][currXY[1]]; //Delete the wall at the starting location...
		grid[currXY[0]][currXY[1]] = new Floor(currXY[0] , currXY[1]); //... and replace it with a floor.
		if(currXY[0] == end[0] && currXY[1] == end[1]){
			complete = true;
		}
	}
	
	//console.log("End coordinates: ", end);

	/**Function used in the tunneling function to update the current position. 
	***There's four cases - the end location is further in one of four directions
	*/
	function updateCurrSpace(){
		let angle = calcAngle(currXY,end); 
		let bias = 0.55;
		let roll = Math.random();
		if(angle <= 0.785){ //case from 0 to pi/4 (45 degrees)
			if(roll < bias){
				moveEast();
			}
			else{ moveNorth();} //greater chance of moving East than there is moving north
		}
		else if(angle <= 1.57){ //case from pi/4 (45 degrees) to pi/2 (90 degrees)
			if(roll < bias){
				moveNorth();
			}
			else{ moveEast();} //greater chance of moving North than there is moving East
		}
		else if(angle <= 2.355){ //case from pi/2 (90 degrees) to pi*3/4 (135 degrees)
			if(roll < bias){
				moveNorth();
			}
			else{ moveWest();} //greater chance of moving North than there is moving West
		}
		else if(angle <= 3.14){ //case from pi*3/4 (135 degrees) to pi (180 degrees)
			if(roll < bias){
				moveWest();
			}
			else{ moveNorth();} //greater chance of moving North than there is moving West
		}
		else if(angle <= 3.925){ //case from pi*3/4 (135 degrees) to pi (180 degrees)
			if(roll < bias){
				moveWest();
			}
			else{ moveSouth();} //greater chance of moving West than there is moving South
		}
		else if(angle <= 4.71){ //case from pi*3/4 (135 degrees) to pi (180 degrees)
			if(roll < bias){
				moveSouth();
			}
			else{ moveWest();} //greater chance of moving South than there is moving West
		}
		else if(angle <= 5.495){ //case from pi*3/4 (135 degrees) to pi (180 degrees)
			if(roll < bias){
				moveSouth();
			}
			else{ moveEast();} //greater chance of moving South than there is moving West
		}
		else if(angle <= 6.28){ //case from pi*3/4 (135 degrees) to pi (180 degrees)
			if(roll < bias){
				moveEast();
			}
			else{ moveSouth();} //greater chance of moving South than there is moving West
		}
	}

	function onEdge(){
		if(currXY[1]==0 || currXY[1] == gridHeight-1 || currXY[0] == 0 || currXY[0] == gridLength-1){
			return true;
		}
		else{
			return false;
		}
	}

	function calcAngle(startPoint, endPoint){
		let angle = Math.atan((endPoint[1]-startPoint[1])/(endPoint[0]-startPoint[0]));
		if(endPoint[0]-startPoint[0] < 0) angle += 3.14; //if x < 0 add 180 to the angle
		else if(endPoint[1]-startPoint[1] < 0) angle += 6.28;
		return angle;
	}

	function moveNorth(){ currXY[0]+=0; currXY[1]+=1;} //Advance curr position North
	function moveEast(){ currXY[0]+=1; currXY[1]+=0;} //Advance curr position East
	function moveSouth(){ currXY[0]+=0; currXY[1]-=1;} //Advance curr position South
	function moveWest(){ currXY[0]-=1; currXY[1]+=0;} //Advance curr position West


}

/**
Function used to determine which monster should be spawned in at this particular location.
*/
function chooseMonster(){

}

//Takes the starting location of the player and sets the ladder a suitable distance from them. 
function setExit(player_start){
	let attempts = 5;
	let min_distance = 10;
	var chosen_distance = 0;
	var chosen_space ;
	while(chosen_distance <= min_distance || attempts > 0){
		chosen_space = taken_spaces[Math.floor(Math.random() * taken_spaces.length)];
		chosen_distance = Math.sqrt(Math.pow((chosen_space[0]-player_start[0]),2)+Math.pow((chosen_space[0]-player_start[0]),2));
		attempts--;
	}
	return chosen_space;
}

//Returns a random starting location for the player when they enter this dungeon floor
function setPlayerStart(){
	return taken_spaces[Math.floor(Math.random() * taken_spaces.length)]; //randomly choose a coordinate pair from the set of room spaces
}

/*Function used to select a random coordinate pair within the  */
function randomCoor(){
	let x = Math.floor(Math.random() * (gridLength-2) ) + 1;
	let y = Math.floor(Math.random() * (gridHeight-2) ) + 1;
	return [x,y];
}

//For now I'm using the following standard:
//Basic Floor = 0
//Basic Wall = 1
class Tile{
	constructor(x, y, type, passable){
        this.x = x;
        this.y = y;
        this.type = type;
        this.passable = passable;
	}
}

//A tile can be occupied by a monster, a ladder, or an item
class Floor extends Tile{
    constructor(x,y){
        super(x, y, 0, true);
    };

    setOccupied(){
    	
    }
}


class Wall extends Tile{

    constructor(x, y){

        super(x, y, 1, false);

    }

}

class Ladder extends Tile{
	constructor(x,y){
		super(x,y,2,false)
	}
}