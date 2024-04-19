import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Flex,
  Heading,
  Spacer,
  Text,
  HStack,
  Image,
  Link,
  Box,
  Center,
} from "@chakra-ui/react";

function App() {
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
            <Image src="img/logo.png" w="2.2rem" />
            <Text>Swiss-Knife</Text>
          </HStack>
        </Heading>
        <Spacer flex="1" />
      </Flex>
      <Center mt="5rem" fontFamily={"Poppins"}>
        <HStack fontSize={"lg"}>
          <Text>Built by</Text>
          <Link
            onClick={() => {
              chrome.tabs.create({ url: "https://twitter.com/apoorvlathey" });
            }}
          >
            <HStack>
              <Text>@apoorvlathey</Text>
              <ExternalLinkIcon />
            </HStack>
          </Link>
        </HStack>
      </Center>
    </Box>
  );
}

export default App;
