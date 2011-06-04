var BBN = BBN || (function(){
	
	var _castPlayerHelper = function(array) {
		var i;
		for (i = 0; i < array.length; i++) {
			if (array[i] instanceof BBN.Player) {
				return array[i];
			}
		}
		return null;		
	}
	
	var _castBallHelper = function(array)  {
		var i;
		for (i = 0; i < array.length; i++) {
			if (array[i] instanceof BBN.Ball) {
				return array[i];
			}
		}
		return null;		
	}
	
	var _castGridEntityHelper = function(array) {
		var i, entityArray = [];
		for (i = 0; i < array.length; i++) {
			if (array[i] instanceof BBN.Player || array[i] instanceof BBN.Ball) {
				entityArray.push(array[i]);
			}
		}
		return entityArray;		
	}	
	
	return {
		pitchCanvas: null,
		pitchCanvasContext: null,
		canvas: null,
		canvasContext: null,
		init: function() {
			this.pitchCanvas = document.getElementById("PitchCanvas");
			this.pitchCanvas.reset = function() { this.width = this.width; } //this way of resetting the canvas is stupid
			this.canvas = document.getElementById("GameCanvas");
			this.canvas.reset = function() { this.width = this.width; } //again, stupid
			this.canvasContext = this.canvas.getContext("2d");
			this.pitchCanvasContext = this.pitchCanvas.getContext("2d");
			this.game.init(this.canvas, this.canvasContext, this.pitchCanvas, this.pitchCanvasContext);
		},
		game: {
			pitchUnitSize: 20,
			canvasHeight: 26,
			canvasWidth: 15,
			grid: null,
			init: function(canvas, canvasContext, pitchCanvas, pitchCanvasContext) {
				var i, j;	
				this.grid = new BBN.Grid(this.canvasWidth, this.canvasHeight, this.pitchUnitSize);
				this.pitch.init(pitchCanvas, pitchCanvasContext, this);
				this.match.init(canvas, canvasContext, this);
				this.render();
			},
			wrapFunction: function(fn, context, params) {
				return function() {
					fn.apply(context, params);
				};
			},
			renderQueue: [],
			render: function() {
				for (var i = 0; i < this.renderQueue.length; i++){
					if (typeof this.renderQueue[i] === "function" ) {
						this.renderQueue[i]();
					}
				}
			},
			match: {
				pitch: this.pitch,
				gameContext: null,
				canvas: null,
				canvasContext: null,
				teams: [],
				ball: null,
				selectedPlayer: null,
				renderPlayer: function(gridX, gridY) {
				
					try {
					
						var teamColours = ["rgba(255, 255, 255, 1)"],
							player,
							canvasContext = this.canvasContext,
							grid = this.gameContext.grid,
							gridUnit = grid.unit,
							x, y, i;

						x = (gridX*gridUnit)+gridUnit/2;
						y = (gridY*gridUnit)+gridUnit/2;
						
						player = _castPlayerHelper(grid.space[gridX][gridY]);
						
						if (player === null) {
						
							throw "match.renderPlayer() error: player at grid.space[" + gridX + "][" + gridY + "] === null";
						}
						
						teamColours = player.colours;
						
						renderedColours = canvasContext.createLinearGradient(x, y, x+gridUnit/32, y);

						for (i = 0; i < teamColours.length; i++) {

							if (i > 1) { break; } //not sure what to do if there are more than two colours

							if (i % 2) {
								renderedColours.addColorStop(0, teamColours[i]);
								renderedColours.addColorStop(0.5, teamColours[i]);
							} else {
								renderedColours.addColorStop(0.5, teamColours[i]);
								renderedColours.addColorStop(1, teamColours[i]);
							}
						}

						canvasContext.beginPath();
						canvasContext.arc(x, y, gridUnit/4, 0, Math.PI * 2, false);
						canvasContext.closePath();

						canvasContext.fillStyle = renderedColours;
						canvasContext.fill();
						canvasContext.strokeStyle = "rgba(0,0,0,1)";
						canvasContext.stroke();

						canvasContext.beginPath();
						canvasContext.arc(x, y, gridUnit/4 + 1, 0, Math.PI * 2, false);

						canvasContext.strokeStyle = "rgba(255,255,255,1)";
						canvasContext.stroke();
						canvasContext.closePath();

						canvasContext.font = "6px Arial";
						canvasContext.textBaseline = "middle";
						canvasContext.textAlign = "center";
						canvasContext.fillStyle = "black";
						canvasContext.fillText(player.number, x, y);
					
					} catch(error) {
					
						console.log(error);
					}
				},
				renderBall: function(gridX, gridY) {
					var teamColours,
						canvasContext = this.canvasContext,
						grid = this.gameContext.grid,
						gridUnit = grid.unit,
						x, y;

					x = (gridX*gridUnit)+gridUnit/2;
					y = (gridY*gridUnit)+gridUnit/2;

					canvasContext.beginPath();
					canvasContext.arc(x, y, gridUnit/4, 0, Math.PI * 2, false);
					canvasContext.closePath();

					canvasContext.beginPath();
					canvasContext.arc(x+gridUnit/4, y+gridUnit/4, gridUnit/8 + 1, 0, Math.PI * 2, false);
					canvasContext.fillStyle = "rgba(255,255,0,1)";
					canvasContext.fill();
					canvasContext.strokeStyle = "rgba(0,0,0,1)";
					canvasContext.stroke();
					canvasContext.closePath();					

				},
				renderGrid: function(teams, colour) {
					var grid = this.gameContext.grid,
						gridX, gridY, gridEntities, entity;
					
					if (this.selectedPlayer !== null) {
					
						this.renderSelectedPlayerGrid();
					}
					
					for (gridX = 0; gridX < grid.space.length; gridX++) {

						for (gridY = 0; gridY < grid.space[gridX].length; gridY++) {

							gridEntities = _castGridEntityHelper(grid.space[gridX][gridY]);
						
							if (gridEntities.length > 0) {

								for (entity in gridEntities) {
							
									if (gridEntities[entity] instanceof BBN.Player) {
										
										this.renderPlayer(gridX, gridY);
									
									} else if (gridEntities[entity] instanceof BBN.Ball) {
										
										this.renderBall(gridX, gridY);
									
									}
								}
							}
						}
					}
				},
				renderSelectedPlayerGrid: function() {
					
					var selectedPlayerLocation, selectedPlayer = this.selectedPlayer;
					
					var canvasContext = this.canvasContext;
					
					var x, y, gridX, gridY;
					
					var grid = this.gameContext.grid, gridUnit = grid.unit;
					
					if (selectedPlayer === null) {
						return;
					}
					
					selectedPlayerLocation = this.gameContext.grid.getEntityLocation(selectedPlayer);

					gridX = selectedPlayerLocation[0];
					
					gridY = selectedPlayerLocation[1];
					
					x = gridX*gridUnit;
					y = gridY*gridUnit;

					//render little square under selected player
					//canvasContext.beginPath();
					canvasContext.fillStyle = "rgba(100,170,255,0.5)";
					canvasContext.fillRect(x, y, gridUnit, gridUnit);
					canvasContext.stroke();
					//canvasContext.closePath();

					//render valid movement squares around selected player
					canvasContext.fillStyle = "rgba(100,170,255,0.5)";
					canvasContext.fillRect(x-gridUnit, y-gridUnit, gridUnit, gridUnit);
					canvasContext.fillRect(x-gridUnit, y, gridUnit, gridUnit);
					canvasContext.fillRect(x-gridUnit, y+gridUnit, gridUnit, gridUnit);
					canvasContext.fillRect(x, y+gridUnit, gridUnit, gridUnit);
					canvasContext.fillRect(x, y-gridUnit, gridUnit, gridUnit);
					canvasContext.fillRect(x+gridUnit, y+gridUnit, gridUnit, gridUnit);
					canvasContext.fillRect(x+gridUnit, y, gridUnit, gridUnit);
					canvasContext.fillRect(x+gridUnit, y-gridUnit, gridUnit, gridUnit);
					canvasContext.stroke();
					
				},
				deselectPlayer: function() {
					this.gameContext.match.selectedPlayer = null;
				},
				canvasClick: function(e) {

					var that = e.data.that;
					var grid = that.gameContext.grid;

					var position = $("#PitchCanvas").position();
					var parentPosition = $("#Container").offset();

					var left = e.pageX - position.left - parentPosition.left;
					var top = e.pageY - position.top - parentPosition.top;

					//work out grid position
					var leftGrid = grid.getGridX(left);
					var topGrid = grid.getGridY(top);

					var movementLimit = 1;

					var isEmptySquare, isOutOfBounds, isWithinMovementLimit, isPlayerSelected, player, ball, gridEntities, gridEntity;

					var selectedPlayer = that.selectedPlayer, selectedPlayerLocation;
					
					var i;

					isOutOfBounds = (leftGrid>=grid.space.length-1 || topGrid>=grid.space[0].length-1 || leftGrid < 0 || topGrid < 0);

					isPlayerSelected = (selectedPlayer !== null);
					
					if (isOutOfBounds) {
					
						that.deselectPlayer();
						
					} else {
					
						gridEntities = _castGridEntityHelper(grid.space[leftGrid][topGrid]);
						
						isEmptySquare = (gridEntities.length < 1);
						
						//check for playerSelected
						if (isPlayerSelected) {
						
							selectedPlayerLocation = grid.getEntityLocation(selectedPlayer);
							
							if (isEmptySquare) {
								//move player
								isWithinMovementLimit = (leftGrid <= selectedPlayerLocation[0]+movementLimit && leftGrid >= selectedPlayerLocation[0]-movementLimit) && (topGrid <= selectedPlayerLocation[1]+movementLimit && topGrid >= selectedPlayerLocation[1]-movementLimit)
								if (!isOutOfBounds && isWithinMovementLimit) {
									grid.moveEntity(leftGrid, topGrid, selectedPlayer)
								}
							} else {
							
								if (gridEntities[gridEntity] instanceof BBN.Ball) {
									//pick up ball, or something
									isWithinMovementLimit = (leftGrid <= selectedPlayerLocation[0]+movementLimit && leftGrid >= selectedPlayerLocation[0]-movementLimit) && (topGrid <= selectedPlayerLocation[1]+movementLimit && topGrid >= selectedPlayerLocation[1]-movementLimit)
									if (!isOutOfBounds && isWithinMovementLimit) {
										grid.moveEntity(leftGrid, topGrid, selectedPlayer)
									}
								} else if (gridEntities[gridEntity] === that.selectedPlayer) {
									//self - do nothing probably
								} else if (gridEntities[gridEntity] instanceof BBN.Player) {

									//if other teamm
									//BLOCK

								} else {
								
								}
							}
						} else {
							//no player selected
							//check to see if there's anything in this space
							if (!isEmptySquare) {
								for (gridEntity in gridEntities) {
									while (that.gameContext.match.selectedPlayer === null) {
										if (gridEntities[gridEntity] instanceof BBN.Player) {
											gridEntities[gridEntity].onSelect = that.gameContext.match.playerSelect;
											that.gameContext.match.selectedPlayer = gridEntities[gridEntity];
										}
									}
								}
							}
						}
					}
				},
				canvasMouseMove: function(e) {

					var that = e.data.that;
					var grid = that.gameContext.grid;
					var unit = that.gameContext.pitchUnitSize;
					var canvasContext = that.canvasContext;
					var canvas = that.canvas;

					var position = $("#PitchCanvas").position();
					var parentPosition = $("#Container").offset();

					var left = e.pageX - position.left - parentPosition.left;
					var top = e.pageY - position.top - parentPosition.top;

					//work out grid position
					var leftGridRender = Math.ceil(left/unit) * unit - unit;
					var topGridRender = Math.ceil(top/unit) * unit - unit;

					var leftGrid = Math.floor(left/unit);
					var topGrid = Math.floor(top/unit);

					var gridCursorFillStyle = "rgba(0,0,0,0.7)";

					var outOfBounds = (leftGrid>=grid.space.length-1 || topGrid>=grid.space[0].length-1);

					canvas.reset();

					if (!outOfBounds) {
						canvasContext.beginPath();
						canvasContext.fillStyle = gridCursorFillStyle;
						canvasContext.fillRect(leftGridRender, topGridRender, unit, unit);
						canvasContext.closePath();
					}					that.gameContext.render();
				},
				generateGameTemp: function() {
					var player, i, gameContext, grid, pitchUnitSize, pitchRow;

					console.log("generateGameTemp()");

					this.ball = new Ball();

					var team1 = new Team("Reikland Reavers");
					var team2 = new Team("Orcland Raiders");

					team1.shout();
					team2.shout();

					team1.colours = ["rgba(0,0,255,1)","rgba(255,255,255,1)"];

					for (i = 0; i < 11; i++) {
						player = new Player("human" + i, team1, i+1);
						team1.players.push(player);
					}

					for (i = 0; i < 11; i++) {
						player = new Player("orc" + i, team2, i+1);
						team2.players.push(player);
					}

					this.teams.push(team1);
					this.teams.push(team2);

					localStorage["teams"] = JSON.stringify(this.teams);
				},
				dumpPlayersOntoPitchTemp: function() {

					var i, j, x, y, gridX, gridY, teams, gameContext, halfWayY, OffSetX, OffSetY;

					gameContext = this.gameContext;
					teams = this.teams;
					grid = gameContext.grid;
					pitchUnitSize = gameContext.pitchUnitSize;
					OffSetX = 2;
					OffSetY = -1;

					halfWayY = Math.floor(grid.space[0].length/2);

					for (i = 0; i < teams.length; i++) {
						for (j = 0; j < teams[i].players.length; j++) {
							x = (j*pitchUnitSize)+pitchUnitSize/2;
							y = (i*pitchUnitSize)+pitchUnitSize/2;
							gridX = grid.getGridX(x);
							gridY = grid.getGridY(y);
							grid.space[gridX+OffSetX][gridY+halfWayY+OffSetY].push(teams[i].players[j]);							
						}
					}

					var randomX, randomY;

					randomX = Math.floor(Math.random()*(grid.space.length - 1));
					randomY = Math.floor(Math.random()*(grid.space[0].length/2 - 1));

					if (grid.space[randomX][randomY].length > 0) {
						//ball's fallen onto a player
						console.log("ball's landed on " + grid.space[randomX][randomY][0].name + " - do something");
					}

					grid.insertEntity(randomX, randomY, this.ball);
				},
				rehydratePlayers: function() {
					var i, j, player, teams = [], JSONteams = JSON.parse(localStorage["teams"]);

					console.log("rehydratePlayers()");

					this.ball = new BBN.Ball();

					for (i = 0; i < JSONteams.length; i++) {				
						teams[i] = new BBN.Team(JSONteams[i].name);				
						for (j = 0; j < JSONteams[i].players.length; j++) {					
							player = new BBN.Player(JSONteams[i].players[j].name, JSONteams[i], JSONteams[i].players[j].number);					
							teams[i].players.push(player);
						}					
					}				
					this.teams = teams;
				},
				init: function(canvas, canvasContext, gameContext) {
					var i;
					this.gameContext = gameContext;
					this.canvas = canvas;
					this.canvasContext = canvasContext;

					if (localStorage["teams"] === null || localStorage["teams"] === undefined) {
						this.generateGameTemp();
					} else {
						this.rehydratePlayers();
					}

					this.dumpPlayersOntoPitchTemp();

					this.gameContext.renderQueue.push(gameContext.wrapFunction(this.renderGrid, this, [this.teams, "rgba(255,0,0,0.5)"]));

					$(this.canvas).mousemove({that: this}, this.canvasMouseMove);
					$(this.canvas).click({that: this}, this.canvasClick);
				}
			},
			pitch: {
				gameContext: null,
				leftOrigin: null,
				topOrigin: null,
				unitBorderColour: null,
				unitFillColour: null,
				boundaryLineColour: null,
				canvasContext: null,
				controls: {
					canvas: null
				},
				render: function() {

					var gameContext = this.gameContext,
						grid = this.gameContext.grid,
						canvas = this.controls.canvas,
						canvasContext = this.canvasContext,
						unit = this.gameContext.pitchUnitSize,
						width = this.gameContext.canvasWidth,
						height = this.gameContext.canvasHeight,
						unitBorderColour = this.unitBorderColour,
						unitFillColour = this.unitFillColour,
						boundaryLineColour = this.boundaryLineColour,
						pitchImage = new Image()

					pitchImage.src="Pitch.jpg";
					pitchImage.onload = function(e) {

						canvas.reset();

						//canvasContext.drawImage(pitchImage, 0, 0, unit*width, unit*height);
						canvasContext.beginPath();
						canvasContext.fillStyle = unitFillColour;
						canvasContext.fillRect(0,0,width*unit,height*unit);

						//vertical grid lines
						for (var x=0.5; x < (width*unit)+unit; x+=unit)
						{
							canvasContext.moveTo(x, 0);
							canvasContext.lineTo(x, height*unit);
						}
						//horizontal grid lines
						for (var y=0.5; y < (height*unit)+unit; y+=unit)
						{
							canvasContext.moveTo(0, y);
							canvasContext.lineTo(width*unit, y);
						}
						canvasContext.strokeStyle=unitBorderColour;
						canvasContext.stroke();

						//upper touchline
						canvasContext.beginPath();
						canvasContext.moveTo(0, 1*unit);
						canvasContext.lineTo(width*unit, 1*unit);
						canvasContext.strokeStyle=boundaryLineColour;
						canvasContext.stroke();

						//halfway line
						canvasContext.beginPath();
						canvasContext.moveTo(0, (height*unit)/2);
						canvasContext.lineTo(width*unit, (height*unit)/2);
						canvasContext.strokeStyle=boundaryLineColour;
						canvasContext.stroke();

						//lower touchline
						canvasContext.beginPath();
						canvasContext.moveTo(0, height*unit-unit);
						canvasContext.lineTo(width*unit, height*unit-unit);
						canvasContext.strokeStyle=boundaryLineColour;
						canvasContext.stroke();

						//left sideline
						canvasContext.beginPath();
						canvasContext.moveTo(4*unit, 0);
						canvasContext.lineTo(4*unit, unit*height);
						canvasContext.strokeStyle=boundaryLineColour;
						canvasContext.stroke();

						//right sideline
						canvasContext.beginPath();
						canvasContext.moveTo(11*unit, 0);
						canvasContext.lineTo(11*unit, unit*height);
						canvasContext.strokeStyle=boundaryLineColour;
						canvasContext.stroke();

						canvasContext.closePath();
					}
				},
				init: function(canvas, canvasContext, gameContext) {
					this.gameContext=gameContext;
					this.unitFillColour="rgba(0,255,0,0)";
					this.unitBorderColour="rgba(0,0,0,0.1)";
					this.boundaryLineColour="rgba(255,255,255,1)";
					this.controls.canvas=canvas;
					this.canvasContext=canvasContext;
					gameContext.renderQueue.push(gameContext.wrapFunction(this.render, this));
				}
			}
		}
	}
}());