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
  Button,
} from "@chakra-ui/react";
import { renderParams } from "./components/renderParams";
import { stringify } from "viem";
import { CopyToClipboard } from "./components/CopyToClipboard";
import { CloseIcon } from "@chakra-ui/icons";

const callViaServiceWorker = (msgObj: any) => {
  return new Promise((resolve) => {
    // send message to service-worker
    chrome.runtime.sendMessage(msgObj);

    // receive from service-worker
    chrome.runtime.onMessage.addListener((request) => {
      switch (request.type) {
        case `SP_GET_CURRENT_URL`: {
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

  // receive DECODE request from service-worker
  chrome.runtime.onMessage.addListener((request) => {
    console.log({ request });
    if (request.type === `SP_DECODE`) {
      const url = request.msg.url;
      decode(url);
    }
  });

  const decode = async (_url?: string) => {
    setDecoded(null);
    setIsLoading(true);
    try {
      // Request the current URL from the background script
      let url =
        _url ?? (await callViaServiceWorker({ type: "GET_CURRENT_URL" }));
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
      <Flex>
        <Button size="xs" variant="ghost" onClick={() => window.close()}>
          <CloseIcon />
        </Button>
      </Flex>
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
