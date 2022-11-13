import { useState, useEffect } from "react";
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

function App() {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [allVideos, setAllVideos] = useState<File[]>([]);
  const [uploadSuccessful, setUploadSuccesful] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/videos")
      .then((response) => response.json())
      .then((data) => {
        setAllVideos(data);
      });
  }, [uploadSuccessful]);
  return (
    <ChakraProvider theme={theme}>
      <ColorModeSwitcher justifySelf="flex-end" />
      <Center bg="black" color="white" padding={8}>
        <VStack spacing={7}>
          <Heading>Your Video Gallery</Heading>
          <Text>Take a look at all your uploaded videos!!!</Text>
          <HStack>
            <input type="file"></input>
            {/* Need to add onChange and isDisabled */}
            <Button size="lg" colorScheme="red" isDisabled={true}>
              Upload Video
            </Button>
          </HStack>
          <Heading>Your Videos</Heading>
          <SimpleGrid columns={3} spacing={8}>
            {allVideos.length !== 0 &&
              allVideos.map((video) => {
                <video
                  src={video["video_url"]}
                  autoPlay
                  controls
                  loop
                  preload="auto"
                ></video>;
              })}
          </SimpleGrid>
        </VStack>
      </Center>
    </ChakraProvider>
  );
}

export default App;
