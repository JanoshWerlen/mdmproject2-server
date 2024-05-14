#docker build -t werleja1/nodejs-server:latest . 
#docker push werleja1/nodejs-server:latest   
#az webapp create --resource-group mdm_project_2 --plan mdm_project_2 --name mdm-project-2-server --deployment-container-image-name werleja1/nodejs-server:latest


# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Make port 3000 and 8081 available to the world outside this container
EXPOSE 3000 8081

# Command to run the app
CMD [ "node", "server.js" ]
