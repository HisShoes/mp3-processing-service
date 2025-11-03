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

```bash
curl http://localhost:3000/file-upload -X POST -v -F upload=@./test-data/sample.mp3
```

