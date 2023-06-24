


<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![React][React.js]][React-url]
![ts](https://flat.badgen.net/badge/-/TypeScript?icon=typescript&label&labelColor=blue&color=555555)
![Chakra](https://img.shields.io/badge/chakra-%234ED1C5.svg?style=for-the-badge&logo=chakraui&logoColor=white)
![DjangoREST](https://img.shields.io/badge/DJANGO-REST-ff1709?style=for-the-badge&logo=django&logoColor=white&color=ff1709&labelColor=gray)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)


<!-- PROJECT LOGO -->
<br />
<div align="center">

  <h3 align="center">Full Stack Video</h3>

  <p align="center">
    A full stack video service that lets users upload and consume their own custom video content
    <br />
  
  </p>
</div>
![finalaws3 drawio](https://github.com/riyanah/fullstackvideo/assets/25188689/8ad66abb-b99c-4f71-b1e2-77648863556f)

![image](https://user-images.githubusercontent.com/25188689/203913993-b4662321-7225-4de6-93b0-9f098e06ce43.png)

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
    </li>
    <li><a href="#usage">Usage</a></li>
   
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project




I was trying to learn more about scalable backend development, specifically about how to make a video application since I love watching youtube videos, 
and I wanted to see if I could recreate the video application on my own using my Django Rest Framework knowledge to recreate it, instead of FastAPI like how they did in the video. I also wanted to learn more about Typescript on the frontend. I'm aiming to use this project as a starting point for diving deeper into backend development and systems design.


* I used django-storages to use AWS S3 as the storage provider
* Created a Video, and Box model in the django ORM to store mp4 videos, and generic files respectively
* Used ModelSerializers to serialize the data in our models, an ModelViewsets to provide CRUD operations
* Used Docker to containerize the frontend and the backend
* Used Typescript on the frontend



<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

[![React][React.js]][React-url]
![ts](https://flat.badgen.net/badge/-/TypeScript?icon=typescript&label&labelColor=blue&color=555555)
![Chakra](https://img.shields.io/badge/chakra-%234ED1C5.svg?style=for-the-badge&logo=chakraui&logoColor=white)
![DjangoREST](https://img.shields.io/badge/DJANGO-REST-ff1709?style=for-the-badge&logo=django&logoColor=white&color=ff1709&labelColor=gray)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- ROADMAP -->
## Roadmap
- [ ] Implement a robust social featureset such as users, users' liked and shared videos, authentication
- [ ] Use Redis to store the urls of the most popular videos, so that they get served to the users extremely quickly
- [ ] Use ElasticSearch and make a 'video search feature' 
- [ ] Transcode Video (ffmpeg?) , then publish the message to Kafka
- [ ] Use Kafka as a central bus for moving data
- [ ] Load Balancer
- [ ] Switch from SQLLite to a different database, to store our metadata
- [ ] Follow openAPI specifications

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

If you would like to reuse this project, you can add your own AWS credentials to the ```SETTINGS.PY``` file, hopefully with an .env file, and create a S3 bucket on AWS.

<!-- USAGE EXAMPLES -->
## Usage

Using docker and docker-compose, we can easily run the project on different environments.

To run the backend, cd into the fullstackvideo directory and do

```
docker-compose up --build
```

To run the frontend, cd into the frontend directory and do

```
docker-compose up --build
```
<p align="right">(<a href="#readme-top">back to top</a>)</p>












<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/

