# Wiki Upload

### What can it do ?
This package is created to provide a simplified api for uploading content to any Mediawiki software
### How do I get set up?
- Install the package
 `npm install wiki-upload`
- Import it into your file
 `const wikiUpload = require('wiki-upload')`

### 
### Usage
#### The package supports both promises & callback patterns

	const wikiUpload = require('wiki-upload');
	// first you need to login to the the Mediawiki 
	wikiUpload.loginToWiki(
		'https://en.wikipedia.org/w/api.php', //API base url
		'your username', 
		'your password'
	 )
	.then(response => {
        if (response && response.result == 'Success') {
            // Now we're logged in, let's upload a file
            let file = fs.createReadStream('random_image.jpg');
            wikiUpload.uploadFileToMediawiki(file, { filename: 'Random image name', text: 'Image Description' })
                .then(res => {
                    // File is uploaded!
                })
                .catch(err => {
                })

        }
    })
    .catch(err => {
        console.log(err);
    })



### Methods
##### loginToWiki (baseUrl, username, password, callback) 
##### uploadFileToMediawiki (file, options, callback)
######  file: the file to be uploaded ( preferably created by fs.createReadStream

### Authors  
##### [**Hassan Amin**](https://github.com/hassanamin994)