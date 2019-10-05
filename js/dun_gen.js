var all_spaces = []; //an array of all spaces inhabited by rooms in the dungeon floor
var all_rooms = []; //array of all rooms that inhabit this floor of the dungeon
var edge_spaces = [];
var room_spaces = []; //Indicates which spaces are taken by a room
var n_edge_spaces = []; //north edge spaces
var e_edge_spaces = []; //east edge spaces
var s_edge_spaces = []; //south edge spaces
var w_edge_spaces = []; //west edge spaces
var opCode = 0;
var Room_minHeight = 4;
var Room_maxHeight = 10;
var Room_minWidth = 4;
var Room_maxWidth = 10;
var Min_entrances = 2;
var Max_entrances = 5;
var Min_rooms = 5; //The minimum number of rooms that will appear on a floor
var Max_rooms = 20;//Maximum number of rooms that will appear on a floor
var field_boundaryX = Room_maxWidth*2; // The maximum x value that you can start a new room at
var field_boundaryY = Room_maxHeight*2; // The maximum y value that you can start a new room at

/**
*The purpose of this script is to generate a dungeon represented by characters where each character denotes a type of tile placed on the "map"
*/
function create_floor(){
	var room_count = choose_floors(Min_rooms,Max_rooms);
	var tempXY = [];
	
	//Iterate through the number of rooms and place each at a random location
	for(var it = 0; it<room_count; it++){	
		//Math.floor(Math.random() * (max - min)) + min;
		var temp_x = Math.floor(Math.random() * (Room_maxWidth-Room_minWidth)) + Room_minWidth;
		var temp_y = Math.floor(Math.random() * (Room_maxHeight-Room_minHeight)) + Room_minHeight;
		tempXY = chooseFloorPlacement(temp_x,temp_y);
		//console.log(tempXY);
		addRoom(tempXY[0],tempXY[1],temp_x,temp_y);
	}

}

/**
* Function used to determine the number of rooms used in the dungeon. 
*/
function choose_floors(low, high){
	var count = high+1;
	while(count > high){
		count = Math.floor(Math.random() * high) + low; // returns a random integer from low to 10 
	}
	//console.log(count);
	return count;

}

/**
*Receives the room length and height, chooses a random placement checks against currently existing rooms to verify where it can be placed.
*Returns an ordered pair [x,y] indicating where a room, given its dimensions, can be placed.   
*/
function chooseFloorPlacement(xLength, yLength){
	var temp_x = Math.floor(Math.random() * field_boundaryX);
	var temp_y = Math.floor(Math.random() * field_boundaryY);
	var corners = [[temp_x,temp_y],[temp_x,temp_y+yLength-1],[temp_x+xLength-1,temp_y],[temp_x+xLength-1,temp_y+yLength-1]]; //Array containing each of the corners
	//console.log(corners);
	var overlap = new Boolean(true);
	//console.log(room_spaces);
	//console.log(room_spaces);

	while(overlap){  
		overlap = false; //Assume there's no overlap before testing
		for(var it =0; it<corners.length; it++){ //Check each available corner against the list of set spaces
			//console.log(corners[it], room_spaces.includes(corners[it]));
			if(room_spaces.includes(corners[it]))
				{ //If the given edge already exists, set overlap to true
					console.log("Collision");
					overlap = true;
					//Reset the randomized coordinates and try again in the while loop
					var temp_x = Math.floor(Math.random() * field_boundaryX);
					var temp_y = Math.floor(Math.random() * field_boundaryY);
				}
		}		
		
	}

	
	return([temp_x,temp_y]);
}





	function Room(startX, startY, xLength, yLength){ //constructor
		this.x = startX;
		this.y = startY;
		//Add all squares to their respective containers
		for(var y_it = startY; y_it< startY + yLength; y_it++){
			if(y_it == startY) opCode = 'E';
			else if(y_it == startY + yLength-1) opCode = 9;
			else opCode = 2;
			
			edge_spaces.push([startX,y_it,opCode]); //WEST edge of a room
			w_edge_spaces.push([startX,y_it,1]);

			if(y_it == startY) opCode = 'C';
			else if(y_it == startY + yLength-1) opCode = 'F';
			else opCode = 8;
			edge_spaces.push([(startX+xLength-1),y_it,opCode]); //EAST edge of a room
			e_edge_spaces.push([(startX+xLength-1),y_it,1]);

			for(var x_it = startX; x_it < startX+xLength; x_it++){
				if(x_it > startX && x_it < startX+xLength-1 ){
					if(y_it == startY){
						edge_spaces.push([x_it,startY,'B']); //SOUTH edges of a room
						s_edge_spaces.push([x_it,startY,1]);
					}

					else if(y_it == (startY+yLength-1)){
						edge_spaces.push([x_it,(startY+yLength-1),5]); //NORTH edges of a room
						n_edge_spaces.push([x_it,(startY+yLength-1),1]);					
					}
				}	
				all_spaces.push([x_it,y_it,1]); //mark on the list that a particular space is 'taken'
				room_spaces.push([x_it,y_it]);
			}
		}
		all_rooms.push[this]; //add the newly created room to the array of rooms on this floor
	}


var complexRoom = {

}

function H_hallway(startX, startY, xLength){
	this.x = startX;
	this.y = startY;
	if(xLength != 0){
		for(var x_it = startX; x_it < startX+xLength; x_it++){
			all_spaces.push([x_it,startY,6]);
		}
	}
}

function V_hallway(startX, startY, yLength){
	this.x = startX;
	this.y = startY;
	if(yLength != 0){
		for(var y_it = startY; y_it < startY+yLength; y_it++){
			all_spaces.push([startX,y_it,3]);
		}
	}
}

/**
*This function is used to check if a space has been taken by a room or hallway before placing the room
*/
function addRoom(startX, startY, xLength, yLength){
	var newRoom = Room(startX,startY,xLength,yLength);
}