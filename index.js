function toInt(array) {
    let result = 0;
    for (let i = 0; i < array.length; i++) {
        result += array[i] * (2**8)**(array.length-1-i);
    }
    return result;
}

input.addEventListener("change", () => {
    for (const file of input.files) {
        const reader = new FileReader();
        reader.addEventListener("load", (e) => {
            const view = new Uint8Array(e.target.result);
            const header = {
                chunkId: view.slice(0,4),
                chunkSize: view.slice(4,8),
                formatType: view.slice(8,10),
                numberOfTracks: view.slice(10,12),
                timeDivision: view.slice(12,14)
            };
            const trackChunks = [];
            let i = 14;
            while (i < view.length) {
                const trackChunk = {
                    chunkID: view.slice(i,i+4),
                    chunkSize: view.slice(i+4,i+8),
                    trackEventData: []
                }
                i+=8
                const chunkEnd = i + toInt(trackChunk.chunkSize);
                while (i < chunkEnd) {
                    start = i; while (view[i] >= 128) {i++;} i++;
                    const trackEvent = {
                        deltaTime: view.slice(start,i),
                        eventType: view.slice(i,i+1),
                        midiChannel: view.slice(i,i+1),
                        parameter1: view.slice(i+1,i+2),
                        parameter2: view.slice(i+2,i+3)
                    }
                    trackChunk.trackEventData.push(trackEvent);
                    i+=3;
                }
                trackChunks.push(trackChunk);
            }
            const midi = {header:header, trackChunks:trackChunks};
            console.log(view);
            console.log(midi);
        });
        reader.readAsArrayBuffer(file);
    }
});