input.addEventListener("change", () => {
    for (const file of input.files) {
        const reader = new FileReader();
        reader.addEventListener("load", (e) => {
            console.log(e.target.result);
        });
        reader.readAsArrayBuffer(file);
    }
});