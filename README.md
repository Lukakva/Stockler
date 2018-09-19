So the Twitter API sucks huh?

At first I wrote the code that should've worked in a browser, but apparently, Twitter doesn't support CORS, meaning I can't use the API in the browser.
Frankly, Node.js is awesome, and kind of created a bridge between JavaScript and Node.js that would allow me to use the same JS Twitter API library.

I wrapped the API library in an HTTP bridge, meaning I just call the library same way, but it sends a request to Node.js server, telling which method I'm trying to call, then node.js server calls the same method on the server side, and returns a response telling me which callback to call in the library.

# Setup Guide?

**Clone the repo**

``git clone https://github.com/Lukakva/Stockler.git``

**Get into the folder**

``cd Stockler``

**Install dependencies**

``npm install``

**Start the server**

``npm start``

A browser tab will open up at http://localhost:3000

Open another terminal window, a Node.js process has to be started as well. Once you navigate to the root directory of the project, run:

``cd server && node index.js``
