function Player(stairTemp,x,y,FOR,CON,TAI,DEX,race)
{
	
	this.messages=new HUD(1,11);
	
	//Position variables
	this.x=x;
	this.y=y;
	this.stair=stairTemp;
	
	//Characteristics variable
	this.name="Conan";
	this.class=race;
	this.light=this.class.Light;
	this.force=FOR*this.class.For;
	this.constitution=CON*this.class.Con;
	this.taille=TAI*this.class.Tai;
	this.dexterite=DEX*this.class.Dex;
	this.life=(this.constitution+this.taille)/2;
	total=0;
	for(i=0;i<this.class.Launch;i++)
	{
		lancer=Math.random()*6+1;
		lancer=Math.floor(lancer);
		total=total+lancer;
	}
	total=total*this.class.Lrm;
	this.life+=total;
	this.lifeMax=this.life;
	this.atk=1;
	this.lrm=this.class.Lrm;
	this.launch=this.class.Launch;
	
	//Inventory,Talent and Equipement variables
	this.talents=new Talent(this);
	this.equipement=new Equipement(this);
	this.pound=Math.floor(((this.taille*2+this.constitution)/3)/4)+20;
	this.inventory=new Inventory(this);
	this.inventory.add(this.class.Weapon.getId());
	this.inventory.use();
	this.inventory.add(LeatherHood.getId());
	this.inventory.use();
	this.inventory.add(LinenShirt.getId());
	this.inventory.use();
	this.inventory.add(LinenTrousers.getId());
	this.inventory.use();
	this.inventory.add(Lighter.getId());
	this.inventory.add(Scroll.getId());

	//Stats variables
	this.hygiene=100;
	this.faim=100;
	this.sommeil=100;
	this.soif=100;
	this.isSick=false;
	this.onFire=false;
	this.isSleeping=false;
	this.sleepInterval=0;
	this.sleepFrame=0;
	this.effectList=new Array();
	this.spell=false;
	this.fireInterval=5;
	this.fireFrame=0;
	this.previousTile=1;
	this.sickInterval=10;
	this.sickFrame=0;
	this.healInterval=20;
	this.healFrame=0;
	this.sympathy=0;
	this.antipathy=0;
	
	//Other variables
	this.frame=0;
	this.image=this.class.File;
	this.sprite=new Image();
	this.spriteFrame=1;
	this.lastTile=1;
	this.score=0;
	this.img=this.class.Img;
	this.visibleBlockList=new Array();
	this.fireEffect=new VisualEffect(0);
	this.ohi=new OHI(this);
	
}

/**
 * Returns the player's talents instance
 */
Player.prototype.getTalents=function()
{
	return this.talents;
}


/**
 * Returns the player's current stair
 */
Player.prototype.getStair=function()
{
		return this.stair;
}


/**
 * Exits the spell
 */
Player.prototype.reset=function()
{
	this.spell=false;
}

/**
 * Sets the onFire trigger to true.
 */
Player.prototype.setFire=function()
{
	this.onFire=true;
}


/**
 * Sets the spell and call it
 */
Player.prototype.callSpell=function(spellTemp)
{
	this.spell=spellTemp;
	this.spell.launch(this);
}


/**
 * Allow the player to rest
 */
Player.prototype.rest=function() 
{
	if(this.sommeil<100)
	{
		this.isSleeping=true;
		this.sendMessage("Vous vous allongez par terre et penetrez dans un sommeil profond...");
		this.light=0;
	}
}

Player.prototype.sleep=function()
{
	if(this.isSleeping)
	{
		this.light=0;
		this.sleepFrame+=1;
		if(this.sleepFrame>=20)
		{
			this.sommeil+=1;
			this.move();
			this.lightZone();
			this.sleepFrame=0;
		}
		if(this.sommeil>=100)
		{
				this.isSleeping=false;
				this.light=this.class.Light;
				this.lightZone();
				this.sendMessage("Vous vous reveillez enfin, apres avoir passe une mauvaise nuit.");
				if(this.previousTile==3)
				{
					this.isSick=true;
					this.sendMessage("Malheureusement, vous etes tombe malade: vous vous etes endormis dans une mare...");
				}
		}
	}
}

/**
 * Show a message in the player's HUD
 */
Player.prototype.sendMessage=function(msg)
{
		this.messages.add(msg);
}


/**
 * Sets the player's current stair
 */
Player.prototype.setStair=function(stairTemp)
{
	this.stair=stairTemp;
}


/**
 * Returns the player's current stair
 */
Player.prototype.getStair=function()
{
	return this.stair;
}

/**
 * Sets the sympathy temp amount
 */
Player.prototype.setSympathy=function(value)
{
	this.sympathy=value;
}

/**
 * Returns the sympathy temp amout
 */
Player.prototype.getSympathy=function()
{
	return this.sympathy;
}

/**
 * Sets the antipathy temp amount
 */
Player.prototype.setAntipathy=function(value)
{
	this.antipathy=value;
}

/**
 * Returns the antipathy temp amout
 */
Player.prototype.getAntipathy=function()
{
	return this.antipathy;
}


/**
 * Returns the player's name
 */
Player.prototype.getName=function()
{
	return this.name;
}

/**
 * Draws the player on the screen
 */
Player.prototype.draw=function()
{

	
	if(this.faim>100)
		this.faim=100;

	if(this.soif>100)
		this.soif=100;

	if(this.sommeil>100)
		this.sommeil=100;

	if(this.hygiene>100)
		this.hygiene=100;
		
	if(this.faim<0)
		this.faim=0;

	if(this.soif<0)
		this.soif=0;

	if(this.sommeil<0)
		this.sommeil=0;

	if(this.hygiene<0)
		this.hygiene=0;

	if(this.life<=0 || this.soif<=0 || this.faim<=0)
		this.kill();
		
	if(this.spell != false)
		this.spell.update();
		
	this.sleep();

	this.messages.draw();

	if(!Parameters.isTiled())
	{
		surface.font = "30px pixel";
		surface.fillStyle="rgb(50,150,50)";
		surface.fillText(this.img, Client.getXPos()+this.x*32, Client.getYPos()+this.y*32);
		if(this.onFire==true)
		{
			surface.fillStyle="rgb(250,50,50)";
			surface.fillText("W", Client.getXPos()+this.x*32, Client.getYPos()+this.y*32);
		}
	}
	else
	{
		TileSet.draw(Client.traduceInTileIndex(this.previousTile,this.stair,this.x,this.y),Client.getXPos()+this.x*32,Client.getYPos()+this.y*32);
		Client.drawShadow(this.x,this.y);
		this.frame+=1;
		if(this.frame>20)
		{
			this.spriteFrame+=1;
			this.frame=0;
			if(this.spriteFrame>2)
				this.spriteFrame=1;
			this.sprite.src="graphics/characters/"+this.image+"/"+this.image+"-"+this.spriteFrame+".png";
		}
		surface.drawImage(this.sprite,Client.getXPos()+(this.x)*32,Client.getYPos()+this.y*32);
		if(this.onFire)	
			this.fireEffect.draw(Client.getXPos()+(this.x)*32,Client.getYPos()+this.y*32);		
	}
	this.ohi.draw();
}

/**
 * Manages the player's movements 
 */
Player.prototype.move=function(dir)
{	
	if(this.spell==false)
	{	
		if(!this.isSleeping)
		{
				
			stair=this.stair;
			for(c=0;c<this.effectList.length;c++)
			{
				if(this.effectList[c] != null && this.effectList[c] instanceof StatEffect)
				{
					this.effectList[c]=this.effectList[c].update();
				}
			}
			this.heal();
			this.fire();
			this.sick();
			this.lastTile=this.previousTile;
			stair.map[this.x][this.y]=this.previousTile;
			switch(dir)
			{				
				case "right":
					xTemp=this.x+1;
					break;
				case "left":
					xTemp=this.x-1;
					break;
				case "down":
					yTemp=this.y+1;
					break;
				case "up" :		
					yTemp=this.y-1;
					break;
			}
			passable=true;
			for(p=0;p<this.stair.monsters.length;p++)
			{
				if(this.stair.monsters[i] != undefined && this.stair.monsters[i].getX()==xTemp && this.stair.monsters[i].getY()==yTemp)
				{
					passable=false
				}
			}
			if(passable)
			{
				switch(dir)
				{				
					case "right":
						if(stair.walkable(this.x+1,this.y))
						{
							this.x+=1;
							Client.setXPos(Client.getXPos()-32);
						}
						break;
					case "left":
						if(stair.walkable(this.x-1,this.y))
						{
							this.x-=1;
							Client.setXPos(Client.getXPos()+32);
						}
						break;
					case "down":
						if(stair.walkable(this.x,this.y+1))
						{
							this.y+=1;
							Client.setYPos(Client.getYPos()-32);
						}
						break;
					case "up" :		
						if(stair.walkable(this.x,this.y-1))
						{
							this.y-=1;
							Client.setYPos(Client.getYPos()+32);
						}
						break;
				}
				this.lightZone();
				this.getObject();
				this.previousTile=stair.getMap()[this.x][this.y];
				this.contextMessage();
				stair.map[this.x][this.y]=-1;
				
				if(this.stair.getMap()[this.x+1][this.y]==0)
				{
						this.stair.getMap()[this.x+1][this.y]=1;
				}
						
				if(this.stair.getMap()[this.x-1][this.y]==0)
				{
						this.stair.getMap()[this.x-1][this.y]=1;
				}
						
				if(this.stair.getMap()[this.x][this.y+1]==0)
				{
						this.stair.getMap()[this.x][this.y+1]=1;
				}
						
				if(this.stair.getMap()[this.x][this.y-1]==0)
				{
						this.stair.getMap()[this.x-1][this.y]=1;
				}
			}
		}
	}
	else
		this.spell.move(dir);
		
		this.changeStat();
}

/**
 * if the isSick trigger is on true, then inflict some damages to the player 
 */
Player.prototype.sick=function()
{
	if(this.isSick==true)
	{
		this.sickFrame+=1;
		if(this.sickFrame>=this.sickInterval)
		{
			if(Math.floor(Math.random()*20)+1==1)
			{
				this.sendMessage("Vous sentez une amelioration de votre etat de sante, vous pouvez enfin respirer normalement.");
				this.isSick=false;
				return;
			}
			
			if(this.life>=10)
			{
				this.sendMessage("La maladie vous affaiblie.");
				this.addEffect(new StatEffect(this,"sick",-2,0,-Math.round(20*this.constitution/100),0,0,-Math.round(this.life/2),0,0,this.sickInterval,0,false));
			}
			else
			{
				this.sendMessage("Vous toussez dans votre main et essuyez le sang qui s'y trouve sur vos vetements.");
				this.addEffect(new StatEffect(this,"sick",-2,0,-Math.round(20*this.constitution/100),0,0,-Math.round(this.life/2),0,0,this.sickInterval,0,false));
			}
			this.sickFrame=0;
		}
	}
			if(!this.isSick && this.hygiene<=20 && Math.floor(Math.random()*10)+1==1)
			{
				this.sendMessage("Vous etes soudainement pris de nausee...");
				this.sendMessage("Vous etes certainement tombe malade.");
				this.isSick=true;
				return;
			}
}

/**
 * if the onFire trigger is on true, then inflict some damages to the player
 */
Player.prototype.fire=function()
{
	if(this.onFire==true)
	{		
			this.fireFrame+=1;
			if(this.fireFrame>=this.fireInterval)
			{
				this.fireFrame=0;
				this.life-=10;
				this.sendMessage("Vous brulez a petit feu.");
			}
			rand=Math.floor(Math.random()*100)+1;
			if(rand==1)
			{
				this.onFire=false;
			}
	}
}


/**
 * Heals the player
 */
Player.prototype.heal=function()
{
	this.healFrame+=1;
	if(this.healFrame>=this.healInterval && this.isSick==false && this.faim>50)
	{
		heal=Math.floor(this.life*this.class.Hr/100);
		this.life+=heal;
		if(this.life>this.lifeMax)
			this.life=this.lifeMax;
		this.healFrame=0;
	}

}


/**
 * This method manages the player's stats
 */
Player.prototype.changeStat=function()
{
	this.faim=this.faim-(((5/216)*((Math.random()*1.5)+1)));
	this.soif=this.soif-(((5/54)*((Math.random()*1.5)+1)));
	this.sommeil=this.sommeil-(((5/48)*((Math.random()*1.5)+1)));
}


/**
 * This method allow the player to drink some water.
 */
Player.prototype.lap=function()
{
	grill=this.previousTile;
	if(grill==3)
	{
		if(this.soif<100)
		{
			this.soif=this.soif+Math.round(10*this.soif/100);
			this.sendMessage("Vous buvez goulument l'eau limpide qui se trouve a vos pieds.");
			rand=Math.floor(Math.random()*100)+1;
			if(rand==1)
			{
					this.isSick=true;
					this.sendMessage("L'eau que vous venez d'avaler avait un drole de gout...");
					this.sendMessage("Priez pour qu'elle n'ai pas stagne ici trop longtemps....");
			}
		}
		else
		{
			this.sendMessage("Vous n'avez pas soif.");		
		}
	}
	if(grill !=3 && grill !=4)
	{
		this.sendMessage("Il n'y a pas d'eau a vos pieds.");
	}
}

/**
 * Sets the player's x pos
 */
Player.prototype.setX=function(x)
{
	this.x=x;
}

/**
 * Sets the player's y pos
 */
Player.prototype.setY=function(y)
{
	this.y=y;
}

/**
 * Returns the player x pos
 */
Player.prototype.getX=function()
{
	return this.x;
}

/**
 * Returns the player's y pos
 */
Player.prototype.getY=function()
{
	return this.y;
}

/**
 * Sets the player's life counter
 */
Player.prototype.setLife=function(nb)
{
	this.life=nb;
}


/**
 * This method manage the player's fight actions
 */
Player.prototype.turn=function(ennemy)
{
	if(this.spell==false)
	{
		if(!this.isSleeping)
		{
			fighter1=this;
			fighter2=ennemy;
			//Degats basiques des coups porté
				//Degats statiques
				total=fighter1.atk;
				//ajout des degats du nombre de coups portés avec l'arme
				for(i=0;i<fighter1.launch;i++)
				{
					lancer=Math.random()*6+1;
					lancer=Math.floor(lancer);
					total=total+Math.round(fighter1.atk/lancer);
				}
				dmg=total;
			//bonus de zone
			if(fighter1.dexterite>100)
				fighter1.dexterite=100;
				
			zone=Math.floor(Math.random()*(100-fighter1.dexterite))+1;
			
			if(zone>=0 && zone<=10)
				dmg=dmg+Math.round(fighter1.force*30/100);
			else if(zone>=11 && zone<=50)
				dmg=dmg+Math.round(fighter1.force*20/100);
			else
				dmg=dmg+Math.round(fighter1.force*10/100);
				
			
			

			//parade de l'ennemi
			if(fighter2.dexterite>fighter1.dexterite)
			{
				if(fighter2.dexterite>100)
					fighter2.dexterite=100;
					
				zone=Math.floor(Math.random()*(100-fighter2.dexterite))+1;
				
				if(zone>=0 && zone<=30)
				{
					parade=Math.floor((Math.random()*fighter2.constitution)+1);
					parade=dmg*parade/100;
					dmg=dmg-Math.floor(parade);
				}
			}
			fighter2.setLife(fighter2.life-dmg)
			
			return dmg;
		}
		else
		{
			return 0;
			if(Math.floor(Math.random()*2)+1==1)
			{
				this.sendMessage("Vous vous reveillez en sursautant !");
				ennemy.sendMessage("Votre adversaire se reveille en sursaut !");
				this.isSleeping=false;
			}
		}
	}
}

/**
 * Allow the player to open the inventory GUI
 */
Player.prototype.openInventory=function()
{
		this.sendMessage("Vous vous asseyez sur le sol et vous ouvrez votre sac.");
		Scene=this.inventory;
}

/**
 * Allow the player to open the equipement GUI
 */
Player.prototype.openEquipement=function()
{
		this.sendMessage("Vous vous asseyez sur le sol et vous otez votre equipement.");
		Scene=this.equipement;
}

/**
 * This method allow the player to get the object if there are.
 */
Player.prototype.getObject=function()
{
		if(this.stair.getMap()[this.x][this.y]>=10)
		{
			this.inventory.add(this.stair.getMap()[this.x][this.y]-10);
			this.stair.map[this.x][this.y]=1;
		}
}


/**
 * Returns the light of the player
 */
Player.prototype.getLight=function()
{
	return this.light;
}


/**
 * Returns the player's hungry counter
 */
Player.prototype.getHungry=function()
{
	return this.faim;
}

/**
 * Sets the player's hungry counter
 */
Player.prototype.setHungry=function(faimTemp)
{
	this.faim=faimTemp;
}

/**
 * Returns the player's weight capacity
 */
Player.prototype.getPound=function()
{
		return this.pound;
}


/**
 * Kill the player
 */
Player.prototype.kill=function()
{
	this.ohi.send("dead");
	Scene=new GameOver();
}

/**
 * Send a message to the HUD in accord with the player's situation.
 * Can be change the player's stats.
 */
Player.prototype.contextMessage=function()
{
	if(this.previousTile != this.lastTile)
	{
		if(this.previousTile==3)
		{
			if(!Parameters.isTiled())
				this.sendMessage("Vous marchez dans une flaque d'eau, formee annee apres annee par l'infiltration.");
			if(this.onFire==true)
			{
				this.sendMessage("Vous laisser l'eau fraiche recouvrir vos brulure...");
				this.onFire=false;
			}
		}
		else if(this.previousTile==4)
		{
			this.sendMessage("Vous marchez dans des flammes, idiot !");
			this.onFire=true;
		}
		else if(this.previousTile==6)
		{
			this.sendMessage("Une odeur de brule atteint vos narines... Et vous vous rendez compte que vous marchez dans de la lave !");
			this.life=this.life-10;
			this.onFire=true;
		}
	}
		
		if(this.stair.getMap()[this.x][this.y]=="upstair")
		{
			this.stair.removeEntityFromList(this);
			this.previousTile=1;
			this.stair=Client.dungeon.upStair(this);
			x=this.stair.getSpawnPoint()[0]+this.stair.getSpawnPoint()[2].getX();
			y=this.stair.getSpawnPoint()[1]+this.stair.getSpawnPoint()[2].getY();
			this.setX(x);
			this.setY(y);
			if(this.stair.map[x+1][y]!=2)
				this.stair.map[x+1][y]=1;
			if(this.stair.map[x-1][y]!=2)
				this.stair.map[x-1][y]=1;
			if(this.stair.map[x][y+1]!=2)
				this.stair.map[x][y+1]=1;
			if(this.stair.map[x][y-1]!=2)
				this.stair.map[x][y-1]=1;

			this.move();
			this.stair.addEntityToList(this);
			Client.resetCanvas();
			this.previousTile="downstair";
		}

		if(this.stair.getMap()[this.x][this.y]=="downstair")
		{
			this.stair.removeEntityFromList(this);
			this.previousTile=1;
			this.stair=Client.dungeon.downStair(this);
			x=this.stair.stairPoint[0];
			y=this.stair.stairPoint[1];
			this.setX(x);
			this.setY(y);
			if(this.stair.map[x+1][y]!=2)
				this.stair.map[x+1][y]=1;
			if(this.stair.map[x-1][y]!=2)
				this.stair.map[x-1][y]=1;
			if(this.stair.map[x][y+1]!=2)
				this.stair.map[x][y+1]=1;
			if(this.stair.map[x][y-1]!=2)
				this.stair.map[x][y-1]=1;
			this.move();
			this.stair.addEntityToList(this);
			Client.resetCanvas();
			this.previousTile="upstair";
		}
}

/**
 * Returns the player's attack amount
 */
Player.prototype.getAtk=function()
{
	return this.atk;
}

/**
 * Returns the player's lrm amount
 */
Player.prototype.getLrm=function()
{
	return this.lrm;
}

/**
 * Returns the player's launch number
 */
Player.prototype.getLaunch=function()
{
	return this.launch;
}

/**
 * Returns the player's consititution amount
 */
Player.prototype.getConst=function()
{
	return this.constitution;
}

/**
 * Returns the player's dexterity amount
 */
Player.prototype.getDex=function()
{
	return this.dexterite;
}

/**
 * Sets the player's attack amount
 */
Player.prototype.setAtk=function(value)
{
	this.atk=value;
}

/**
 * Sets the player's lrm amount
 */
Player.prototype.setLrm=function(value)
{
	this.lrm=value;
}
/**
 * Sets the player's launch number
 */
Player.prototype.setLaunch=function(value)
{
	this.launch=value;
}
/**
 * Sets the player's consitution amount
 */
Player.prototype.setConst=function(value)
{
	this.constitution=value;
}
/**
 * Sets the player's dexerity amount
 */
Player.prototype.setDex=function(value)
{
	this.dexterite=value;
}

/**
 * Checks if the player is on a chest and, open the chest
 */
Player.prototype.interact=function()
{	
	if(this.spell != false)
	{
		this.spell.use(this);
		this.spell=false;
	}
	else if(this.previousTile instanceof Chest)
	{
		if(!this.previousTile.isLocked())
		{
			this.sendMessage("Alors que vous ouvrez le coffre, un nuage de poussiere vous saute au visage.");
			this.hygiene-=Math.round((20*this.hygiene)/100);
			this.previousTile.open(this);
		}
		else
		{
			this.sendMessage("Le coffre est verrouille, vous essayez donc de crocheter sa serrure.");
			if(this.talents.canPick())
			{
				this.sendMessage("Alors que vous ouvrez le coffre, un nuage de poussiere vous saute au visage.");
				this.hygiene-=Math.round((20*this.hygiene)/100);
				this.previousTile.open(this);				
			}
			else
				this.sendMessage("La serrure est trom complexe pour vous. Le contenu du coffre vous restera donc inconnu.");	
			
		}	
		
	}
	else if(!this.searchForGrass() && !this.searchForTorch())
	{
		if(this.equipement.getHandledItem() instanceof ItemTorch)
		{
			if(this.stair.getMap()[this.x][this.y+1]==1)
			{
				this.stair.map[this.x][this.y+1]=new Torch(this.x,this.y+1,this.stair,this.equipement.getHandledItem());
				this.equipement.remove("weapon",false);
			}
		}

	}
	
}

/**
 * Checks if the player is near a Torch and get it
 */
Player.prototype.searchForTorch=function()
{
	if(this.stair.getMap()[this.x-1][this.y] instanceof Torch|| this.stair.getMap()[this.x+1][this.y] instanceof Torch|| this.stair.getMap()[this.x][this.y-1] instanceof Torch|| this.stair.getMap()[this.x][this.y+1] instanceof Torch)
	{
		if(this.stair.getMap()[this.x-1][this.y] instanceof Torch)
		{
			xTemp=this.x-1;
			yTemp=this.y;
		}
		else if(this.stair.getMap()[this.x+1][this.y] instanceof Torch)
		{
			xTemp=this.x+1;
			yTemp=this.y;
		}
		else if(this.stair.getMap()[this.x][this.y-1] instanceof Torch)
		{
			xTemp=this.x;
			yTemp=this.y-1;
		}
		else
		{
			xTemp=this.x;
			yTemp=this.y+1;
		}
		this.inventory.add(this.stair.map[xTemp][yTemp].remove());
		return true;
	}
	else
		return false;
}



/**
 * Checks if the player is near a bush and, generate adds a new grass type item to his inventory
 */
Player.prototype.searchForGrass=function()
{
	if(this.stair.getMap()[this.x-1][this.y] instanceof Grass|| this.stair.getMap()[this.x+1][this.y] instanceof Grass|| this.stair.getMap()[this.x][this.y-1] instanceof Grass|| this.stair.getMap()[this.x][this.y+1] instanceof Grass)
	{
		if(this.stair.getMap()[this.x-1][this.y] instanceof Grass)
		{
			xTemp=this.x-1;
			yTemp=this.y;
		}
		else if(this.stair.getMap()[this.x+1][this.y] instanceof Grass)
		{
			xTemp=this.x+1;
			yTemp=this.y;
		}
		else if(this.stair.getMap()[this.x][this.y-1] instanceof Grass)
		{
			xTemp=this.x;
			yTemp=this.y-1;
		}
		else
		{
			xTemp=this.x;
			yTemp=this.y+1;
		}
		
		room=this.stair.getRoomAt(this.x,this.y);
		if(room != false)
		{
			if(room.getBiome()=="plain")
			{
				if(this.talents.canSurvive())
				{
					object=this.stair.map[xTemp][yTemp].harvest();
					if(object != undefined)
					{
						this.sendMessage("Apres un rapide exament, vous decouvrez l'objet "+object.getName()+".");
						this.inventory.add(object.getId());
					}
					else
						this.sendMessage("La plante etait trop jeune, quel gachis.");
				}
				else
				{
					this.sendMessage("Vous n'avez rien trouve d'interessant...");
					this.stair.map[xTemp][yTemp]=1;
				}
			}
		}
		this.hygiene-=Math.round((15*this.hygiene)/100);
		return true;
	}
	else
		return false;
}

/**
 * add an effect to the effects list
 */
Player.prototype.addEffect=function(effect)
{
		this.effectList.push(effect);
}

/**
 * Checks if the player is near the specified tile
 */
Player.prototype.isNear=function(value)
{
	if(this.stair.getMap()[this.x+1][this.y]==value || this.stair.getMap()[this.x-1][this.y]==value || this.stair.getMap()[this.x][this.y+1]==value || this.stair.getMap()[this.x][this.y-1]==value)
		return true;
	else
		return false;
}


/**
 * Checks if the player can see the specified position
 */
Player.prototype.lightZone=function()
{
	this.visibleBlockList=new Array();
	this.visibleBlockList.push(new Array(this.x,this.y,true));
	for(d=0;d<this.visibleBlockList.length;d++)
	{
				cX=this.visibleBlockList[d][0];
				cY=this.visibleBlockList[d][1];
				if(!this.visibleBlockList[d][2])
					continue;

				
		
				result=this.canSeeBlockAt(cX+1,cY);
				this.visibleBlockList.push(new Array(cX+1,cY,result));
				
				result=this.canSeeBlockAt(cX-1,cY);
				this.visibleBlockList.push(new Array(cX-1,cY,result));
				
				result=this.canSeeBlockAt(cX,cY+1);
				this.visibleBlockList.push(new Array(cX,cY+1,result));
				
				result=this.canSeeBlockAt(cX,cY-1);
				this.visibleBlockList.push(new Array(cX,cY-1,result));		
							
	}
}

/**
 * Check if the block can bee seen by player
 */
Player.prototype.canSeeBlockAt=function(xTemp,yTemp)
{
				if(this.stair.walkable(xTemp,yTemp) && !this.isVisible(xTemp,yTemp) && this.isInRange(xTemp,yTemp) && this.bresenham(xTemp,yTemp))
						return true;

				return false;
}

/**
 * Check if the block was already checked
 */
Player.prototype.isVisible=function(xTemp,yTemp)
{
	for(e=0;e<this.visibleBlockList.length;e++)
	{
		if(this.visibleBlockList[e]==null)
			continue;
			
		if(this.visibleBlockList[e][0]==xTemp && this.visibleBlockList[e][1]==yTemp)
		{
			return true;
		}
	}
	
	return false;
}



/**
 * Returns the player's line of sight
 */
Player.prototype.isInRange=function(xTemp,yTemp)
{
	
	distance=(xTemp-this.x)*(xTemp-this.x)+(yTemp-this.y)*(yTemp-this.y);
	if(distance>this.light*this.light)
		return false;
	else
		return true;
		
}

/**
 * Checks if the line between the player and the specified position is obstructed with the bresenham's algorythm
 */
Player.prototype.bresenham=function(xE,yE)
{
    var coordinatesArray = new Array();
    // Translate coordinates
    var x1 = this.x;
    var y1 = this.y;
    var x2 = xE;
    var y2 = yE;
    // Define differences and error check
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;
    // Set first coordinates
    coordinatesArray.push(new Array(x1, y1));
    // Main loop
    while (!((x1 == x2) && (y1 == y2))) {
      var e2 = err << 1;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
      // Set coordinates
      coordinatesArray.push(new Array(x1, y1));
    }

	for(t=0;t<coordinatesArray.length;t++)
	{
		if(!this.stair.walkable(coordinatesArray[t][0],coordinatesArray[t][1]) && this.stair.getMap()[coordinatesArray[t][0]][coordinatesArray[t][1]]!=0)
			return false;
	}
	return true;
		
}
