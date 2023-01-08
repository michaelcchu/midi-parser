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
                    chunkSize: view.slice(i+4,i+8)
                }
                i+=8
                trackChunks.push(trackChunk);
            }

            const midi = {header:header, trackChunks:trackChunks};

            console.log(view);
            console.log(midi);

        });
        reader.readAsArrayBuffer(file);
    }
});