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
                    chunkId: read(str, "", values, 4), 
                    chunkSize: read(int, 0, values, 4),
                    trackEventData: []
                }
                let endOfTrack = false;
                while (!endOfTrack) {
                    const e = {
                        deltaTime: readVarLen(values),
                        eventType: read(int, 0, values, 1),
                    }
                    if ((e.eventType >= 128) && (e.eventType < 240)) {
                        e.parameter1 = read(int, 0, values, 1);
                        e.parameter2 = read(int, 0, values, 1);
                    } else if (e.eventType === 255) {
                        e.metaType = read(int, 0, values, 1);
                        e.length = readVarLen(values);
                        if (e.metaType === 0) {
                            e.msb = read(int, 0, values, 1);
                            e.lsb = read(int, 0, values, 1);
                        } else if (e.metaType >= 1 && e.metaType <= 7) {
                            e.text = read(str, "", values, e.length);
                        } else if (e.metaType === 32) {
                            e.channel = read(int, 0, values, 1);
                        } else if (e.metaType === 47) {
                            console.log("meta event: end of track");
                            endOfTrack = true;
                        } else if (e.metaType === 81) {
                            e.microsecondsPerQuarter = read(int, 0, values, 3);
                        } else if (e.metaType === 84) {
                            e.hours = read(int, 0, values, 1);
                            e.minutes = read(int, 0, values, 1);
                            e.seconds = read(int, 0, values, 1);
                            e.frames = read(int, 0, values, 1);
                            e.subframes = read(int, 0, values, 1);
                        } else if (e.metaType === 88) {
                            e.numerator = read(int, 0, values, 1);
                            e.denominator = read(int, 0, values, 1);
                            e.metronomePulse = read(int, 0, values, 1);
                            e.numberOf32ndsPerQuarter = read(int, 0, values, 1);
                        } else if (e.metaType === 89) {
                            e.key = read(int, 0, values, 1);
                            e.scale = read(int, 0, values, 1);
                        } else if (e.metaType === 127) {
                            e.data = read(str, "", values, e.length);
                        } else {
                            console.log("unknown metaType: " + e.metaType);
                        }
                    } else if (e.eventType === 240) {
                        e.length = readVarLen(values);
                        let data;
                        do {data = read(int, 0, values, 1);} 
                        while (data !== 247);
                    } else {
                        console.log("unknown eventType: " + e.eventType);
                    }
                    trackChunk.trackEventData.push(e);
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