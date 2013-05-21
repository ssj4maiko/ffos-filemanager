'use strict';

var StructFile = {
	 id		: null
	,father	: null
}

var FileDB = (function(){
	function FileDB(mediaType){ 
		if(mediaType == null){
			mediaType = 'sdcard';
		}
		var fdb = this;
		fdb.storage = navigator.getDeviceStorage(mediaType);

		//fdb.storage.addEventListener('change', deviceStorageChangeHandler);
		//fdb.details.dsEventListener = deviceStorageChangeHandler;


		var availreq = fdb.storage.available();
		availreq.onsuccess = function(e) {
			switch (e.target.result) {
				case 'available':
				  changeState(fdb,FileDB.READY);
				  alert('o cartão');
				  scan(fdb); // Start scanning as soon as we're ready
				  break;
				case 'unavailable':
				  changeState(fdb,FileDB.NOCARD);
				  alert('Sem cartão');
				  break;
				case 'shared':
				  changeState(fdb,FileDB.UNMOUNTED);
				  alert('Desmontado');
				  break;
			}
		}
		
		function changeState(lefdb,teste){
			//alert(teste);
		}

		this.index = 1;
		function findDirectory(name,father){
			for(var i in fdb.directory[father]){
				if(name == fdb.directory[father][i].name)
					return i;
			}
			return null;
		}
		function pushDirectory(name,father){
			if(!fdb.directory[father]){
				fdb.directory[father] = {};
			}
			var id = findDirectory(name,father);
			if(id !== null)
				return id;

			var data = {
				 name : name
				,id : fdb.index++
				,directory : true
				,hidden : name.indexOf('.') === 0
			};
			fdb.directory[father][data.id] = data;
			return data.id;
		}
		function pushFile(name,father,file){
			if(!fdb.directory[father]){
				fdb.directory[father] = {};
			}

			var data = {
				 name : name
				,id : fdb.index++
				,directory : false
				,hidden : name.indexOf('.') === 0
				,extension : name.split('.').pop()
				,type : file.type
				,size : file.size
				,timestamp : file.lastModifiedDate
			}
			fdb.directory[father][data.id] = data;
			return data.id;
		};
		this.registerPath = function(file){
			var path = file.name.split('/')
			   ,length = path.length-1 //One less to exclude the filename itself from te counter.
			   ,i
			   ,father = 0;
			for(i in path){
				father = pushDirectory(path[i],father);
			}
			pushFile(path[length],father,file);
		}
		//alert(fdb.storage);
		this.directory = Object.create(null);
	}
	function scan(fdb){
      var cursor = fdb.storage.enumerate();
      cursor.onsuccess = function(){
      	var file = cursor.result;
      	document.body.textContent = fdb.index;
      	try{
	      	if(file){
	      		fdb.registerPath(file);
	    		cursor.continue();
	      	} else {
	      		alert('done');
	      		//debug();
	      	}
	    }
	    catch(e){
	    	alert(e);
	    }
      };
	}

	return FileDB;
}());

FileDB.OPENING = 'opening';     // FileDB is initializing itself
FileDB.READY = 'ready';         // FileDB is available and ready for use
FileDB.NOCARD = 'nocard';       // Unavailable because there is no sd card
FileDB.UNMOUNTED = 'unmounted'; // Unavailable because card unmounted
FileDB.CLOSED = 'closed';       // Unavailalbe because FileDB has closed

var fdb = new FileDB();
function log(txt){
	document.write(txt+'<br />');
}
function debug(){
	for(var i in fdb.directory){
		var temp = fdb.directory[i];
		log(i+' = {');
		if(typeof temp == 'object'){
			for(var j in temp){
				var temp2 = temp[j];
				log('---- '+j+' = {');
				if(typeof temp2 == 'object'){
					for(var k in temp2){
						var temp3 = temp2[k];
						log('-------- '+k+' = {');
						log('-------- '+temp3);
						log('-------- }');
					}
				} else {
					log('---- '+temp2);
				}
				log('---- }');
			}
		} else {
			log(temp);
		}
		log('}');
	}
}