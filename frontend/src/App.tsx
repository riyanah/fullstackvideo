import { useState, useEffect, ChangeEvent, MouseEvent } from "react";
import {
  ChakraProvider,
  Center,
  Heading,
  Button,
  Input,
  HStack,
  Container,
  SimpleGrid,
  Image,
  Spinner,
  Box,
  Text,
  Link,
  VStack,
  Grid,
  theme,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";

type VideoProps = {
  created_at: string;
  id: number;
  title: string;
  updated_at: string;
  video_url: string;
};

function App() {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [allVideos, setAllVideos] = useState<VideoProps[]>([]);

  const [uploadSuccessful, setUploadSuccesful] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/videos/?format=json")
      .then((response) => response.json())
      .then((data) => {
        setAllVideos(data);
        //console.log(allVideos);
      });
  }, [uploadSuccessful]);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    setIsSelected(true);
    setSelectedFile(e.target.files[0]);
  };

  const onFileUpload = (e: MouseEvent<HTMLButtonElement>) => {
    //console.log("Button Clicked");
    setShowSpinner(true);
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file_attachment", selectedFile, selectedFile.name);

      fetch("http://127.0.0.1:8000/videos/", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success Posting");
          setUploadSuccesful(!uploadSuccessful);
          setShowSpinner(false);
        });
    }
  };
  return (
    <ChakraProvider theme={theme}>
      <ColorModeSwitcher justifySelf="flex-end" />
      <Center bg="black" color="white" padding={8}>
        <VStack spacing={7}>
          <Heading>Your Video Gallery</Heading>
          <Text>Take a look at all your uploaded videos!!!</Text>
          <HStack>
            <input type="file" onChange={onInputChange}></input>

            <Button
              size="lg"
              colorScheme="red"
              isDisabled={!isSelected}
              onClick={onFileUpload}
            >
              Upload Video
            </Button>
            {showSpinner && (
              <Center>
                <Spinner size="xl"></Spinner>
              </Center>
            )}
          </HStack>
          <Heading>Your Videos</Heading>
          <SimpleGrid columns={3} spacing={8}>
            {allVideos?.map((value) => {
              return (
                <div>
                  <div>{value.title}</div>
                  <div>{value.created_at}</div>
                  <video
                    src={value["video_url"]}
                    //  autoPlay
                    controls
                    loop
                    preload="auto"
                  ></video>
                </div>
              );
            })}
          </SimpleGrid>
        </VStack>
      </Center>
    </ChakraProvider>
  );
}

export default App;
