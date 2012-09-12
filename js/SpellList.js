var SpellList=new Array();

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * SPELLLIST.JS              														 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * This File lists the various spells that the player can use during his adventure.
 * To add a spell, you must create an object and instanciate the Spell class.
 * The parameters must be in the order:
 * 	incantation name, effect(see StatEffect.js), range.
 * The basics incantation names are in Elven.
 * You can found dictionaries here:
 * 	http://madrabore.kanak.fr/t135-dictionnaire-elfique
 * 	http://membres.multimania.fr/sortileges/dicoelfe1.htm
 */
 
 var FireBall=new Spell("RINDE NAR",new StatEffect(undefined,"RINDE NAR",0,0,0,0,0,0,0,0,1,-20),8);
 var LightLamp=new Spell("CALMA",new StatEffect(undefined,"CALMA",2,0,0,0,0,0,0,0,20,0),8);
