function str(value, i, times) {return String.fromCharCode(value);}
function int(value, i, times) {return value * (2**8)**(times-1-i);}

function read(f, startValue, values, times) {
    let result = startValue;
    for (let i = 0; i < times; i++) {
        result += f(values.next().value, i, times);
    }
    return result;
}

function readVarLen(values) {
    const num = []; let byte; 
    do {byte = values.next().value;
        if (byte >= 128) {num.push(byte - 128);} else {num.push(byte);}
    } while (byte >= 128);
    return read(int, 0, num.values(), num.length);
}

input.addEventListener("change", () => {
    for (const file of input.files) {
        const reader = new FileReader();
        reader.addEventListener("load", (e) => {
            const view = new Uint8Array(e.target.result);
            const values = view.values();
            const header = {
                chunkId: read(str, "", values, 4), 
                chunkSize: read(int, 0, values, 4), 
                formatType: read(int, 0, values, 2),
                numberOfTracks: read(int, 0, values, 2), 
                timeDivision: read(int, 0, values, 2)
            };

            const trackChunks = [];
            for (let track = 0; track < header.numberOfTracks; track++) {
                const trackChunk = {
                    chunkID: read(str, "", values, 4), 
                    chunkSize: read(int, 0, values, 4),
                    trackEventData: []
                }
                while (true) {
                    const trackEvent = {
                        deltaTime: readVarLen(values),
                        eventType: read(int, 0, values, 1)
                    }
                    if ((trackEvent.eventType >= 80) && 
                        (trackEvent.eventType < 240)) {
                        trackEvent.parameter1 = read(int, 0, values, 1);
                        trackEvent.parameter2 = read(int, 0, values, 1);
                    } else if (eventType === 255) {
                        // meta event
                        trackEvent.metaEventType = read(int, 0, values, 1);
                        if (trackEvent.metaEventType === 0) {
                            trackEvent.msb = read(int, 0, values, 1);
                            trackEvent.lsb = read(int, 0, values, 1);
                        } else if (trackEvent.metaEventType === 1) {

                        }

                        // write response here
                    } else {
                        console.log("error");
                        // write response here
                    }
                    trackChunk.trackEventData.push(trackEvent);
                    break;
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