/**
 * Created by brandon on 19/08/14.
 */
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, 'Yolo Swag' , {'Content-Type': 'text/html'});
    res.write('Swag 123 \n');
    res.write("This is a change");
    res.write("<p>Hello World</p><br /><p>This is another test</p>");
    res.end('Hello Node.js\n Testing');
}).listen(8124, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8124/');