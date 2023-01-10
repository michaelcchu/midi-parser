function str(value, i, times) {return String.fromCharCode(value);}
function int(value, i, times) {return value * (2**8)**(times-1-i);}
function lit(value, i, times) {return value + ",";}

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
                let previousEventType;
                while (!endOfTrack) {
                    const e = {deltaTime: readVarLen(values)}
                    let firstValue = read(int, 0, values, 1);
                    if (firstValue < 128) {
                        if (previousEventType !== null) {
                            e.eventType = previousEventType;
                        } else {
                            console.log("error: previousEventType is null");
                        }
                    } else {
                        e.eventType = firstValue; 
                        if (firstValue !== 240) {
                            firstValue = read(int, 0, values, 1);
                        }
                    }
                    if (e.eventType < 160) {
                        e.noteNumber = firstValue;
                        e.velocity = read(int, 0, values, 1);
                    } else if (e.eventType < 176) {
                        e.noteNumber = firstValue;
                        e.afterTouch = read(int, 0, values, 1);
                    } else if (e.eventType < 192) {
                        e.controllerNumber = firstValue;
                        e.controllerValue = read(int, 0, values, 1);
                    } else if (e.eventType < 208) {
                        e.programNumber = firstValue;
                    } else if (e.eventType < 224) {
                        e.afterTouch = firstValue;
                    } else if (e.eventType < 240) {
                        e.pitchLSB = firstValue;
                        e.pitchMSB = read(int, 0, values, 1);
                    } else if (e.eventType === 255) {
                        e.metaType = firstValue;
                        e.length = readVarLen(values);
                        if (e.metaType === 0) {
                            e.numberMSB = read(int, 0, values, 1);
                            e.numberLSB = read(int, 0, values, 1);
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
                            console.log(read(lit, "", values, e.length));
                        }
                    } else if (e.eventType === 240 || e.eventType === 247) {
                        e.length = readVarLen(values);
                        const data = read(str, "", values, e.length);
                        console.log("eventType: " + e.eventType);
                    } else {
                        console.log("unknown eventType: " + e.eventType);
                    }
                    trackChunk.trackEventData.push(e);
                    previousEventType = e.eventType;
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