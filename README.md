# MP3 Processing Service

## Spec

* The application must host an endpoint at /file-upload that accepts an MP3 file upload via the POST method.
* The endpoint must successfully count the number of frames for MPEG Version 1 Audio Layer 3 files (This is almost universally the format for .mp3 files, including the provided sample).
* Ignore other MPEG file formats

API Response should be in the form:

```json
{
    "frameCount": number
}
```

## Tech Choices

* Typescript (required)
* Bun - JS runtime, package manager, bundler, test runner
* Hono - Lightweight API framework

### AI Usage

Co pilot was used for implementing bitwise operations in `mp3/parse-frame-header.ts` - This is exactly the kind of thing AI is great for. I looked up the spec and explained exactly what I needed, laid out the functions as I wanted them then got copilot to do the heavy lifting with bitwise ops. 

After generating the code I've done a pass to tidy up anything it got wrong, formatted weirdly or didn't work quite the way I wanted.

It also generated a variety of tests for the frame parsing functions, again great time save - generated a bunch of tests in no time at all.

A few tests either failed initially, or said they passed but didn't test what they said they would - I've done a quick pass so all should be passing and testing what they appear to

## Optimisations

I've allocated ~2-3 hours for this tech test, calling out things I would progress with if we were taking this further:

* More test data - have tested with provided MP3 but would be good to test with other data to verify
* Optimisations, essential for larger files and a production environment
    - Make it an async process - the user uploads an MP3 then the file is processed offline
    - Streaming larger files rather than loading whole files into memory
    - Loop through buffers using framesize rather than `+=1`, drastically cut down the loops

## Getting Started

### Installing and Running
#### Bun (Recommended)

To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

#### npm

### Testing the API

#### Manual

```sh
curl http://localhost:3000/file-upload -X POST -v -F upload=@./test-data/sample.mp3
```

#### Automated Tests

Avoiding duplicating the implementation while providing confidence that the endpoint works and the logic heavy functions work

Unit tests at 2 levels:
* API level - checks the endpoint works for test case, and "glue code" is all working to bring it together
* Lowest level functions - Check logic heavy functions are working independently with a variety of use cases


```sh
npm run test
```
