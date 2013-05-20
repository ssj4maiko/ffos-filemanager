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
			if(findDirectory(name,father) !== null)
				return id;

			var data = {
				 name : name
				,id : fdb.index++
				,directory : true
				,hidden : name.indexOf('.') === 0
			};
			fdb.directory[father].push(data);
			return data.id;
		}
		function pushFile(name,father,file){
			if(!fdb.directory[father]){
				fdb.directory[father] = [];
			}

			var data = {
				 name : name
				//,id : fdb.index++
				,directory : false
				,hidden : name.indexOf('.') === 0
				,extension : name.split('.').pop()
				,type : file.type
				,size : file.size
				,timestamp : file.s
			}
			fdb.directory[father].push(data);
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
			pushFile(path[length+1],father,file);
		}
		//alert(fdb.storage);
		this.directory = Object.create(null);
	}
	function scan(fdb){
      var cursor = fdb.storage.enumerate();
      cursor.onsuccess = function(){
      	var file = cursor.result;
      	if(file){
      		fdb.registerPath(file);
      	} else {
      		debug();
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
function debug(){
	document.write = print_r(fdb.directory,true);
}
function print_r (array, return_val) {
  // http://kevin.vanzonneveld.net
  // +   original by: Michael White (http://getsprink.com)
  // +   improved by: Ben Bryan
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +      improved by: Brett Zamir (http://brett-zamir.me)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // -    depends on: echo
  // *     example 1: print_r(1, true);
  // *     returns 1: 1
  var output = '',
    pad_char = ' ',
    pad_val = 4,
    d = window.document,
    getFuncName = function (fn) {
      var name = (/\W*function\s+([\w\$]+)\s*\(/).exec(fn);
      if (!name) {
        return '(Anonymous)';
      }
      return name[1];
    },
    repeat_char = function (len, pad_char) {
      var str = '';
      for (var i = 0; i < len; i++) {
        str += pad_char;
      }
      return str;
    },
    formatArray = function (obj, cur_depth, pad_val, pad_char) {
      if (cur_depth > 0) {
        cur_depth++;
      }

      var base_pad = repeat_char(pad_val * cur_depth, pad_char);
      var thick_pad = repeat_char(pad_val * (cur_depth + 1), pad_char);
      var str = '';

      if (typeof obj === 'object' && obj !== null && obj.constructor && getFuncName(obj.constructor) !== 'PHPJS_Resource') {
        str += 'Array\n' + base_pad + '(\n';
        for (var key in obj) {
          if (Object.prototype.toString.call(obj[key]) === '[object Array]') {
            str += thick_pad + '[' + key + '] => ' + formatArray(obj[key], cur_depth + 1, pad_val, pad_char);
          }
          else {
            str += thick_pad + '[' + key + '] => ' + obj[key] + '\n';
          }
        }
        str += base_pad + ')\n';
      }
      else if (obj === null || obj === undefined) {
        str = '';
      }
      else { // for our "resource" class
        str = obj.toString();
      }

      return str;
    };

  output = formatArray(array, 0, pad_val, pad_char);

  if (return_val !== true) {
    if (d.body) {
      this.echo(output);
    }
    else {
      try {
        d = XULDocument; // We're in XUL, so appending as plain text won't work; trigger an error out of XUL
        this.echo('<pre xmlns="http://www.w3.org/1999/xhtml" style="white-space:pre;">' + output + '</pre>');
      } catch (e) {
        this.echo(output); // Outputting as plain text may work in some plain XML
      }
    }
    return true;
  }
  return output;
}
