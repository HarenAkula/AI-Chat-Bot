'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles';
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the your kitchen cooking assistant. You can ask me for recipes from all around the world. I can even customize them based on the ingredients you have. What are you planning to cook today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true)

   setMessage('')
   setMessages((messages) => [
     ...messages,
     { role: 'user', content: message },
     { role: 'assistant', content: '' },
   ])

   try {
     const response = await fetch('/api/chat', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify([...messages, { role: 'user', content: message }]),
     })

     if (!response.ok) {
       throw new Error('Network response was not ok')
     }

     const reader = response.body.getReader()
     const decoder = new TextDecoder()

     while (true) {
       const { done, value } = await reader.read()
       if (done) break
       const text = decoder.decode(value, { stream: true })
       setMessages((messages) => {
         let lastMessage = messages[messages.length - 1]
         let otherMessages = messages.slice(0, messages.length - 1)
         return [
           ...otherMessages,
           { ...lastMessage, content: lastMessage.content + text },
         ]
       })
     }
   } catch (error) {
     console.error('Error:', error)
     setMessages((messages) => [
       ...messages,
       { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
     ])
   }
   setIsLoading(false)
 }

  const handleKeyPress = (event) => {
     if (event.key === 'Enter' && !event.shiftKey) {
       event.preventDefault()
       sendMessage()
     }
   }

  return (
    
    <ThemeProvider theme={darkTheme}>
  <Box
    width="100vw"
    height="100vh"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    paddingX={2}
  >
    <Typography variant="h2" margin="auto" paddingY={2}>
      AI Recipe Generator
    </Typography>

    <Stack
      direction="column"
      width="100%"
      maxWidth="1200px"
      height="100%"
      margin="auto"
      paddingX={2}
      paddingY={2}
      spacing={3}
      border="solid"
      borderColor="whitesmoke"
      overflow="hidden"
    >
      <Stack
        direction="column"
        spacing={2}
        flexGrow={1}
        overflow="auto"
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent={
              message.role === 'assistant' ? 'flex-start' : 'flex-end'
            }
          >
            <Box
              bgcolor={
                message.role === 'assistant'
                  ? 'primary.dark'
                  : 'secondary.dark'
              }
              borderRadius={2}
              p={3}
              color="white"
              maxWidth="70%"
            >
              {message.content}
            </Box>
          </Box>
        ))}
      </Stack>

      <Stack direction="row" spacing={2} paddingY={2}>
        <TextField
          label="Message"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          placeholder="Enter your message..."
          disabled={isLoading}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </Stack>
    </Stack>
  </Box>
</ThemeProvider>

    // <ThemeProvider theme={darkTheme} >
    // <Box
    //   width="100vw"
    //   height="98vh"
    //   display="flex"
    //   flexDirection="column"
    //   justifyContent="center"
    //   alignItems="center"
    //   padding={2}
      
    // >      <Typography variant='h2' margin={'auto'}>AI Recipe Generator</Typography>

    //   <Stack
    //     direction={'column'}
    //     width="90vw"
    //     margin={'auto'}
    //     height="700px"
    //     p={2}
    //     spacing={3}
    //     padding={2}
    //   border={'solid'}
    //   borderColor={'whitesmoke'}
    //   >
    //     <Stack
    //       direction={'column'}
    //       spacing={2}
    //       flexGrow={1}
    //       overflow="auto"
    //       maxHeight="100%"
    //     >
    //       {messages.map((message, index) => (
    //         <Box
    //           key={index}
    //           display="flex"
    //           justifyContent={
    //             message.role === 'assistant' ? 'flex-start' : 'flex-end'
    //           }
    //         >
    //           <Box
    //             bgcolor={
    //               message.role === 'assistant'
    //                 ? 'primary.dark'
    //                 : 'secondary.dark'
    //             }
    //             borderRadius={2}
    //             p={3}
    //           >
    //             {message.content}
    //           </Box>
    //         </Box>
    //       ))}
    //     </Stack>
    //     <Stack direction={'row'} spacing={2} color={'white'}>
    //               <TextField
    //                 label="Message"
    //                 fullWidth
    //                 value={message}
    //                 onChange={(e) => setMessage(e.target.value)}
    //                 onKeyPress={handleKeyPress}
    //                 variant="outlined"
    //                 placeholder='Enter your Message...'
    //                 disabled={isLoading}
    //               />
    //       <Button
    //                   variant="contained"
    //                   onClick={sendMessage}
    //                   disabled={isLoading}
    //                 >
    //                   {isLoading ? 'Sending...' : 'Send'}
    //                 </Button>
    //     </Stack>
    //   </Stack>
    // </Box>
    // </ThemeProvider>

  )
}