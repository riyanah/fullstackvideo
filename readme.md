to run the backend, cd into fullstackvideo

then do

docker-compose up --build

to do makemigrations/migration

do docker ps to find the container id

then do 

docker exec -t -i container_id bash


In future I can add a docker end point to do those for me


to run the frontend, cd into frontend 

then do

npm start
