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


class Floor extends Tile{

    constructor(x,y){

        super(x, y, 0, true);

    };

}


class Wall extends Tile{

    constructor(x, y){

        super(x, y, 1, false);

    }

}