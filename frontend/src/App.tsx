import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Icon,
  Image,
  Input,
  Progress,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { Card, CardHeader, CardBody, CardFooter } from "@chakra-ui/card";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import {
  FaUpload,
  FaVideo,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCog,
  FaBolt,
} from "react-icons/fa";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type VideoProps = {
  created_at: string;
  id: number;
  title: string;
  updated_at: string;
  video_url: string;
  processing_status: "pending" | "processing" | "completed" | "failed";
  thumbnail_url: string;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  processing_error: string;
};

const API_BASE = "http://127.0.0.1:8000";

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const statusConfig = {
  pending: { color: "yellow", icon: FaClock, label: "Queued" },
  processing: { color: "blue", icon: FaCog, label: "Processing" },
  completed: { color: "green", icon: FaCheckCircle, label: "Completed" },
  failed: { color: "red", icon: FaExclamationTriangle, label: "Failed" },
};

function PipelineStat({
  label,
  count,
  color,
  icon,
}: {
  label: string;
  count: number;
  color: string;
  icon: React.ElementType;
}) {
  const bg = useColorModeValue(`${color}.50`, `${color}.900`);
  const borderColor = useColorModeValue(`${color}.200`, `${color}.700`);
  return (
    <Stat
      px={4}
      py={3}
      bg={bg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <HStack spacing={2}>
        <Icon as={icon} color={`${color}.400`} />
        <StatLabel fontSize="xs" textTransform="uppercase" letterSpacing="wide">
          {label}
        </StatLabel>
      </HStack>
      <StatNumber fontSize="2xl" mt={1}>
        {count}
      </StatNumber>
    </Stat>
  );
}

function VideoCard({ video }: { video: VideoProps }) {
  const cfg = statusConfig[video.processing_status];
  const isReady = video.processing_status === "completed";
  const isWorking =
    video.processing_status === "pending" ||
    video.processing_status === "processing";
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const workingBg = useColorModeValue("gray.100", "gray.750");
  const failedBg = useColorModeValue("red.50", "red.900");

  return (
    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" overflow="hidden">
      <CardBody p={0}>
        {isWorking && (
          <Center
            sx={{ aspectRatio: "16/9" }}
            bg={workingBg}
            position="relative"
          >
            <VStack spacing={3}>
              <Spinner
                size="lg"
                color="blue.400"
                thickness="3px"
                speed="0.8s"
              />
              <VStack spacing={1}>
                <Text fontSize="sm" fontWeight="medium">
                  {video.processing_status === "pending"
                    ? "Queued for processing"
                    : "Processing video..."}
                </Text>
                <Text fontSize="xs" color={mutedColor}>
                  Kafka consumer worker active
                </Text>
              </VStack>
            </VStack>
            {video.processing_status === "processing" && (
              <Progress
                size="xs"
                isIndeterminate
                colorScheme="blue"
                position="absolute"
                bottom={0}
                left={0}
                right={0}
              />
            )}
          </Center>
        )}
        {isReady && (
          <Box
            as="video"
            controls
            poster={video.thumbnail_url || undefined}
            src={video.video_url}
            objectFit="contain"
            w="full"
            sx={{ aspectRatio: "16/9" }}
          />
        )}
        {video.processing_status === "failed" && (
          <Center
            sx={{ aspectRatio: "16/9" }}
            bg={failedBg}
          >
            <VStack spacing={2}>
              <Icon as={FaExclamationTriangle} color="red.400" boxSize={6} />
              <Text fontSize="sm" color="red.300">
                Processing failed
              </Text>
              {video.processing_error && (
                <Text fontSize="xs" color={mutedColor} maxW="200px" textAlign="center">
                  {video.processing_error.slice(0, 100)}
                </Text>
              )}
            </VStack>
          </Center>
        )}
      </CardBody>

      <CardFooter px={4} py={3} borderTopWidth="1px" borderColor={borderColor}>
        <Flex w="full" justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1} minW={0}>
            <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
              {video.title}
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              <Text fontSize="xs" color={mutedColor}>
                {dayjs(video.created_at).fromNow()}
              </Text>
              {isReady && video.duration_seconds != null && (
                <Text fontSize="xs" color={mutedColor}>
                  {formatDuration(video.duration_seconds)}
                </Text>
              )}
              {isReady && video.width && video.height && (
                <Text fontSize="xs" color={mutedColor}>
                  {video.width}x{video.height}
                </Text>
              )}
            </HStack>
          </VStack>
          <Tag
            size="sm"
            colorScheme={cfg.color}
            variant="subtle"
            flexShrink={0}
            ml={2}
          >
            <Icon as={cfg.icon} mr={1} boxSize={3} />
            {cfg.label}
          </Tag>
        </Flex>
      </CardFooter>
    </Card>
  );
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [title, setTitle] = useState("");
  const [allVideos, setAllVideos] = useState<VideoProps[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const borderColor = useColorModeValue("gray.200", "gray.700");
  const surfaceBg = useColorModeValue("gray.50", "gray.800");
  const mutedColor = useColorModeValue("gray.500", "gray.400");

  const fetchVideos = useCallback(() => {
    fetch(`${API_BASE}/videos/?format=json`)
      .then((r) => r.json())
      .then(setAllVideos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    const hasInProgress = allVideos.some(
      (v) =>
        v.processing_status === "pending" ||
        v.processing_status === "processing"
    );
    if (!hasInProgress) return;
    const interval = setInterval(fetchVideos, 4000);
    return () => clearInterval(interval);
  }, [allVideos, fetchVideos]);

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("title", title.trim() || selectedFile.name.replace(/\.[^.]+$/, ""));
    formData.append("video_url", selectedFile, selectedFile.name);

    fetch(`${API_BASE}/videos/`, { method: "POST", body: formData })
      .then((r) => {
        if (!r.ok) throw new Error(`Upload failed: ${r.status}`);
        return r.json();
      })
      .then(() => {
        toast({
          title: "Video uploaded",
          description: "Event published to Kafka. Worker will process it shortly.",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        setSelectedFile(undefined);
        setTitle("");
        fetchVideos();
      })
      .catch((err) => {
        toast({
          title: "Upload failed",
          description: err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      })
      .finally(() => setIsUploading(false));
  };

  const counts = {
    total: allVideos.length,
    pending: allVideos.filter((v) => v.processing_status === "pending").length,
    processing: allVideos.filter((v) => v.processing_status === "processing")
      .length,
    completed: allVideos.filter((v) => v.processing_status === "completed")
      .length,
    failed: allVideos.filter((v) => v.processing_status === "failed").length,
  };

  return (
    <Box minH="100vh">
      {/* Header */}
      <Box
        borderBottomWidth="1px"
        borderColor={borderColor}
        bg={surfaceBg}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="7xl" py={3}>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <Icon as={FaBolt} color="teal.400" boxSize={5} />
              <VStack align="start" spacing={0}>
                <Heading size="sm" letterSpacing="-0.01em">
                  Fullstack Video
                </Heading>
                <Text fontSize="xs" color={mutedColor}>
                  Event-Driven Processing Pipeline
                </Text>
              </VStack>
            </HStack>
            <HStack spacing={2}>
              <Tag size="sm" variant="subtle" colorScheme="teal">
                Kafka Connected
              </Tag>
              <ColorModeSwitcher />
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Pipeline Stats */}
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
            <PipelineStat
              label="Total"
              count={counts.total}
              color="gray"
              icon={FaVideo}
            />
            <PipelineStat
              label="Queued"
              count={counts.pending}
              color="yellow"
              icon={FaClock}
            />
            <PipelineStat
              label="Processing"
              count={counts.processing}
              color="blue"
              icon={FaCog}
            />
            <PipelineStat
              label="Completed"
              count={counts.completed}
              color="green"
              icon={FaCheckCircle}
            />
            <PipelineStat
              label="Failed"
              count={counts.failed}
              color="red"
              icon={FaExclamationTriangle}
            />
          </SimpleGrid>

          {/* Upload Section */}
          <Box
            p={6}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            borderStyle="dashed"
            bg={surfaceBg}
          >
            <VStack spacing={4}>
              <VStack spacing={1}>
                <HStack spacing={2}>
                  <Icon as={FaUpload} color="teal.400" />
                  <Text fontWeight="semibold">Upload Video</Text>
                </HStack>
                <Text fontSize="xs" color={mutedColor}>
                  Accepts .mp4 files. The upload triggers a Kafka event for
                  async processing.
                </Text>
              </VStack>
              <Grid
                templateColumns={{ base: "1fr", md: "1fr 2fr auto" }}
                gap={3}
                w="full"
              >
                <GridItem>
                  <Input
                    placeholder="Video title (optional)"
                    size="sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    borderColor={borderColor}
                  />
                </GridItem>
                <GridItem>
                  <Input
                    type="file"
                    accept=".mp4,video/mp4"
                    size="sm"
                    onChange={onFileSelect}
                    borderColor={borderColor}
                    sx={{
                      "::file-selector-button": {
                        border: "none",
                        bg: "teal.600",
                        color: "white",
                        px: 3,
                        py: 1,
                        mr: 3,
                        borderRadius: "md",
                        fontSize: "xs",
                        fontWeight: "medium",
                        cursor: "pointer",
                      },
                    }}
                  />
                </GridItem>
                <GridItem>
                  <Button
                    size="sm"
                    colorScheme="teal"
                    leftIcon={<Icon as={FaUpload} />}
                    isDisabled={!selectedFile}
                    isLoading={isUploading}
                    loadingText="Uploading"
                    onClick={onUpload}
                    w={{ base: "full", md: "auto" }}
                  >
                    Upload & Process
                  </Button>
                </GridItem>
              </Grid>
            </VStack>
          </Box>

          {/* Video Grid */}
          <VStack align="start" spacing={4}>
            <HStack spacing={2}>
              <Heading size="md">Processed Videos</Heading>
              <Text fontSize="sm" color={mutedColor}>
                ({allVideos.length})
              </Text>
            </HStack>

            {allVideos.length === 0 && (
              <Center
                w="full"
                py={16}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                bg={surfaceBg}
              >
                <VStack spacing={3}>
                  <Icon as={FaVideo} boxSize={8} color={mutedColor} />
                  <Text color={mutedColor}>
                    No videos yet. Upload one to start the pipeline.
                  </Text>
                </VStack>
              </Center>
            )}

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5} w="full">
              {allVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </SimpleGrid>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
