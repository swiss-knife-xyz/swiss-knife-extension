import { useState, useEffect } from "react";
import {
  Flex,
  Heading,
  Spacer,
  Text,
  HStack,
  Image,
  Box,
  Spinner,
  Center,
  Stack,
} from "@chakra-ui/react";
import { renderParams } from "./components/renderParams";
import { stringify } from "viem";
import { CopyToClipboard } from "./components/CopyToClipboard";

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
          <Box minW={"80%"}>
            {decoded.functionName &&
            decoded.functionName !== "__abi_decoded__" ? (
              <HStack>
                <Box fontSize={"1rem"}>
                  <Box fontSize={"xs"} color={"whiteAlpha.600"}>
                    function
                  </Box>
                  <Box>{decoded.functionName}</Box>
                </Box>
                <Spacer />
                <CopyToClipboard
                  textToCopy={JSON.stringify(
                    {
                      function: decoded.signature,
                      params: JSON.parse(stringify(decoded.rawArgs)),
                    },
                    undefined,
                    2
                  )}
                  labelText={"Copy params"}
                />
              </HStack>
            ) : null}
            <Stack mt={2} p={4} spacing={4} bg={"whiteAlpha.50"} rounded={"lg"}>
              {decoded.args.map((arg: any, i: number) => {
                return renderParams(i, arg);
              })}
            </Stack>
          </Box>
        )}
      </Center>
    </Box>
  );
}

export default App;
