# ThirdView

Type what you're looking for, and it finds the moment in the video. That's it, that's the whole app.


## Why this exists

Me and my friends have this thing where we watch movies and anime, but not together. That's why, when we find the crisp part, it just gets stuck in our brain, but not the timeline. And when we meet, everyone starts saying, but no one knows the exact timestamp.

That's why I built this: just upload, explain, and get it. Now we and our friends can do other things at that time instead of jsut randomly finding timestamp.


## What it actually does

- Upload a video, or just hit the sample button to try it with a demo clip, no upload needed
- type a short description of the scene you're thinking of
- It scans through the video and shows you the frames that match best, sorted by how close they are
- click any result and the video jumps right to that timestamp


## How it works

The browser grabs a frame from the video every couple of second. Each of those frames, along with whatever you typed, gets fed into an AI model that understands both images and text at the same time, so it can tell how well a picture matches a sentence. It scores every frame against your search and shows you the best ones. 

The part that actually matters here: all of this happens inside your browser tab. The video never gets uploaded anywhere, there's no server involved, nothing leaves your device. It's slower than a cloud version would be, but it's private and it's free.


## Credits

I didn't build the actual AI here, I just built the part around it. Full credit goes to:

-**CLIP**, the model that understands the connection between images and text built by OpenAI

-**Transformers.js**, built by Xenova and now maintained with Hugging Face, which is the reason a  model like this can even run directly in a browser tab instead of needing a backend server

## Running it yourself 

It's just static files, so:
1. Clone the repo
2. Serve the folder something like `npx serve`(opening `index.html` directly can cause issues with video seeking, so avoid double clicking it)
3. Drop your own video in and it upload, or use the sample button


If you want to swap the demo clip, just replace `sample.mp4` in the folder with your own short video.


## Heads up

- This is a side project, not a polished product, so expect some rough edges here and there
- Works best on a laptop, phones can slow down on longer videos
- The model downloads once the first time you open the page, that part depends on your internet, after that it's cached and loads instantly

## License

MIT, do whatever you want with it.