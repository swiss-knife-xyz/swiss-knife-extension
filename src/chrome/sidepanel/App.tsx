import { useState, useEffect } from "react";
import {
  Flex,
  Heading,
  Spacer,
  Text,
  HStack,
  Image,
  Textarea,
  Box,
  Spinner,
  Center,
} from "@chakra-ui/react";

const callViaServiceWorker = (msgObj: any) => {
  return new Promise((resolve) => {
    // send message to service-worker
    chrome.runtime.sendMessage(msgObj);

    // receive from service-worker
    chrome.runtime.onMessage.addListener((request) => {
      switch (request.type) {
        case `SP_${msgObj.type}`: {
          const url = request.msg.url;

          resolve(url);
          break;
        }
      }
    });
  });
};

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [decoded, setDecoded] = useState<any>(null);

  useEffect(() => {
    decode();
  }, []);

  const decode = async () => {
    setIsLoading(true);
    try {
      // Request the current URL from the background script
      const url = await callViaServiceWorker({ type: "GET_CURRENT_URL" });
      const response = await fetch(
        "https://swiss-knife.xyz/api/calldata/decoder-recursive",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tx: url }),
        }
      );
      setDecoded(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Flex
        py="4"
        px={["2", "4", "10", "10"]}
        borderBottom="2px"
        borderBottomColor="gray.400"
      >
        <Spacer flex="1" />
        <Heading maxW={["302px", "4xl", "4xl", "4xl"]}>
          <HStack spacing={4}>
            <Image src="../../../img/logo.png" w="4rem" rounded={"lg"} />
            <Center flexDir={"row"}>
              <Text>Calldata Decoder</Text>
            </Center>
          </HStack>
        </Heading>
        <Spacer flex="1" />
      </Flex>
      <Center mt={"2rem"}>
        {isLoading && <Spinner />}
        {decoded && (
          <Textarea
            w="100%"
            h="60vh"
            value={JSON.stringify(decoded, null, 2)}
            isReadOnly
          />
        )}
      </Center>
    </Box>
  );
}

export default App;
