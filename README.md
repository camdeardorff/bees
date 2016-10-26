# bees

The server side portion of the bees architecture

At MVNU the cafeteria (caf) can become loud at times, and the sound a full cafeteria sounds like a beehive. I prefer to go when it is quiet so I can get some work done. I decided to harness the knowledge I've learned in and out of my C.S. classes to give visibility to the volume of the caf. Using a Node.js server application and an Intel Galileo that also runs a Node.js app, showing the status of the caf can be accomplished.

One notable feature with this project solves this problem. The Intel Galileo sends a message with the volume level and the sample time ever 10 seconds. Consider when a user wants to see a chart of the progression in volume of the caf for the whole day. There would be thousands of records to be sent to the client! The solution is to summarize these records into intervals of 15 minutes. Now averaging or finding the median would take plenty of processing power if they were to be found every request. The answer is **dynamic programming**. The summary is processed and then stored away for later use. When that summary is needed again, instead of processing, the summary is grabbed from the database and sent from the server. 
