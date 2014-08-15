FiSys, an HTML5 FileSystem Wrapper

This is a wrapper around the HTML5 FileSystem API.

    // A new FiSys object for persistant storage
    var fs = new FiSys();

    // Request storage
    fs.request(1024 * 1024).then(function() {
        
        // try to get myfile.txt.  If it doesn't exist
        // it will automatically be created
        fs.getFile('myfile.txt').then(function(fileEntry)) {

            // use the fileEntry

        });
    });
