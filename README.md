FiSys, an HTML5 FileSystem Wrapper
==================================

This is a wrapper around the HTML5 FileSystem API.

    // A new FiSys object for persistant storage
    var fs = new FiSys();

    // Request storage
    fs.request(1024 * 1024).then(function() {
        
        // try to get myfile.txt.  If it doesn't exist
        // it will automatically be created
        fs.getFile('myfile.txt').then(function(fileEntry)) {

            // use the FileEntry object

        });

        // try to get directory Logs/08152014.
        // If it doesn't exist it will automatically be created
        fs.getDirectory('Logs/08152014').then(function(dirEntry)) {

            // use the DirectoryEntry object

        });


        // Read the root filesystem
        fs.readDirectory('')
            // Map the entries to an array of names
            .then(fiSys.Names)
            .then(function(names) {
                // Log the names
                console.log(names);
            });

    });
