import React, {
  useState,
  useEffect,
  ChangeEvent,
  MouseEvent,
  FunctionComponent,
  Fragment,
} from "react";
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
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

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
  const [title, setTitle] = useState<string>();
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

  const timeFromNow = (date: string) => {
    return dayjs(date).fromNow();
  };
  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    setIsSelected(true);
    setSelectedFile(e.target.files[0]);
  };

  const onTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const onFileUpload = (e: MouseEvent<HTMLButtonElement>) => {
    //console.log("Button Clicked");
    setShowSpinner(true);
    if (selectedFile) {
      const formData = new FormData();
      if (title) {
        formData.append("title", title);
      } else {
        formData.append("title", "new upload");
      }

      formData.append("video_url", selectedFile, selectedFile.name);

      fetch("http://localhost:8000/videos/", {
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
          <Heading>Townhall Gallery</Heading>
          <Text>
            Thanks for stumbling across this site. Leave a mark on this website!
          </Text>

          <HStack>
            <Text>Title</Text>
            <Input placeholder="Enter your title" onChange={onTitleChange} />
          </HStack>

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
                  <Text>{value.title}</Text>
                  <Text>{timeFromNow(value.created_at)}</Text>

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
