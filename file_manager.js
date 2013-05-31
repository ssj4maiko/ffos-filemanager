'use strict';

var FileDB = (function(){
	function FileDB(mediaType){ 
		if(mediaType == null){
			mediaType = 'sdcard';
		}
		var fdb = this;


		/**
		**	Scanning directory functions
		**/
		this.index = 1;
		function findDirectory(name,father){
			for(var i in fdb.directory[father]){
				if(name == fdb.directory[father][i].name)
					return i;
			}
			return null;
		}
		function pushDirectory(name,father){
			if(typeof fdb.directory[father] == 'undefined'){
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
				try{
				father = pushDirectory(path[i],father);
				}catch(e){alert('Directory: '+e)}
			}
			try{
			pushFile(path[length],father,file);
			}catch(e){alert('Directory: '+e)}
		}
		this.directory = Object.create(null);

		/**
		**	INDEXED DB functions
		**/
		this.openDB = function(){
			try{
			asyncStorage.getItem(fdb.DBname,function(val){
				if(val){
					fdb.directory = val;
					alert('Already Saved!');
				}
				else {
					fdb.startScan();
				}
			});
			}catch(e){
				alert(e);
			}
		}
		this.startScan = function(){
			fdb.directory = Object.create(null);
			var mediaType = fdb.DBname.substring(7);
			fdb.storage = navigator.getDeviceStorage(mediaType);

			//fdb.storage.addEventListener('change', deviceStorageChangeHandler);
			//fdb.details.dsEventListener = deviceStorageChangeHandler;


			var availreq = fdb.storage.available();
			availreq.onsuccess = function(e) {
				switch (e.target.result) {
					case 'available':
					  changeState(fdb,FileDB.READY);
					  fdb.scan(fdb); // Start scanning as soon as we're ready
					  break;
					case 'unavailable':
					  changeState(fdb,FileDB.NOCARD);
					  alert('No Card');
					  break;
					case 'shared':
					  changeState(fdb,FileDB.UNMOUNTED);
					  alert('Unmounted');
					  break;
				}
			}
		}
		this.saveDB = function(){
			asyncStorage.setItem(fdb.DBname,fdb.directory,function(){
				alert('Data Saved');
			});
		}
		
	/**
	**		START POINT
	**/

		fdb.DBname = 'FileDB/'+mediaType;
		this.init = function(){
			fdb.openDB();
		}
	}
	FileDB.prototype = {
		 curDir : [0]
		,cd : function(id){
			if(id == '..')
				fdb.curDir.pop();
			else
				fdb.curDir.push(id);
		}
		,ls : function(){
			return fdb.directory[fdb.curDir];
		}
		,pwd : function(){
			var directories = [],
				father = fdb.curDir;
			while(father !== 0){
				directories.push(fdb.directory[father].name);
				father = fdb.directory[father].name;
			}
		}
		,scan : function(fdb){
			var cursor = fdb.storage.enumerate();
			cursor.onsuccess = function(){
				try{
					var file = cursor.result;
					OUTPUT.textContent = fdb.index;
					if(file){
						fdb.registerPath(file);
						cursor.continue();
					} else {
						fdb.saveDB();
						//try{ debug();			}catch(e){ alert('2 - '+e);}
						alert('feito');
					}
				}
				catch(e){
					alert('error on function scan(): '+e);
				}
			};
		}
	}
	return FileDB;//.cd(0);
}());

FileDB.OPENING = 'opening';     // FileDB is initializing itself
FileDB.READY = 'ready';         // FileDB is available and ready for use
FileDB.NOCARD = 'nocard';       // Unavailable because there is no sd card
FileDB.UNMOUNTED = 'unmounted'; // Unavailable because card unmounted
FileDB.CLOSED = 'closed';       // Unavailalbe because FileDB has closed

var fdb = new FileDB();
//fdb.init();



function changeState(lefdb,teste){
	//alert(teste);
}

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
function getLocal(){
	asyncStorage.getItem(fdb.DBname,function(value){
		OUTPUT.textContent = value;
	});
}