import { Flex, Heading, Spacer, Text, HStack, Image } from "@chakra-ui/react";

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
